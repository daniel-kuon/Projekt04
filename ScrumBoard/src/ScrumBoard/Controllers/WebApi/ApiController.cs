using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScrumBoard.Models;

namespace ScrumBoard.Controllers.WebApi
{
    [Produces("application/json")]
    public abstract class ApiController<T> : Controller where T : Entity
    {
        protected SbDbContext Context;

        protected ApiController(SbDbContext context)
        {
            Context = context;
        }

        [HttpGet("since/{ticks}")]
        public virtual IEnumerable<T> GetByTicks(long ticks)
        {
            var date = new DateTime(ticks);
            var entities = Context.Set<T>().Where(e => e.InsertDate >= date || e.UpdateDate >= date).ToList();
            Response.Headers.Add("ticks",
                (entities.Count > 0
                    ? entities.Select(e => e.UpdateDate > e.InsertDate ? e.UpdateDate.Ticks : e.InsertDate.Ticks).Max()
                    : DateTime.Now.Ticks).ToString());
            return entities;
        }

        [HttpGet]
        public virtual IEnumerable<T> Get()
        {
            return GetByTicks(0);
        }

        [HttpGet("{id}")]
        public virtual async Task<IActionResult> Get([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var Entity = await Context.Set<T>().SingleAsync(m => m.Id == id);

            if (Entity == null)
            {
                return NotFound();
            }

            return Ok(Entity);
        }

        [HttpPut("{id}")]
        [Authorize]
        public virtual async Task<IActionResult> Put([FromRoute] int id, [FromBody] T entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != entity.Id)
            {
                return BadRequest();
            }


            entity.AddOrUpdate(Context);
            try
            {
                await Context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Exists(id))
                {
                    return NotFound();
                }
                throw;
            }
            return Ok(entity);
            //return new HttpStatusCodeResult(StatusCodes.Status204NoContent);
        }


        [Authorize]
        [HttpPost]
        public virtual async Task<IActionResult> Post([FromBody] T entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            entity.AddOrUpdate(Context);
            try
            {
                await Context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (Exists(entity.Id))
                {
                    return new StatusCodeResult(StatusCodes.Status409Conflict);
                }
                throw;
            }
            return Created(HttpContext.Request.GetEncodedUrl() + entity.Id, entity);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public virtual async Task<IActionResult> Delete([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Entity entity = await Context.Set<T>().SingleAsync(m => m.Id == id);
            if (entity == null)
            {
                return NotFound();
            }

            entity.RemoveFromContext(Context);
            await Context.SaveChangesAsync();

            return Ok(entity);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                Context.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool Exists(int? id)
        {
            return id != null && Context.Set<T>().Count(e => e.Id == id) > 0;
        }
    }
}