using MyStreet.Application.Contracts;

namespace MyStreet.Application.Services;

public interface IOrderService
{
    Task<OrderResponse> CreateAsync(Guid userId, CreateOrderRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OrderResponse>> GetMineAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<OrderResponse> GetByIdAsync(Guid userId, bool isAdmin, Guid id, CancellationToken cancellationToken = default);
}