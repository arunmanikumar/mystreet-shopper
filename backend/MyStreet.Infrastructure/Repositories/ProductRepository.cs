using Microsoft.EntityFrameworkCore;
using MyStreet.Application.Services;
using MyStreet.Domain.Entities;

namespace MyStreet.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly ApplicationDbContext _context;

    public ProductRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Product>> GetAllAsync(
        string? search = null,
        string? brand = null,
        string? size = null,
        bool sortByName = false,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLowerInvariant();
            query = query.Where(p =>
                p.Name.ToLower().Contains(normalizedSearch) ||
                p.Brand.ToLower().Contains(normalizedSearch));
        }

        if (!string.IsNullOrWhiteSpace(brand))
        {
            var normalizedBrand = brand.Trim().ToLowerInvariant();
            query = query.Where(p => p.Brand.ToLower() == normalizedBrand);
        }

        if (!string.IsNullOrWhiteSpace(size))
        {
            var normalizedSize = size.Trim();
            var exactToken = $",{normalizedSize},";

            query = query.Where(p =>
                ("," + p.SizesCsv.Replace(" ", string.Empty) + ",").Contains(exactToken));
        }

        if (sortByName)
        {
            query = query.OrderBy(p => p.Name);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.Products
            .AsNoTracking()
            .SingleOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Product> AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _context.Products.AddAsync(product, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return product;
    }

    public async Task<bool> UpdateAsync(Product product, CancellationToken cancellationToken = default)
    {
        var exists = await _context.Products.AnyAsync(p => p.Id == product.Id, cancellationToken);

        if (!exists)
        {
            return false;
        }

        _context.Products.Update(product);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existing = await _context.Products.SingleOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (existing is null)
        {
            return false;
        }

        _context.Products.Remove(existing);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
