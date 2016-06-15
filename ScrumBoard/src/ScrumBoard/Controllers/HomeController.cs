using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ScrumBoard.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult About()
        {
            ViewData["Title"] = "About";
            ViewData["Message"] = "Über unser Projekt";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Title"] = "Contact";
            ViewData["Message"] = "Über uns";

            return View();
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
