using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using ScrumBoard.Controllers.WebApi;

namespace ScrumBoard.Models
{
    public abstract class Entity:IEntity
    {
        [NotMapped]
        public int? ClientId { get; set; }

        [NotMapped]
        public bool? ProcessOnSever { get; set; }

        

        [Key]
        public int? Id { get; set; }

        public DateTime InsertDate { get; set; }

        public DateTime UpdateDate { get; set; }
                


        [NotMapped]
        public string Type => this.GetType().Name;


        public virtual bool RemoveFromContext(SbDbContext context)
        {
            if (Id == null || context.Entry(this).State == EntityState.Deleted)
                return false;
            context.Remove(this);
            ContextController.AddDeletedEntity(this);
            return true;
        }

        public virtual bool AddOrUpdate(SbDbContext context)
        {
            if (ProcessOnSever == false)
            {
                context.Attach(this);
                return false;
            }
            if (Id == null)
            {
                if (context.Entry(this).State == EntityState.Added)
                    return false;
                context.Add(this);
                InsertDate = DateTime.Now;
            }
            else if (Id < 0)
                return false;
            else
            {
                if (context.Entry(this).State == EntityState.Modified)
                    return false;
                UpdateDate = DateTime.Now;
                context.Update(this);
            }
            return true;
        }



    }
}