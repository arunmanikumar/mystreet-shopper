using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MyStreet.Domain.Entities;

namespace MyStreet.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await context.Database.MigrateAsync();

        if (!await context.Users.AnyAsync())
        {
            context.Users.AddRange(
                new User
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Admin",
                    LastName = "User",
                    Email = "admin@mystreet.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    IsAdmin = true,
                    CreatedAt = DateTime.UtcNow,
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Regular",
                    LastName = "User",
                    Email = "user@mystreet.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                    IsAdmin = false,
                    CreatedAt = DateTime.UtcNow,
                });
        }

        if (!await context.Products.AnyAsync())
        {
            context.Products.AddRange(
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Air Zoom Pegasus 40",
                    Brand = "Nike",
                    Description = "Lightweight running shoes built for responsive cushioning and everyday training.",
                    Price = 129.99M,
                    ImageUrl = "https://example.com/images/nike-pegasus-40.jpg",
                    SizesCsv = "7,8,9,10,11,12",
                    StockQty = 45,
                    CreatedAt = DateTime.UtcNow,
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Air Force 1 '07",
                    Brand = "Nike",
                    Description = "Classic basketball-inspired sneaker with leather upper and timeless style.",
                    Price = 114.99M,
                    ImageUrl = "https://example.com/images/nike-air-force-1.jpg",
                    SizesCsv = "7,8,9,10,11,12,13",
                    StockQty = 36,
                    CreatedAt = DateTime.UtcNow,
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Ultraboost 23",
                    Brand = "Adidas",
                    Description = "Comfortable, energy-returning sneaker with Primeknit upper and responsive Boost cushioning.",
                    Price = 179.99M,
                    ImageUrl = "https://example.com/images/adidas-ultraboost-23.jpg",
                    SizesCsv = "7,8,9,10,11,12,13",
                    StockQty = 38,
                    CreatedAt = DateTime.UtcNow,
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "NMD_R1",
                    Brand = "Adidas",
                    Description = "Modern lifestyle sneaker featuring a breathable knit upper with lightweight cushioning.",
                    Price = 139.99M,
                    ImageUrl = "https://example.com/images/adidas-nmd-r1.jpg",
                    SizesCsv = "7,8,9,10,11,12,13",
                    StockQty = 30,
                    CreatedAt = DateTime.UtcNow,
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "RS-X Tech",
                    Brand = "Puma",
                    Description = "Bold street sneaker with cushioned midsole and modern design details.",
                    Price = 109.99M,
                    ImageUrl = "https://example.com/images/puma-rs-x-tech.jpg",
                    SizesCsv = "6,7,8,9,10,11,12",
                    StockQty = 28,
                    CreatedAt = DateTime.UtcNow,
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Fresh Foam X 1080v13",
                    Brand = "New Balance",
                    Description = "Premium running shoe with plush cushioning and a smooth ride.",
                    Price = 159.99M,
                    ImageUrl = "https://example.com/images/newbalance-1080v13.jpg",
                    SizesCsv = "7,8,9,10,11,12",
                    StockQty = 32,
                    CreatedAt = DateTime.UtcNow,
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Fresh Foam X 880v13",
                    Brand = "New Balance",
                    Description = "Reliable running shoe with stability and responsive Fresh Foam cushioning.",
                    Price = 139.99M,
                    ImageUrl = "https://example.com/images/newbalance-880v13.jpg",
                    SizesCsv = "7,8,9,10,11,12",
                    StockQty = 34,
                    CreatedAt = DateTime.UtcNow,
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "GEL-Kayano 31",
                    Brand = "ASICS",
                    Description = "High-performance stability shoe with GEL cushioning and breathable upper.",
                    Price = 159.99M,
                    ImageUrl = "https://example.com/images/asics-gel-kayano-31.jpg",
                    SizesCsv = "7,8,9,10,11,12",
                    StockQty = 26,
                    CreatedAt = DateTime.UtcNow,
                });
        }

        await context.SaveChangesAsync();
    }
}
