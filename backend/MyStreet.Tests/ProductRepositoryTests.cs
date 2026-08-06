using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using MyStreet.Domain.Entities;
using MyStreet.Infrastructure;
using MyStreet.Infrastructure.Repositories;

namespace MyStreet.Tests;

public class ProductRepositoryTests
{
    [Fact]
    public async Task GetAllAsync_FiltersByExactSizeToken()
    {
        await using var context = CreateContext();
        var repository = new ProductRepository(context);

        var target = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Runner 9",
            Brand = "Nike",
            Description = "Test",
            Price = 100,
            ImageUrl = "https://example.com/1.jpg",
            SizesCsv = "8,9,10",
            StockQty = 3,
            CreatedAt = DateTime.UtcNow
        };

        var nonMatch = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Runner 19",
            Brand = "Nike",
            Description = "Test",
            Price = 100,
            ImageUrl = "https://example.com/2.jpg",
            SizesCsv = "18,19",
            StockQty = 3,
            CreatedAt = DateTime.UtcNow
        };

        context.Products.AddRange(target, nonMatch);
        await context.SaveChangesAsync();

        var results = await repository.GetAllAsync(size: "9");

        results.Should().ContainSingle();
        results[0].Id.Should().Be(target.Id);
    }

    [Fact]
    public async Task GetAllAsync_SupportsSearchBrandFilterAndSortByName()
    {
        await using var context = CreateContext();
        var repository = new ProductRepository(context);

        context.Products.AddRange(
            new Product
            {
                Id = Guid.NewGuid(),
                Name = "Zeta Run",
                Brand = "Nike",
                Description = "Test",
                Price = 90,
                ImageUrl = "https://example.com/1.jpg",
                SizesCsv = "8,9",
                StockQty = 1,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Name = "Alpha Run",
                Brand = "Nike",
                Description = "Test",
                Price = 95,
                ImageUrl = "https://example.com/2.jpg",
                SizesCsv = "9,10",
                StockQty = 2,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Name = "Other",
                Brand = "Adidas",
                Description = "Test",
                Price = 95,
                ImageUrl = "https://example.com/3.jpg",
                SizesCsv = "9,10",
                StockQty = 2,
                CreatedAt = DateTime.UtcNow
            });

        await context.SaveChangesAsync();

        var results = await repository.GetAllAsync(search: "run", brand: "Nike", sortByName: true);

        results.Should().HaveCount(2);
        results[0].Name.Should().Be("Alpha Run");
        results[1].Name.Should().Be("Zeta Run");
    }

    [Fact]
    public async Task AddUpdateDeleteAsync_PerformsCrudOperations()
    {
        await using var context = CreateContext();
        var repository = new ProductRepository(context);

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Initial",
            Brand = "Brand",
            Description = "Description",
            Price = 100,
            ImageUrl = "https://example.com/1.jpg",
            SizesCsv = "9,10",
            StockQty = 4,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(product);

        var saved = await repository.GetByIdAsync(product.Id);
        saved.Should().NotBeNull();

        product.Name = "Updated";
        var updated = await repository.UpdateAsync(product);
        updated.Should().BeTrue();

        var updatedFromDb = await repository.GetByIdAsync(product.Id);
        updatedFromDb.Should().NotBeNull();
        updatedFromDb!.Name.Should().Be("Updated");

        var deleted = await repository.DeleteAsync(product.Id);
        deleted.Should().BeTrue();

        var deletedFromDb = await repository.GetByIdAsync(product.Id);
        deletedFromDb.Should().BeNull();
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }
}
