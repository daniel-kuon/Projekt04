using System;

namespace ScrumBoard.Models
{
    public interface IEntity
    {
        bool RemoveFromContext(SbDbContext context);
        bool AddOrUpdate(SbDbContext context);

        DateTime InsertDate { get; set; }
        DateTime UpdateDate { get; set; }
        
    }
}