using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using ScrumBoard.Models;

namespace ScrumBoard.Controllers.WebApi
{
    [Route("api/chat")]
    public class ChatMessageController:ApiController<ChatMessage>
    {
        public ChatMessageController(SbDbContext context) : base(context)
        {
        }
    }
}