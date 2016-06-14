using System;
using System.Collections.Generic;
using System.Linq;

namespace ScrumBoard.Models
{
    public class Column : Entity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public Project Project { get; set; }
        public int ProjectId { get; set; }
        public List<Job> Jobs { get; set; }
    }
}
