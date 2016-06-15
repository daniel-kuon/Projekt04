using Microsoft.AspNetCore.Mvc;
using ScrumBoard.Models;

namespace ScrumBoard.Controllers.WebApi
{
    [Route("api/categories")]
    public class CategoryController : ApiController<Category>
    {
        public CategoryController(SbDbContext context) : base(context)
        {
        }
    }
}