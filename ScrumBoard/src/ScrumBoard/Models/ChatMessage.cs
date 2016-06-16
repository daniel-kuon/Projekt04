namespace ScrumBoard.Models
{
    public class ChatMessage:Entity
    {
        public string Message { get; set; }
        public string Name { get; set; }
        public int ProjectId { get; set; }
        public Project Project { get; set; }

    }
}