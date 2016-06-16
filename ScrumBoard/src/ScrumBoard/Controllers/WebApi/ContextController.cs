using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ScrumBoard.Models;

namespace ScrumBoard.Controllers.WebApi
{
    [Produces("application/json")]
    [Route("api/context")]
    public class ContextController : Controller
    {
        protected SbDbContext Context;

        public ContextController(SbDbContext context)
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
                Projects = Context.Projects.Where(e => e.InsertDate >= date || e.UpdateDate >= date).ToList(),
                Categories = Context.Categories.Where(e => e.InsertDate >= date || e.UpdateDate >= date).ToList(),
                CategoryJobs = Context.CategoryJobs.Where(e => e.InsertDate >= date).ToList(),
                ChatMessages = Context.ChatMessages.Where(e => e.InsertDate >= date).ToList()
            };
            context.Columns.ForEach(c =>
            {
                c.Project = null;
                c.Jobs.Clear();
            });
            context.Projects.ForEach(p => { p.Columns.Clear(); });
            context.Jobs.ForEach(j =>
            {
                j.Categories.Clear();
                j.CategoriesJobs.Clear();
                j.Column = null;
            });
            context.CategoryJobs.ForEach(cJ =>
            {
                cJ.Category = null;
                cJ.Job = null;
            });
            context.ChatMessages.ForEach(cM=>cM.Project=null);
            var entities = context.Columns.Cast<IEntity>().Union(context.Jobs).Union(context.Projects).Union(context.Categories).Union(context.CategoryJobs);
            Response.Headers.Add("ticks",
                (entities.Any() ? entities.Select(e => e.UpdateDate > e.InsertDate ? e.UpdateDate.Ticks : e.InsertDate.Ticks)
                    .Max() : 0)
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