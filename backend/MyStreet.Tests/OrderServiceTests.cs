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
    public async Task CreateAsync_SuccessfulCodOrder()
    {
        // Arrange
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

        // Act
        var response = await service.CreateAsync(
            Guid.NewGuid(),
            new CreateOrderRequest
            {
                ShippingAddress = "123 Main Street",
                PaymentMethod = OrderPaymentMethod.COD,
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

        // Assert
        response.Status.Should().Be("PLACED");
        response.PaymentMethod.Should().Be(nameof(OrderPaymentMethod.COD));
        response.TotalAmount.Should().Be(300);
        response.OrderItems.Should().ContainSingle();
        response.OrderItems[0].LineTotal.Should().Be(300);

        var updatedProduct = await context.Products.SingleAsync(item => item.Id == product.Id);
        updatedProduct.StockQty.Should().Be(3);
    }

    [Fact]
    public async Task CreateAsync_SuccessfulUpiOrder()
    {
        // Arrange
        await using var context = CreateContext();
        var service = CreateService(context);

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Runner Lite",
            Brand = "Nike",
            Description = "Test",
            Price = 200,
            ImageUrl = "https://example.com/lite.jpg",
            SizesCsv = "7,8,9",
            StockQty = 4,
            CreatedAt = DateTime.UtcNow
        };

        context.Products.Add(product);
        await context.SaveChangesAsync();

        // Act
        var response = await service.CreateAsync(
            Guid.NewGuid(),
            new CreateOrderRequest
            {
                ShippingAddress = "45 Test Street",
                PaymentMethod = OrderPaymentMethod.UPI,
                Items =
                [
                    new CreateOrderItemRequest
                    {
                        ProductId = product.Id,
                        Size = "8",
                        Quantity = 1
                    }
                ]
            });

        // Assert
        response.PaymentMethod.Should().Be(nameof(OrderPaymentMethod.UPI));
        response.TotalAmount.Should().Be(200);
    }

    [Fact]
    public async Task CreateAsync_ThrowsWhenCartIsEmpty()
    {
        // Arrange
        await using var context = CreateContext();
        var service = CreateService(context);

        // Act
        var act = async () => await service.CreateAsync(
            Guid.NewGuid(),
            new CreateOrderRequest
            {
                ShippingAddress = "123 Main Street",
                PaymentMethod = OrderPaymentMethod.COD,
                Items = []
            });

        // Assert
        var exception = await act.Should().ThrowAsync<AppException>();
        exception.Which.ErrorCode.Should().Be("EMPTY_CART");
    }

    [Fact]
    public async Task CreateAsync_InvalidPaymentMethod_ThrowsError()
    {
        // Arrange
        await using var context = CreateContext();
        var service = CreateService(context);

        // Act
        var act = async () => await service.CreateAsync(
            Guid.NewGuid(),
            new CreateOrderRequest
            {
                ShippingAddress = "123 Main Street",
                PaymentMethod = null,
                Items =
                [
                    new CreateOrderItemRequest
                    {
                        ProductId = Guid.NewGuid(),
                        Size = "9",
                        Quantity = 1
                    }
                ]
            });

        // Assert
        var exception = await act.Should().ThrowAsync<AppException>();
        exception.Which.ErrorCode.Should().Be("INVALID_PAYMENT_METHOD");
    }

    [Fact]
    public async Task CreateAsync_ProductNotFound_ThrowsError()
    {
        // Arrange
        await using var context = CreateContext();
        var service = CreateService(context);

        // Act
        var act = async () => await service.CreateAsync(
            Guid.NewGuid(),
            new CreateOrderRequest
            {
                ShippingAddress = "123 Main Street",
                PaymentMethod = OrderPaymentMethod.COD,
                Items =
                [
                    new CreateOrderItemRequest
                    {
                        ProductId = Guid.NewGuid(),
                        Size = "9",
                        Quantity = 1
                    }
                ]
            });

        // Assert
        var exception = await act.Should().ThrowAsync<AppException>();
        exception.Which.ErrorCode.Should().Be("PRODUCT_NOT_FOUND");
        exception.Which.StatusCode.Should().Be(404);
    }

    [Fact]
    public async Task CreateAsync_InvalidSize_ThrowsError()
    {
        // Arrange
        await using var context = CreateContext();
        var service = CreateService(context);

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Runner Size",
            Brand = "Puma",
            Description = "Test",
            Price = 100,
            ImageUrl = "https://example.com/size.jpg",
            SizesCsv = "8,9",
            StockQty = 3,
            CreatedAt = DateTime.UtcNow
        };

        context.Products.Add(product);
        await context.SaveChangesAsync();

        // Act
        var act = async () => await service.CreateAsync(
            Guid.NewGuid(),
            new CreateOrderRequest
            {
                ShippingAddress = "123 Main Street",
                PaymentMethod = OrderPaymentMethod.COD,
                Items =
                [
                    new CreateOrderItemRequest
                    {
                        ProductId = product.Id,
                        Size = "10",
                        Quantity = 1
                    }
                ]
            });

        // Assert
        var exception = await act.Should().ThrowAsync<AppException>();
        exception.Which.ErrorCode.Should().Be("INVALID_SIZE");
    }

    [Fact]
    public async Task CreateAsync_InsufficientStock_ThrowsError()
    {
        // Arrange
        await using var context = CreateContext();
        var service = CreateService(context);

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Runner Stock",
            Brand = "Puma",
            Description = "Test",
            Price = 100,
            ImageUrl = "https://example.com/stock.jpg",
            SizesCsv = "8,9",
            StockQty = 1,
            CreatedAt = DateTime.UtcNow
        };

        context.Products.Add(product);
        await context.SaveChangesAsync();

        // Act
        var act = async () => await service.CreateAsync(
            Guid.NewGuid(),
            new CreateOrderRequest
            {
                ShippingAddress = "123 Main Street",
                PaymentMethod = OrderPaymentMethod.COD,
                Items =
                [
                    new CreateOrderItemRequest
                    {
                        ProductId = product.Id,
                        Size = "8",
                        Quantity = 2
                    }
                ]
            });

        // Assert
        var exception = await act.Should().ThrowAsync<AppException>();
        exception.Which.ErrorCode.Should().Be("INSUFFICIENT_STOCK");
    }

    [Fact]
    public async Task CreateAsync_TotalCalculatedByBackendAndStockReduced()
    {
        // Arrange
        await using var context = CreateContext();
        var service = CreateService(context);

        var productA = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Runner A",
            Brand = "Nike",
            Description = "Test",
            Price = 75,
            ImageUrl = "https://example.com/a.jpg",
            SizesCsv = "8,9",
            StockQty = 5,
            CreatedAt = DateTime.UtcNow
        };

        var productB = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Runner B",
            Brand = "Adidas",
            Description = "Test",
            Price = 120,
            ImageUrl = "https://example.com/b.jpg",
            SizesCsv = "9,10",
            StockQty = 3,
            CreatedAt = DateTime.UtcNow
        };

        context.Products.AddRange(productA, productB);
        await context.SaveChangesAsync();

        // Act
        var response = await service.CreateAsync(
            Guid.NewGuid(),
            new CreateOrderRequest
            {
                ShippingAddress = "123 Main Street",
                PaymentMethod = OrderPaymentMethod.COD,
                Items =
                [
                    new CreateOrderItemRequest
                    {
                        ProductId = productA.Id,
                        Size = "8",
                        Quantity = 2
                    },
                    new CreateOrderItemRequest
                    {
                        ProductId = productB.Id,
                        Size = "10",
                        Quantity = 1
                    }
                ]
            });

        // Assert
        response.TotalAmount.Should().Be(270);

        var updatedProductA = await context.Products.SingleAsync(product => product.Id == productA.Id);
        var updatedProductB = await context.Products.SingleAsync(product => product.Id == productB.Id);

        updatedProductA.StockQty.Should().Be(3);
        updatedProductB.StockQty.Should().Be(2);
    }

    [Fact]
    public async Task GetByIdAsync_UserCannotAccessAnotherUsersOrder()
    {
        // Arrange
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

        // Act
        var forbidden = async () => await service.GetByIdAsync(otherUserId, false, created.Id);

        // Assert
        var forbiddenException = await forbidden.Should().ThrowAsync<AppException>();
        forbiddenException.Which.ErrorCode.Should().Be("ORDER_FORBIDDEN");
    }

    [Fact]
    public async Task GetByIdAsync_AdminCanAccessAnyOrder()
    {
        // Arrange
        await using var context = CreateContext();
        var service = CreateService(context);
        var orderRepository = new OrderRepository(context);

        var userId = Guid.NewGuid();
        var adminUserId = Guid.NewGuid();
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

        // Act
        var adminResponse = await service.GetByIdAsync(adminUserId, true, created.Id);

        // Assert
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