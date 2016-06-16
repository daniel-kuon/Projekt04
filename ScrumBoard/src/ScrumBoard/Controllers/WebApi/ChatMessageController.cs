using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using ScrumBoard.Models;

namespace ScrumBoard.Controllers.WebApi
{
    [Route("api/chat")]
    public class ChatMessageController:ApiController<ChatMessage>
    {
        public ChatMessageController(SbDbContext context, UserManager<ApplicationUser> userManager ) : base(context)
        {
            this.UserManager = userManager;
        }

        public UserManager<ApplicationUser> UserManager { get; set; }

        public override Task<IActionResult> Post([FromBody] ChatMessage entity)
        {
            entity.Name = User.Identity.Name;
            return base.Post(entity);
        }
    }
}