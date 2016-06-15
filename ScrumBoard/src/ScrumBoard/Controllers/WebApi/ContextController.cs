using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ScrumBoard.Models;

namespace ScrumBoard.Controllers.WebApi
{
    [Produces("application/json")]
    [Route("api/context")]
    public abstract class ContextController : Controller
    {
        protected SbDbContext Context;

        protected ContextController(SbDbContext context)
        {
            Context = context;
        }

        [HttpGet("since/{ticks}")]
        public OfflineContext GetByTicks(long ticks)
        {
            var date = new DateTime(ticks);
            var context = new OfflineContext
            {
                Columns = Context.Columns.Where(e => e.InsertDate >= date || e.UpdateDate >= date).ToList(),
                Jobs = Context.Jobs.Where(e => e.InsertDate >= date || e.UpdateDate >= date).ToList(),
                Projects = Context.Projects.Where(e => e.InsertDate >= date || e.UpdateDate >= date).ToList()
            };
            var entities = context.Columns.Cast<Entity>().Union(context.Jobs).Union(context.Projects);
            Response.Headers.Add("ticks",
                entities.Select(e => e.UpdateDate > e.InsertDate ? e.UpdateDate.Ticks : e.InsertDate.Ticks)
                    .Max()
                    .ToString());
            return context;
        }

        [HttpGet]
        public OfflineContext Get()
        {
            return GetByTicks(0);
        }
    }
}