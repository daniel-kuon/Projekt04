using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using ScrumBoard.Models;

namespace ScrumBoard.Controllers.WebApi
{
    [Route("api/categoryJobs")]
    [Produces("application/json")]
    public class CategoryJobController:Controller
    {
        protected SbDbContext Context;

        public CategoryJobController(SbDbContext context)
        {
            Context = context;
        }


        [HttpGet]
        public IEnumerable<CategoryJob> Get()
        {
            return Context.CategoryJobs;
        }
    }
}