using Microsoft.EntityFrameworkCore;
using MyStreet.Application.Services;
using MyStreet.Domain.Entities;

namespace MyStreet.Infrastructure.Repositories;

public sealed class OrderRepository : IOrderRepository
{
    private const string PlacedStatus = "PLACED";

    private readonly ApplicationDbContext _context;

    public OrderRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Order> AddAsync(Order order, CancellationToken cancellationToken = default)
    {
        order.Status = PlacedStatus;
        order.CreatedAt = DateTime.UtcNow;

        order.User = null!;

        foreach (var orderItem in order.OrderItems)
        {
            orderItem.Order = null!;
            orderItem.Product = null!;
        }

        await _context.Orders.AddAsync(order, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(order.Id, cancellationToken)) ?? order;
    }

    public async Task<IReadOnlyList<Order>> GetMineAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .AsNoTracking()
            .Include(order => order.OrderItems)
            .ThenInclude(orderItem => orderItem.Product)
            .Where(order => order.UserId == userId)
            .OrderByDescending(order => order.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.Orders
            .AsNoTracking()
            .Include(order => order.OrderItems)
            .ThenInclude(orderItem => orderItem.Product)
            .SingleOrDefaultAsync(order => order.Id == id, cancellationToken);
    }
}