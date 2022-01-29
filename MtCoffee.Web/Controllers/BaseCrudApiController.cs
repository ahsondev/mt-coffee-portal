using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using MtCoffee.Common.Extensions;
using MtCoffee.Common.Utilities;
using MtCoffee.Web.AppStart;
using MtCoffee.Web.Models;
using MySqlConnector;
using Newtonsoft.Json;

namespace MtCoffee.Web.Controllers
{
    // TODO: Figure out how to enable a custom [FromBody] tag that allows... custom model binding from form or from body.

    public class BaseCrudApiController<TModel> : BaseApiController
    {
        protected string table;
        private Expression<Func<TModel, int?>> primaryKeyExpression;
        private Func<TModel, int?> getPrimaryKeyValue;
        private string updateQuery;
        private string createQuery;

        public BaseCrudApiController(string tableName, Expression<Func<TModel, int?>> primaryKey)
        {
            this.table = tableName;
            this.primaryKeyExpression = primaryKey;
            this.getPrimaryKeyValue = this.primaryKeyExpression.Compile();
            this.updateQuery = SqlHelper.GetUpdateQuery<TModel>(tableName, primaryKey);
            this.createQuery = SqlHelper.GetCreateQuery<TModel>(tableName, primaryKey);
        }

        protected virtual int? GetOrganizationId()
        {
            if (!this.User.Identity.IsAuthenticated)
            {
                return null;
            }

            string orgs = this.User.Claims.FirstOrDefault(c => c.Type == Constants.CLAIM_ORGANIZATION_ID)?.Value ?? "[]";
            var orgIds = JsonConvert.DeserializeObject<List<int>>(orgs);
            if (!orgIds.Any()) return null;

            return orgIds.FirstOrDefault();
        }

        protected virtual List<int> GetOrganizationIds()
        {
            if (!this.User.Identity.IsAuthenticated)
            {
                return new List<int>();
            }

            string orgs = this.User.Claims.FirstOrDefault(c => c.Type == Constants.CLAIM_ORGANIZATION_ID)?.Value ?? "[]";
            var orgIds = JsonConvert.DeserializeObject<List<int>>(orgs);
            return orgIds;
        }


        [HttpGet]
        public virtual async Task<JsonPayload<List<TModel>>> List()
        {
            using (var conn = this.GetConnection())
            {
                var payloadRs = await conn.QueryAsync<TModel>($"SELECT * FROM `{this.table}`");
                var payload = payloadRs.ToList();

                return new JsonPayload<List<TModel>>(payload);
            }
        }

        [HttpPost]
        public virtual async Task<JsonPayload<int>> Create([FromBody]TModel model)
        {
            using (var conn = this.GetConnection())
            {
                int rowId = (await conn.QueryAsync<int>(this.createQuery, model)).Single();
                await this.LogAction($"Created {typeof(TModel).Name} ({rowId})");
                return new JsonPayload<int>(rowId);
            }
        }

        [HttpPut]
        public virtual async Task<JsonPayload<int?>> Update([FromBody] TModel model)
        {
            using (var conn = this.GetConnection())
            {
                int? modelId = this.getPrimaryKeyValue(model);
                if (modelId == null) return new JsonPayload<int?>(null, "Model ID must be set for update operations.");
                await conn.ExecuteAsync(this.updateQuery, model);
                await this.LogAction($"Updated {typeof(TModel).Name} ({modelId})");
                return new JsonPayload<int?>(modelId.Value);
            }
        }

        [HttpPost]
        public virtual async Task<JsonPayload<int?>> Save([FromBody]TModel model)
        {
            using (var conn = this.GetConnection())
            {
                int? modelId = this.getPrimaryKeyValue(model);
                if (modelId != null && modelId.Value > 0)
                {
                    await conn.ExecuteAsync(this.updateQuery, model);
                    await this.LogAction($"Updated {typeof(TModel).Name} ({modelId})");
                }
                else
                {
                    int rowId = (await conn.QueryAsync<int>(this.createQuery, model)).Single();
                    await this.LogAction($"Created {typeof(TModel).Name} ({rowId})");
                    modelId = rowId;
                }

                return new JsonPayload<int?>(modelId.Value);
            }
        }

        [HttpDelete]
        public virtual async Task<JsonPayload<int>> Delete([FromQuery] int id)
        {
            using (var conn = this.GetConnection())
            {
                await this.LogAction($"Deleted {typeof(TModel).Name} ({id})");
                var rs = await conn.ExecuteAsync($"DELETE FROM `{this.table}` WHERE Id = @Id", new { Id = id });
                return new JsonPayload<int>(rs);
            }
        }

        [HttpDelete]
        public virtual async Task<JsonPayload<int>> DeleteBulk([FromBody] RequestPayload<int[]> model)
        {
            using (var conn = this.GetConnection())
            {
                var rs = await conn.ExecuteAsync($"DELETE FROM `{this.table}` WHERE Id IN @Ids", new { Ids = model.Payload });
                return new JsonPayload<int>(rs);
            }
        }
    }
}