using System;
using System.Collections.Generic;
using System.Linq;

namespace ScrumBoard.Models
{
    public class Job : Entity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public Column Column { get; set; }
        public int ColumnId { get; set; }
    }
}
