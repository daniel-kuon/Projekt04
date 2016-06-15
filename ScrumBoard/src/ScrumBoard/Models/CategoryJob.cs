using Microsoft.EntityFrameworkCore;

namespace ScrumBoard.Models
{
    public class CategoryJob :IEntity
    {

        public int? JobId { get; set; }
        public Job Job { get; set; }
        public int? CategoryId { get; set; }
        public Category Category { get; set; }


        public bool RemoveFromContext(SbDbContext context)
        {
            if (context.Entry(context).State == EntityState.Deleted)
                return false;
            context.Remove(this);
            return true;
        }

        public bool AddOrUpdate(SbDbContext context)
        {
            if (JobId == null || CategoryId == null)
                context.Add(this);
            return true;
        }
    }
}