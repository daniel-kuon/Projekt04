using System;

namespace ScrumBoard.Models
{
    public class Project : Entity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime Deadline { get; set; }
    }
}