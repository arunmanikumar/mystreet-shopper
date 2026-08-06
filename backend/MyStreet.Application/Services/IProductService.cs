using MyStreet.Application.Contracts;

namespace MyStreet.Application.Services;

public interface IProductService
{
    Task<IReadOnlyList<ProductResponse>> GetAllAsync(
        string? search = null,
        string? brand = null,
        string? size = null,
        bool sortByName = false,
        CancellationToken cancellationToken = default);

    Task<ProductResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProductResponse> AddAsync(ProductCreateRequest request, CancellationToken cancellationToken = default);
    Task<ProductResponse?> UpdateAsync(Guid id, ProductUpdateRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
