using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ScrumBoard.Controllers.WebApi;

namespace ScrumBoard.Models
{
    public class CategoryJob :IEntity
    {

        public int? JobId { get; set; }
        public Job Job { get; set; }
        public int? CategoryId { get; set; }
        public Category Category { get; set; }

        public DateTime InsertDate { get; set; }
        public DateTime UpdateDate { get; set; }
       
        public bool RemoveFromContext(SbDbContext context)
        {
            if (context.Entry(this).State == EntityState.Deleted)
                return false;
            context.Remove(this);
            ContextController.AddDeletedEntity(this);
            return true;
        }

        public bool AddOrUpdate(SbDbContext context)
        {
            if (!context.CategoryJobs.Any(cJ=>cJ.JobId==JobId && cJ.CategoryId==CategoryId))
            {
                context.Add(this);
                InsertDate = DateTime.Now;
                Job?.AddOrUpdate(context);
                Category?.AddOrUpdate(context);
            }
            return true;
        }
    }
}