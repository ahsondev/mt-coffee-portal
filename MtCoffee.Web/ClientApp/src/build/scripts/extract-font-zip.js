

const fs = require('fs');
const AdmZip = require('adm-zip');

const confOutput = require('dotenv').config();
Object.keys(confOutput.parsed || {}).forEach(k => {
  process.env[k] = (confOutput.parsed || {})[k];
});

const downloadsDir = process.env.DOWNLOADS_DIR || `${process.env.USERPROFILE}\\Downloads`;
const ClientAppDir = process.env.INIT_CWD;
const fontelloProjectDir = ClientAppDir + '\\src\\build\\scripts\\fontello';

const newestZipFile = fs.readdirSync(downloadsDir)
  .filter(file => file.startsWith('fontello') && file.endsWith('.zip'))
  .map(fileName => ({
    fileName: fileName,
    filePath: `${downloadsDir}\\${fileName}`,
    createTimeMs: fs.statSync(`${downloadsDir}\\${fileName}`).ctimeMs
  }))
  .reduce((prev, cur) => {
    if (prev === undefined) return cur;
    if (prev.createTimeMs < cur.createTimeMs) {
      return cur;
    } else {
      return prev;
    }
  });

const zip = new AdmZip(newestZipFile.filePath);
const fontelloFileName = newestZipFile.fileName.substring(0, newestZipFile.fileName.length - 4);
zip.extractEntryTo(`${fontelloFileName}/config.json`,`${fontelloProjectDir}`, false, /*overwrite*/true);
zip.extractEntryTo(`${fontelloFileName}/demo.html`,`public/assets`, false, /*overwrite*/true);
zip.extractEntryTo(`${fontelloFileName}/font/mtcoffee.eot`,`public/assets/font`, false, /*overwrite*/true);
zip.extractEntryTo(`${fontelloFileName}/font/mtcoffee.ttf`,`public/assets/font`, false, /*overwrite*/true);
zip.extractEntryTo(`${fontelloFileName}/font/mtcoffee.svg`,`public/assets/font`, false, /*overwrite*/true);
zip.extractEntryTo(`${fontelloFileName}/font/mtcoffee.woff`,`public/assets/font`, false, /*overwrite*/true);
zip.extractEntryTo(`${fontelloFileName}/font/mtcoffee.woff2`,`public/assets/font`, false, /*overwrite*/true);
zip.extractEntryTo(`${fontelloFileName}/css/animation.css`,`public/assets/font`, false, /*overwrite*/true);