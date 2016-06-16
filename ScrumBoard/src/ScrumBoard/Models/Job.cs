using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Microsoft.DotNet.Tools.Compiler;

namespace ScrumBoard.Models
{
    public class Job : Entity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public Column Column { get; set; }
        public int ColumnId { get; set; }
        [NotMapped]
        public List<Category> Categories { get; set; }= new List<Category>();
        public List<CategoryJob> CategoriesJobs { get; set; }= new List<CategoryJob>();
        //public ApplicationUser ApplicationUser { get; set; }
        //public Guid? ApplicationUserId { get; set; }

        private void FixCategories(SbDbContext context)
        {
            CategoriesJobs = context.Set<CategoryJob>().Where(c => c.JobId == Id).ToList();
            CategoriesJobs.AddRange(Categories.Where(i => CategoriesJobs.All(c => c.CategoryId != i.Id)).Select(i => new CategoryJob() { CategoryId = i.Id, Job = Id!=null ?null : this, JobId = Id}));
            CategoriesJobs.Where(aI => Categories.All(i => aI.CategoryId != i.Id)).ToList().ForEach(aI => aI.RemoveFromContext(context));
        }

        public override bool RemoveFromContext(SbDbContext context)
        {
            if (!base.RemoveFromContext(context))
                return false;
            FixCategories(context);
            CategoriesJobs.ForEach(cJ=>cJ.RemoveFromContext(context));

            return true;
        }

        public override bool AddOrUpdate(SbDbContext context)
        {
            if (!base.AddOrUpdate(context))
                return false;
            FixCategories(context);
            CategoriesJobs.ForEach(cJ => cJ.AddOrUpdate(context));
            return true;
        }
    }
}
