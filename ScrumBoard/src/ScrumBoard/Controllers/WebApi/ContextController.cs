using System;
using System.Collections.Generic;
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

        private static List<IEntity> DeletedEntities { get; } = new List<IEntity>();

        public static void AddDeletedEntity(IEntity entity)
        {
            entity.UpdateDate = DateTime.Now;
            DeletedEntities.Add(entity);
        }

        [HttpGet("since/{ticks}")]
        public OfflineContext GetByTicks(long ticks)
        {
            var date = new DateTime(ticks);
            ticks = DateTime.Now.Ticks;
            var context = new OfflineContext
            {
                Columns = Context.Columns.Where(e => e.InsertDate >= date || e.UpdateDate >= date).ToList(),
                Jobs = Context.Jobs.Where(e => e.InsertDate >= date || e.UpdateDate >= date).ToList(),
                Projects = Context.Projects.Where(e => e.InsertDate >= date || e.UpdateDate >= date).ToList(),
                Categories = Context.Categories.Where(e => e.InsertDate >= date || e.UpdateDate >= date).ToList(),
                CategoryJobs = Context.CategoryJobs.Where(e => e.InsertDate >= date).ToList(),
                ChatMessages = Context.ChatMessages.Where(e => e.InsertDate >= date).ToList(),
                DeletedCategoryJobs = DeletedEntities.OfType<CategoryJob>().Where(e => e.UpdateDate >= date).ToList(),
                DeletedChatMessages = DeletedEntities.OfType<ChatMessage>().Where(e => e.UpdateDate >= date).ToList(),
                DeletedJobs = DeletedEntities.OfType<Job>().Where(e => e.UpdateDate >= date).ToList(),
                DeletedProjects = DeletedEntities.OfType<Project>().Where(e => e.UpdateDate >= date).ToList(),
                DeletedColumns = DeletedEntities.OfType<Column>().Where(e => e.UpdateDate >= date).ToList(),
                DeletedCategories = DeletedEntities.OfType<Category>().Where(e => e.UpdateDate >= date).ToList()
            };
            context.Columns.Union(context.DeletedColumns).ToList().ForEach(c =>
            {
                c.Project = null;
                c.Jobs.Clear();
            });
            context.Projects.Union(context.DeletedProjects).ToList().ForEach(p =>
            {
                p.Columns.Clear();
                p.ChatMessages.Clear();
            });
            context.Jobs.Union(context.DeletedJobs).ToList().ForEach(j =>
            {
                j.Categories.Clear();
                j.CategoriesJobs.Clear();
                j.Column = null;
            });
            context.CategoryJobs.Union(context.DeletedCategoryJobs).ToList().ForEach(cJ =>
            {
                cJ.Category = null;
                cJ.Job = null;
            });
            context.ChatMessages.Union(context.DeletedChatMessages).ToList().ForEach(cM =>
                cM.Project = null);
            IEnumerable<IEntity> entities =
                context.Columns.Cast<IEntity>()
                    .Union(context.DeletedColumns)
                    .Union(context.Jobs)
                    .Union(context.DeletedJobs)
                    .Union(context.Projects)
                    .Union(context.DeletedProjects)
                    .Union(context.Categories)
                    .Union(context.DeletedCategories)
                    .Union(context.CategoryJobs)
                    .Union(context.DeletedCategoryJobs)
                    .Union(context.ChatMessages)
                    .Union(context.DeletedChatMessages);
            Response.Headers.Add("ticks",
                Math.Max(entities.Any()
                    ? entities.Select(e => e.UpdateDate > e.InsertDate ? e.UpdateDate.Ticks : e.InsertDate.Ticks)
                        .Max()+1
                    : 0, ticks)
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