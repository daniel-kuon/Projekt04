using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ScrumBoard.Models
{
    public class OfflineContext
    {
        public List<Project> Projects { get; set; }
        public List<Column> Columns { get; set; }
        public List<Job> Jobs { get; set; }
        public List<Category> Categories { get; set; }
        public List<CategoryJob> CategoryJobs { get; set; }
        public List<ChatMessage> ChatMessages { get; set; }
        public List<Project> DeletedProjects { get; set; }
        public List<Column> DeletedColumns { get; set; }
        public List<Job> DeletedJobs { get; set; }
        public List<Category> DeletedCategories { get; set; }
        public List<CategoryJob> DeletedCategoryJobs { get; set; }
        public List<ChatMessage> DeletedChatMessages { get; set; }
    }
}