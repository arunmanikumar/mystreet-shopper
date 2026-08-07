using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using MyStreet.Application.Contracts;
using MyStreet.Application.Exceptions;
using MyStreet.Domain.Entities;
using MyStreet.Infrastructure;
using MyStreet.Infrastructure.Repositories;
using MyStreet.Infrastructure.Services;

namespace MyStreet.Tests;

public class OrderServiceNormalizeItemsTests
{
    [Fact]
    public async Task CreateAsync_MissingProductId_ThrowsInvalidOrderItem()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        var act = async () => await service.CreateAsync(
            Guid.NewGuid(),
            new CreateOrderRequest
            {
                ShippingAddress = "123 Main Street",
                PaymentMethod = MyStreet.Application.Contracts.OrderPaymentMethod.COD,
                Items =
                [
                    new CreateOrderItemRequest
                    {
                        ProductId = null,
                        Size = "9",
                        Quantity = 1
                    }
                ]
            });

        var ex = await act.Should().ThrowAsync<AppException>();
        ex.Which.ErrorCode.Should().Be("INVALID_ORDER_ITEM");
    }

    [Fact]
    public async Task CreateAsync_InvalidQuantity_ThrowsInvalidOrderItem()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        var act = async () => await service.CreateAsync(
            Guid.NewGuid(),
            new CreateOrderRequest
            {
                ShippingAddress = "123 Main Street",
                PaymentMethod = MyStreet.Application.Contracts.OrderPaymentMethod.COD,
                Items =
                [
                    new CreateOrderItemRequest
                    {
                        ProductId = Guid.NewGuid(),
                        Size = "9",
                        Quantity = 0
                    }
                ]
            });

        var ex = await act.Should().ThrowAsync<AppException>();
        ex.Which.ErrorCode.Should().Be("INVALID_ORDER_ITEM");
    }

    [Fact]
    public async Task CreateAsync_MissingSize_ThrowsInvalidOrderItem()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        var act = async () => await service.CreateAsync(
            Guid.NewGuid(),
            new CreateOrderRequest
            {
                ShippingAddress = "123 Main Street",
                PaymentMethod = MyStreet.Application.Contracts.OrderPaymentMethod.COD,
                Items =
                [
                    new CreateOrderItemRequest
                    {
                        ProductId = Guid.NewGuid(),
                        Size = " ",
                        Quantity = 1
                    }
                ]
            });

        var ex = await act.Should().ThrowAsync<AppException>();
        ex.Which.ErrorCode.Should().Be("INVALID_ORDER_ITEM");
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
