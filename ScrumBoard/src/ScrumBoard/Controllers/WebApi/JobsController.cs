using Microsoft.AspNetCore.Mvc;
using ScrumBoard.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ScrumBoard.Controllers.WebApi
{
    [Route("api/jobs")]
    public class JobsController : ApiController<Job>
    {
        public JobsController(SbDbContext context) : base(context)
        {
        }
    }
}
