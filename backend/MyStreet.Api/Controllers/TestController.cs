using Microsoft.AspNetCore.Mvc;
using MyStreet.Api.Services;

namespace MyStreet.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly IStatusService _statusService;

    public TestController(IStatusService statusService)
    {
        _statusService = statusService;
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            application = _statusService.ApplicationName,
            status = _statusService.Status,
            framework = _statusService.Framework,
            utcTimestamp = _statusService.UtcNow.ToString("o")
        });
    }
}
