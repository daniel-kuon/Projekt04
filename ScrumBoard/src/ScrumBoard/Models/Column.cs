using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace ScrumBoard.Models
{
    public class Column : Entity
    {
        [Required]
        public string Name { get; set; }
        public string Description { get; set; }
        public Project Project { get; set; }
        public int ProjectId { get; set; }
        public List<Job> Jobs { get; set; }=new List<Job>();
        public bool IsDummyColumn { get; set; }
        public string Color { get; set; }
        public int Index { get; set; }
        
        public override bool RemoveFromContext(SbDbContext context)
        {
            if (IsDummyColumn)
                return false;
            if (!base.RemoveFromContext(context))
                return false;
            var dummyCol = context.Columns.First(c => c.ProjectId == ProjectId && c.IsDummyColumn);
            foreach (Job job in context.Jobs.Where(j=>j.ColumnId==Id))
            {
                job.Column = dummyCol;
                job.ColumnId = dummyCol.Id.Value;
            }
            return true;
        }
    }
}
