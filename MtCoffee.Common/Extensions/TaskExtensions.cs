using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace MtCoffee.Common.Extensions
{
    public static class TaskExtensions
    {
    }

    public static class TaskEx
    {
        public static async Task<(T1, T2)> WhenAll<T1, T2>(Task<T1> t1, Task<T2> t2)
        {
            return (await t1, await t2);
        }

        public static async Task<(T1, T2, T3)> WhenAll<T1, T2, T3>(Task<T1> t1, Task<T2> t2, Task<T3> t3)
        {
            return (await t1, await t2, await t3);
        }

        public static async Task<(T1, T2, T3, T4)> WhenAll<T1, T2, T3, T4, T5, T6>(Task<T1> t1, Task<T2> t2, Task<T3> t3, Task<T4> t4)
        {
            return (await t1, await t2, await t3, await t4);
        }

        public static async Task<(T1, T2, T3, T4, T5)> WhenAll<T1, T2, T3, T4, T5>(Task<T1> t1, Task<T2> t2, Task<T3> t3, Task<T4> t4, Task<T5> t5)
        {
            return (await t1, await t2, await t3, await t4, await t5);
        }

        public static async Task<(T1, T2, T3, T4, T5, T6)> WhenAll<T1, T2, T3, T4, T5, T6>(Task<T1> t1, Task<T2> t2, Task<T3> t3, Task<T4> t4, Task<T5> t5, Task<T6> t6)
        {
            return (await t1, await t2, await t3, await t4, await t5, await t6);
        }
    }
}
