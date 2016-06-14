using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ScrumBoard.Models
{
    public class Task : Entity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public Column Column { get; set; }
        public int ColumnId { get; set; }
    }
}
