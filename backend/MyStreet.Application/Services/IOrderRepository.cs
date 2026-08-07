using MyStreet.Domain.Entities;

namespace MyStreet.Application.Services;

public interface IOrderRepository
{
    Task<Order> AddAsync(Order order, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Order>> GetMineAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}