using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MyStreet.Application.Contracts;
using MyStreet.Domain.Entities;
using MyStreet.Infrastructure;
using MyStreet.Infrastructure.Repositories;
using MyStreet.Infrastructure.Services;

namespace MyStreet.Tests;

public class OrderServiceRelationalTests
{
    [Fact]
    public async Task CreateAsync_UsesRelationalExecuteUpdate_ToReserveStock()
    {
        // Use SQLite in-memory which reports as relational
        await using var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        await using (var context = new ApplicationDbContext(options))
        {
            await context.Database.EnsureCreatedAsync();

            var product = new Product
            {
                Id = Guid.NewGuid(),
                Name = "Relational Shoe",
                Brand = "TestBrand",
                Description = "Relational test",
                Price = 50,
                ImageUrl = "https://example.com/rel.jpg",
                SizesCsv = "8,9,10",
                StockQty = 5,
                CreatedAt = DateTime.UtcNow
            };

            var userId = Guid.NewGuid();

            context.Users.Add(new User
            {
                Id = userId,
                FirstName = "Rel",
                LastName = "User",
                Email = "rel@example.com",
                PasswordHash = "hash",
                IsAdmin = false,
                CreatedAt = DateTime.UtcNow
            });

            context.Products.Add(product);
            await context.SaveChangesAsync();

            var service = new OrderService(context, new OrderRepository(context), new ProductRepository(context));

            var response = await service.CreateAsync(userId, new CreateOrderRequest
            {
                ShippingAddress = "1 Rel St",
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

            response.TotalAmount.Should().Be(100);

            // Open a new context to observe the updated value from the database
            await using var verifyContext = new ApplicationDbContext(options);
            var updated = await verifyContext.Products.SingleAsync(p => p.Id == product.Id);
            updated.StockQty.Should().Be(3);
        }
    }
}
