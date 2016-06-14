using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ScrumBoard.Models
{
    public class Column : Entity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public Project Project { get; set; }
        public int ProjectId { get; set; }
    }
}
