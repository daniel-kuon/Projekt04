using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ScrumBoard.Models
{
    public class OfflineContext
    {
            public List<Project> Projects { get; set; }
            public List<Column> Columns { get; set; }
            public List<Job> Jobs { get; set; }
    }
}