using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using MyStreet.Domain.Entities;
using MyStreet.Infrastructure;
using MyStreet.Infrastructure.Repositories;

namespace MyStreet.Tests;

public class OrderRepositoryTests
{
    [Fact]
    public async Task AddAsync_StoresPlacedStatusAndIncludesItemsOnRead()
    {
        await using var context = CreateContext();
        var repository = new OrderRepository(context);

        var userId = Guid.NewGuid();
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Runner One",
            Brand = "Nike",
            Description = "Test",
            Price = 120,
            ImageUrl = "https://example.com/runner.jpg",
            SizesCsv = "8,9,10",
            StockQty = 5,
            CreatedAt = DateTime.UtcNow
        };

        context.Products.Add(product);
        await context.SaveChangesAsync();

        var created = await repository.AddAsync(new Order
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ShippingAddress = "123 Main St",
            PaymentMethod = "COD",
            TotalAmount = 120,
            User = null!,
            OrderItems =
            [
                new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    ProductName = product.Name,
                    Size = "9",
                    Quantity = 1,
                    Price = product.Price,
                    Order = null!,
                    Product = null!
                }
            ]
        });

        created.Status.Should().Be("PLACED");
        created.OrderItems.Should().ContainSingle();
        created.OrderItems.First().ProductName.Should().Be(product.Name);
    }

    [Fact]
    public async Task GetMineAsync_ReturnsNewestOrdersFirstWithItems()
    {
        await using var context = CreateContext();
        var repository = new OrderRepository(context);

        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Runner Two",
            Brand = "Adidas",
            Description = "Test",
            Price = 90,
            ImageUrl = "https://example.com/runner-2.jpg",
            SizesCsv = "8,9,10",
            StockQty = 2,
            CreatedAt = DateTime.UtcNow
        };

        context.Products.Add(product);
        context.Orders.AddRange(
            new Order
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ShippingAddress = "Older",
                PaymentMethod = "UPI",
                Status = "PLACED",
                TotalAmount = 90,
                CreatedAt = new DateTime(2026, 1, 1, 10, 0, 0, DateTimeKind.Utc),
                User = null!,
                OrderItems =
                [
                    new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        ProductId = product.Id,
                        ProductName = product.Name,
                        Size = "8",
                        Quantity = 1,
                        Price = product.Price,
                        Order = null!,
                        Product = null!
                    }
                ]
            },
            new Order
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ShippingAddress = "Newer",
                PaymentMethod = "COD",
                Status = "PLACED",
                TotalAmount = 180,
                CreatedAt = new DateTime(2026, 1, 2, 10, 0, 0, DateTimeKind.Utc),
                User = null!,
                OrderItems =
                [
                    new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        ProductId = product.Id,
                        ProductName = product.Name,
                        Size = "9",
                        Quantity = 2,
                        Price = product.Price,
                        Order = null!,
                        Product = null!
                    }
                ]
            },
            new Order
            {
                Id = Guid.NewGuid(),
                UserId = otherUserId,
                ShippingAddress = "Other user",
                PaymentMethod = "COD",
                Status = "PLACED",
                TotalAmount = 90,
                CreatedAt = new DateTime(2026, 1, 3, 10, 0, 0, DateTimeKind.Utc),
                User = null!,
                OrderItems =
                [
                    new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        ProductId = product.Id,
                        ProductName = product.Name,
                        Size = "10",
                        Quantity = 1,
                        Price = product.Price,
                        Order = null!,
                        Product = null!
                    }
                ]
            });

        await context.SaveChangesAsync();

        var orders = await repository.GetMineAsync(userId);

        orders.Should().HaveCount(2);
        orders[0].ShippingAddress.Should().Be("Newer");
        orders[0].OrderItems.Should().ContainSingle();
        orders[1].ShippingAddress.Should().Be("Older");
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }
}