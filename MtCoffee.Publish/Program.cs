﻿using System;

using FluentFTP;
using Renci.SshNet;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using MtCoffee.Common;
using System.Configuration;
using System.Threading;
using System.IO.Compression;
using System.Diagnostics;

namespace MtCoffee.Publish
{
    public static class StopwatchExtension
    {
        public static string ToPrefix(this Stopwatch sw)
        {
            return Math.Round(sw.Elapsed.TotalSeconds, 1).ToString().PadLeft(3, '0') + "s    ";
        }

        public static void WriteLine(this Stopwatch sw, string msg)
        {
            string prefix = Math.Round(sw.Elapsed.TotalSeconds, 1).ToString().PadLeft(3, '0') + "s    ";
            Console.WriteLine(prefix + msg);
        }
    }

    class Program
    {
        //cp -a ./mvc.lumengaming.com/. ./mvc.lumengaming.com-deploy/
        private const string DEPLOY_DIR = "./portal.mtcoffee.net-deploy";
        private const string ORIG_DIR = "./portal.mtcoffee.net";
        private const string SSH_WORKINGDIR_ROOT = "/var/www/vhosts/mtcoffee.net";
        private const string SERVICE_NAME = "portal.mtcoffee.net.service";
        private const string FTP_MAIN_TO_CHMOD = "MtCoffee.Web";
        private const string CHOWN = "mtcoffee:psacln";
        private static readonly string FTP_USERNAME = "RrxBPb/PFg+ZRKZd8/CHKA==".DecryptAes();
        private static readonly string FTP_PASSWORD = "NcBspLzBNF9hdwi0cpGbkHK2+HTb9HmI5gUCeGLFxHCKHbYqeiE+HaknTUaai4B3".DecryptAes();
        private static readonly string SSH_USERNAME = "YCx1rUaloAg2ZRuZZhSU6Q==".DecryptAes();
        private static readonly string SSH_PASSWORD = "UQyrlaSijTPWZSpPWT+TAQ==".DecryptAes();
        private const bool IS_ZIPPING_ENABLED = true;
        private static readonly Stopwatch sw = new Stopwatch();

        // "D:\\git\\portal.mtcoffee.net\\MtCoffee\\publish";
        private static string UPLOAD_FROM_DIR = Program.GetUploadSourceDirectoryPath();


        static void Main()
        {

            sw.Start();
            Program.sw.WriteLine("Connecting FTP ....");
            if (!ORIG_DIR.StartsWith("./") || ORIG_DIR.EndsWith("/")) throw new ArgumentException("INVALID ORIG_DIR");
            if (!DEPLOY_DIR.StartsWith("./") || DEPLOY_DIR.EndsWith("/")) throw new ArgumentException("INVALID DEPLOY_DIR");

            using (SshClient ssh = new SshClient("wc.lumengaming.com", SSH_USERNAME, SSH_PASSWORD))
            {
                ssh.Connect();
                string result = "";
                result = ssh.RunCommand($"cd {SSH_WORKINGDIR_ROOT}; [ -d {DEPLOY_DIR} ] && echo exists || echo does not exist;").Result.Trim();

                // Remove old dir if it still  exists.
                bool deployDirStillExists = result == "exists";
                if (deployDirStillExists)
                {
                    result = ssh.RunCommand($"cd {SSH_WORKINGDIR_ROOT};  rm -rf {DEPLOY_DIR};").Result;
                }

                var ftp = GetFtpClientFromPool();
                ftp.CreateDirectory(DEPLOY_DIR);
                ReturnFtpClientToPool(ftp);

                var dir = new DirectoryInfo(UPLOAD_FROM_DIR);
                if (IS_ZIPPING_ENABLED)
                {
                    RecursiveZipUpload(dir, ssh);
                } 
                else
                {
                    RecursiveUpload(dir, DEPLOY_DIR);
                }

                Program.sw.WriteLine("Stopping old service");
                string svcStopResult = ssh.CreateCommand($"systemctl stop {SERVICE_NAME}").Execute();

                Program.sw.WriteLine("Deprecating ancient deployment");
                result = ssh.RunCommand($"cd {SSH_WORKINGDIR_ROOT}; mv {ORIG_DIR} {ORIG_DIR}-old;").Result;

                Program.sw.WriteLine("Swapping to new deployment");
                result = ssh.RunCommand($"cd {SSH_WORKINGDIR_ROOT}; mv {DEPLOY_DIR} {ORIG_DIR};").Result;

                Program.sw.WriteLine("Cleaning up old files");
                result = ssh.RunCommand($"cd {SSH_WORKINGDIR_ROOT};  rm -rf {ORIG_DIR}-old;").Result;

                Program.sw.WriteLine("Setting permissions on the main executable.");
                result = ssh.RunCommand($"cd {SSH_WORKINGDIR_ROOT}/{ORIG_DIR}; chmod 754 ./{FTP_MAIN_TO_CHMOD};").Result;

                Program.sw.WriteLine("Starting new service");
                string svcStartResult = ssh.CreateCommand($"systemctl start {SERVICE_NAME}").Execute();
            }

            clients.ForEach(x => x.Dispose());
            Program.sw.WriteLine("Finished!");
            sw.Stop();
        }


        private readonly static int MAX_CONCURRENT_UPLOADS = 10;
        private static int CUR_CONCURRENT_UPLOADS = 0;
        private readonly static List<FtpClient> clients = new List<FtpClient>();
        private static FtpClient GetFtpClientFromPool()
        {
            lock (clients)
            {
                if (CUR_CONCURRENT_UPLOADS <= MAX_CONCURRENT_UPLOADS)
                {
                    if (clients.Count > 0)
                    {
                        CUR_CONCURRENT_UPLOADS++;
                        var rt = clients[0];
                        clients.RemoveAt(0);
                        return rt;
                    }
                    else
                    {
                        CUR_CONCURRENT_UPLOADS++;
                        var ftp = new FtpClient("wc.lumengaming.com", 21, FTP_USERNAME, FTP_PASSWORD)
                        {
                            UploadRateLimit = 0,
                            SocketKeepAlive = true
                        };

                        ftp.Connect();
                        return ftp;
                    }
                }
            }
            return null;
        }

        private static void ReturnFtpClientToPool(FtpClient ftp)
        {
            CUR_CONCURRENT_UPLOADS--;
            lock (clients)
            {
                clients.Add(ftp);
            }
        }

        private static readonly object padlock = new {};
        private static void SetConsoleLine(int row, string text, ConsoleColor? color = null)
        {
            lock (padlock)
            {
                if (row == -1)
                {
                    Program.sw.WriteLine(text);
                    return;
                }

                int orig = Console.CursorTop;
                ConsoleColor cOrig = Console.ForegroundColor;
                Console.SetCursorPosition(0, row);
                Console.Write(new string(' ', Console.WindowWidth));

                if (color != null) Console.ForegroundColor = color.Value;
                Console.SetCursorPosition(0, row);
                Program.sw.WriteLine(text);
                Console.SetCursorPosition(0, orig);

                if (color != null) Console.ForegroundColor = cOrig;
            }
        }

        private static void RecursiveZipUpload(DirectoryInfo dir, SshClient ssh)
        {
            Program.sw.WriteLine("\n-----------------  Zipping files  -----------------------");
            var localZipFilePath = Path.Combine(dir.Parent.FullName, "deployment.zip");
            var remoteZipFilePath = DEPLOY_DIR + "/deployment.zip";

            if (File.Exists(localZipFilePath))
            {
                File.Delete(localZipFilePath);
            }

            ZipFile.CreateFromDirectory(dir.FullName, localZipFilePath, CompressionLevel.Optimal, false);
            var ftp = GetFtpClientFromPool();
            while (ftp == null)
            {
                Console.WriteLine(Program.sw.ToPrefix() + $"Waiting for FTPClient.", ConsoleColor.Red);
                ftp = GetFtpClientFromPool();
            }

            try
            {
                var file = new FileInfo(localZipFilePath);
                var kb = file.Length / 1024;
                Console.WriteLine(Program.sw.ToPrefix() + $"Uploading {kb}kb... {localZipFilePath}", ConsoleColor.Yellow);
                ftp.UploadFile(localZipFilePath, remoteZipFilePath, FluentFTP.FtpRemoteExists.Overwrite, true, FtpVerify.None);

                Program.sw.WriteLine("Unzipping...");
                var cmdResult = ssh.RunCommand($"cd {SSH_WORKINGDIR_ROOT}/{DEPLOY_DIR};  unzip deployment.zip;").Result;

                Program.sw.WriteLine("Removing zip file on remote server.");
                var cmdResult2 = ssh.RunCommand($"cd {SSH_WORKINGDIR_ROOT}/{DEPLOY_DIR}; rm ./deployment.zip;").Result;

                Program.sw.WriteLine($"Chowning the unzipped files to {CHOWN}");
                var cmdResult3 = ssh.RunCommand($"cd {SSH_WORKINGDIR_ROOT}; chown -R {CHOWN} {DEPLOY_DIR};").Result;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
            }
            ReturnFtpClientToPool(ftp);

            // Clean up the useless file afterwards.
            if (File.Exists(localZipFilePath))
            {
                Program.sw.WriteLine("Cleaning up temporary file");
                File.Delete(localZipFilePath);
            }
        }


        private static void RecursiveUpload(DirectoryInfo dir, string deployFolder)
        {
            var toUpload = new Dictionary<string, string>();
            RecursiveUploadInit(dir, deployFolder, ref toUpload);
            Console.Write("\n-----------------  Uploading Files  -----------------------");

            int cursorPos;

            try
            {
                cursorPos = Console.CursorTop;
            }
            catch (IOException)
            {
                cursorPos = -1; // no console supported.
            }

            toUpload.ToList().AsParallel<KeyValuePair<string, string>>()
                .WithDegreeOfParallelism(Math.Min(MAX_CONCURRENT_UPLOADS - 1, toUpload.Count))
                .ForAll(kvp =>
                {
                    int curConsoleLine = cursorPos != -1 ? Interlocked.Increment(ref cursorPos) : -1;
                    long kb = (new FileInfo(kvp.Key)).Length / 1024;
                    if (cursorPos != -1) SetConsoleLine(curConsoleLine, $"Starting {kb}kb... {kvp.Value}");

                    var ftp = GetFtpClientFromPool();
                    while (ftp == null)
                    {
                        Console.SetCursorPosition(0, curConsoleLine);
                        SetConsoleLine(curConsoleLine, $"Waiting for FTPClient. {kvp.Value}", ConsoleColor.Red);
                        Task.Delay(150);
                        ftp = GetFtpClientFromPool();
                    }

                    try
                    {
                        SetConsoleLine(curConsoleLine, $"Uploading {kb}kb... {kvp.Value}", ConsoleColor.Yellow);
                        ftp.UploadFile(kvp.Key, kvp.Value, FluentFTP.FtpRemoteExists.Overwrite, true, FtpVerify.None);
                    }
                    catch (Exception ex)
                    {
                        Console.Error.WriteLine(ex);
                    }
                    ReturnFtpClientToPool(ftp);
                    if (cursorPos != -1) SetConsoleLine(curConsoleLine, $"Finished {kb}kb... {kvp.Value}", ConsoleColor.Green);
                });

            if (cursorPos != -1) Console.SetCursorPosition(0, cursorPos + 1);
            Program.sw.WriteLine("\n--------  Switching deployment slots  ---------------------");
        }

        private static void RecursiveUploadInit(DirectoryInfo dir, string deployFolder, ref Dictionary<string, string> toUpload)
        {
            Console.WriteLine("Scanning files in... {0}", deployFolder.Replace(DEPLOY_DIR, ""));
            var filesInDir = dir.EnumerateFiles().Select(x => x.FullName);
            var dirsInDir = dir.EnumerateDirectories();

            var ftpO = GetFtpClientFromPool();
            if (!ftpO.DirectoryExists(deployFolder))
            {
                ftpO.CreateDirectory(deployFolder);
            }
            ReturnFtpClientToPool(ftpO);

            foreach (var fi in filesInDir)
            {
                string fiFi = deployFolder + "/" + fi.Split('\\').Last();
                toUpload.Add(fi, fiFi);
            }

            foreach (var dirr in dirsInDir)
            {
                RecursiveUploadInit(dirr, deployFolder + "/" + dirr.Name, ref toUpload);
            }
        }

        private static string GetUploadSourceDirectoryPath()
        {
            var currentDir = new FileInfo(new Uri(System.Reflection.Assembly.GetExecutingAssembly().Location).LocalPath).Directory;
            while (currentDir?.Parent != null)
            {
                var dirs = currentDir.GetDirectories();
                if (dirs.Any(d => d.Name == "publish") && dirs.Any(d => d.Name == "MtCoffee.Publish"))
                {
                    // This is the dir we want.
                    return dirs.FirstOrDefault(d => d.Name == "publish")?.FullName;
                }
                else
                {
                    currentDir = currentDir.Parent;
                }
            }

            return null;
        }
    }
}