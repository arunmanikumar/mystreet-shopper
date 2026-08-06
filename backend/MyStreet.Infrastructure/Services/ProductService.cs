using MyStreet.Application.Contracts;
using MyStreet.Application.Exceptions;
using MyStreet.Application.Services;
using MyStreet.Domain.Entities;

namespace MyStreet.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;

    public ProductService(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<IReadOnlyList<ProductResponse>> GetAllAsync(
        string? search = null,
        string? brand = null,
        string? size = null,
        bool sortByName = false,
        CancellationToken cancellationToken = default)
    {
        var products = await _productRepository.GetAllAsync(
            search,
            brand,
            size,
            sortByName,
            cancellationToken);

        return products.Select(ToResponse).ToList();
    }

    public async Task<ProductResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetByIdAsync(id, cancellationToken);
        return product is null ? null : ToResponse(product);
    }

    public async Task<ProductResponse> AddAsync(ProductCreateRequest request, CancellationToken cancellationToken = default)
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Brand = request.Brand.Trim(),
            Description = request.Description.Trim(),
            Price = request.Price,
            ImageUrl = request.ImageUrl.Trim(),
            SizesCsv = NormalizeSizesCsv(request.SizesCsv),
            StockQty = request.StockQty,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _productRepository.AddAsync(product, cancellationToken);
        return ToResponse(created);
    }

    public async Task<ProductResponse?> UpdateAsync(Guid id, ProductUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var existing = await _productRepository.GetByIdAsync(id, cancellationToken);

        if (existing is null)
        {
            return null;
        }

        existing.Name = request.Name.Trim();
        existing.Brand = request.Brand.Trim();
        existing.Description = request.Description.Trim();
        existing.Price = request.Price;
        existing.ImageUrl = request.ImageUrl.Trim();
        existing.SizesCsv = NormalizeSizesCsv(request.SizesCsv);
        existing.StockQty = request.StockQty;

        var updated = await _productRepository.UpdateAsync(existing, cancellationToken);

        if (!updated)
        {
            return null;
        }

        return ToResponse(existing);
    }

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _productRepository.DeleteAsync(id, cancellationToken);
    }

    private static ProductResponse ToResponse(Product product)
    {
        return new ProductResponse
        {
            Id = product.Id,
            Name = product.Name,
            Brand = product.Brand,
            Description = product.Description,
            Price = product.Price,
            ImageUrl = product.ImageUrl,
            Sizes = SplitSizesCsv(product.SizesCsv).ToArray(),
            StockQty = product.StockQty,
            CreatedAt = product.CreatedAt
        };
    }

    private static string NormalizeSizesCsv(string sizesCsv)
    {
        var normalizedSizes = SplitSizesCsv(sizesCsv)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (normalizedSizes.Length == 0)
        {
            throw new AppException("INVALID_SIZES", "At least one size is required.", 400);
        }

        return string.Join(",", normalizedSizes);
    }

    private static IEnumerable<string> SplitSizesCsv(string sizesCsv)
    {
        return sizesCsv
            .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
            .Where(size => !string.IsNullOrWhiteSpace(size));
    }
}