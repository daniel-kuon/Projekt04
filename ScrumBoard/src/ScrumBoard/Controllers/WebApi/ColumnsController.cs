using Microsoft.AspNetCore.Mvc;
using ScrumBoard.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ScrumBoard.Controllers.WebApi
{
    [Route("api/columns")]
    public class ColumnsController : ApiController<Column>
    {
        public ColumnsController(SbDbContext context) : base(context)
        {
        }
    }
}
