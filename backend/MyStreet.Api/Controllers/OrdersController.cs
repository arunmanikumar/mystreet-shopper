using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyStreet.Application.Contracts;
using MyStreet.Application.Exceptions;
using MyStreet.Application.Services;

namespace MyStreet.Api.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponse>> Create([FromBody] CreateOrderRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var response = await _orderService.CreateAsync(userId, request, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet("mine")]
    public async Task<ActionResult<IReadOnlyList<OrderResponse>>> GetMine(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var orders = await _orderService.GetMineAsync(userId, cancellationToken);

        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var isAdmin = IsAdmin();
        var response = await _orderService.GetByIdAsync(userId, isAdmin, id, cancellationToken);

        return Ok(response);
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            throw new AppException("INVALID_TOKEN", "User identity is missing or invalid.", 401);
        }

        return userId;
    }

    private bool IsAdmin()
    {
        var isAdminClaim = User.FindFirstValue("isAdmin");
        return string.Equals(isAdminClaim, "true", StringComparison.OrdinalIgnoreCase);
    }
}