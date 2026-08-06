using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using MyStreet.Application.Contracts;
using MyStreet.Application.Exceptions;
using MyStreet.Domain.Entities;
using MyStreet.Infrastructure;
using MyStreet.Infrastructure.Repositories;
using MyStreet.Infrastructure.Services;

namespace MyStreet.Tests;

public class OrderServiceTests
{
    [Fact]
    public async Task CreateAsync_CreatesPlacedOrderAndReducesStock()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Runner Pro",
            Brand = "Nike",
            Description = "Test",
            Price = 150,
            ImageUrl = "https://example.com/runner.jpg",
            SizesCsv = "8,9,10",
            StockQty = 5,
            CreatedAt = DateTime.UtcNow
        };

        context.Products.Add(product);
        await context.SaveChangesAsync();

        var response = await service.CreateAsync(
            Guid.NewGuid(),
            new CreateOrderRequest
            {
                ShippingAddress = "123 Main Street",
                PaymentMethod = OrderPaymentMethod.Zelle,
                Items =
                [
                    new CreateOrderItemRequest
                    {
                        ProductId = product.Id,
                        Size = "9",
                        Quantity = 2
                    }
                ]
            });

        response.Status.Should().Be("PLACED");
        response.PaymentMethod.Should().Be(nameof(OrderPaymentMethod.Zelle));
        response.TotalAmount.Should().Be(300);
        response.OrderItems.Should().ContainSingle();
        response.OrderItems[0].LineTotal.Should().Be(300);

        var updatedProduct = await context.Products.SingleAsync(item => item.Id == product.Id);
        updatedProduct.StockQty.Should().Be(3);
    }

    [Fact]
    public async Task CreateAsync_ThrowsWhenCartIsEmpty()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        var act = async () => await service.CreateAsync(
            Guid.NewGuid(),
            new CreateOrderRequest
            {
                ShippingAddress = "123 Main Street",
                PaymentMethod = OrderPaymentMethod.COD,
                Items = []
            });

        var exception = await act.Should().ThrowAsync<AppException>();
        exception.Which.ErrorCode.Should().Be("EMPTY_CART");
    }

    [Fact]
    public async Task GetByIdAsync_EnforcesOwnerAndAdminAccess()
    {
        await using var context = CreateContext();
        var service = CreateService(context);
        var orderRepository = new OrderRepository(context);

        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Runner Mini",
            Brand = "Adidas",
            Description = "Test",
            Price = 90,
            ImageUrl = "https://example.com/runner-mini.jpg",
            SizesCsv = "8,9,10",
            StockQty = 10,
            CreatedAt = DateTime.UtcNow
        };

        context.Products.Add(product);
        await context.SaveChangesAsync();

        var created = await orderRepository.AddAsync(new Order
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            User = null!,
            ShippingAddress = "123 Main Street",
            PaymentMethod = OrderPaymentMethod.COD.ToString(),
            Status = "PLACED",
            TotalAmount = 90,
            CreatedAt = DateTime.UtcNow,
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

        var forbidden = async () => await service.GetByIdAsync(otherUserId, false, created.Id);
        var forbiddenException = await forbidden.Should().ThrowAsync<AppException>();
        forbiddenException.Which.ErrorCode.Should().Be("ORDER_FORBIDDEN");

        var adminResponse = await service.GetByIdAsync(otherUserId, true, created.Id);
        adminResponse.Id.Should().Be(created.Id);
        adminResponse.OrderItems.Should().ContainSingle();
    }

    private static OrderService CreateService(ApplicationDbContext context)
    {
        return new OrderService(
            context,
            new OrderRepository(context),
            new ProductRepository(context));
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }
}