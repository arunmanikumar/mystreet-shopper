using MyStreet.Domain.Entities;

namespace MyStreet.Application.Services;

public interface IProductRepository
{
    Task<IReadOnlyList<Product>> GetAllAsync(
        string? search = null,
        string? brand = null,
        string? size = null,
        bool sortByName = false,
        CancellationToken cancellationToken = default);

    Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Product> AddAsync(Product product, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(Product product, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
