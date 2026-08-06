using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MyStreet.Api.Controllers;

[ApiController]
[Route("api/security-test")]
public class SecurityTestController : ControllerBase
{
    [HttpGet("authenticated")]
    [Authorize]
    public IActionResult Authenticated()
    {
        return Ok(new
        {
            message = "Authenticated access granted",
            user = User?.Identity?.Name,
            claims = User?.Claims?.Select(c => new { c.Type, c.Value })
        });
    }

    [HttpGet("admin")]
    [Authorize(Policy = "AdminOnly")]
    public IActionResult Admin()
    {
        return Ok(new
        {
            message = "Admin access granted",
            user = User?.Identity?.Name,
            claims = User?.Claims?.Select(c => new { c.Type, c.Value })
        });
    }
}
