using Dapper;
using MtCoffee.Common.Extensions;
using MtCoffee.Web.AppStart;
using MtCoffee.Web.Models;
using MySqlConnector;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace MtCoffee.Common.Utilities
{
    public static class SqlHelper
    {
        private static string GetCorrectPropertyName<T, P>(Expression<Func<T, P>> expression)
        {
            if (expression.Body is MemberExpression)
            {
                return ((MemberExpression) expression.Body).Member.Name;
            }
            else
            {
                var op = ((UnaryExpression) expression.Body).Operand;
                return ((MemberExpression) op).Member.Name;
            }
        }

        public static string GetUpdateQuery<TModel>(string table, Expression<Func<TModel, int?>> expression)
        {
            string idName = GetCorrectPropertyName<TModel, int?>(expression).ToCamelCase();
            var propNames = typeof(TModel).GetProperties()
                .Where(p => !p.GetGetMethod().IsVirtual)
                .Select(p => p.Name.ToCamelCase());
            string updateStr = $"UPDATE `{table}` SET {string.Join(", ", propNames.Select(n => $"`{n}` = @{n}"))} WHERE {idName} = @{idName}";
            return updateStr;
        }

        public static string GetCreateQuery<TModel>(string table, Expression<Func<TModel, int?>> expression)
        {
            string idName = GetCorrectPropertyName<TModel, int?>(expression).ToCamelCase();
            var propNames = typeof(TModel).GetProperties()
                .Where(p => !p.GetGetMethod().IsVirtual)
                .Select(p => p.Name.ToCamelCase()).Where(n => n != idName);
            string updateStr = $"INSERT INTO `{table}` ({string.Join(", ", propNames.Select(pn => $"`{pn}`"))}) VALUES ({string.Join(", ", propNames.Select(n => $"@{n}"))}); SELECT LAST_INSERT_ID();";
            return updateStr;
        }

        public static Func<TModel, Task<JsonPayload<int>>> CreateSaveQuery<TModel>(string table, Expression<Func<TModel, int?>> expression)
        {
            string idName = GetCorrectPropertyName<TModel, int?>(expression).ToCamelCase();
            var propName = typeof(TModel).GetProperty(idName);
            string updateQuery = SqlHelper.GetUpdateQuery(table, expression);
            string createQuery = SqlHelper.GetCreateQuery(table, expression);

            return async (TModel model) =>
            {
                using (var conn = new MySqlConnection(Config.Instance.SqlConnectionString.Value))
                {
                    int? idVal = propName.GetValue(model) as int?;
                    if (idVal != null)
                    {
                        await conn.ExecuteAsync(updateQuery, model);
                    }
                    else
                    {
                        int rowId = (await conn.QueryAsync<int>(createQuery, model)).Single();
                        propName.SetValue(model, rowId);
                    }

                    return new JsonPayload<int>(idVal.Value);
                }
            };
        }
    }
}
