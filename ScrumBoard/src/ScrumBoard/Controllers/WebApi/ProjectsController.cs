using Microsoft.AspNetCore.Mvc;
using ScrumBoard.Models;

namespace ScrumBoard.Controllers.WebApi
{
    [Route("api/projects")]
    public class ProjectsController : ApiController<Project>
    {
        public ProjectsController(SbDbContext context) : base(context)
        {
        }
    }
}