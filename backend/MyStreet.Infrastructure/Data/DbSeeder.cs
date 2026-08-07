using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MyStreet.Domain.Entities;

namespace MyStreet.Infrastructure.Data;

public static class DbSeeder
{
    private static readonly Dictionary<string, string> ProductImageUrlByName = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Air Zoom Pegasus 40"] = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
        ["Air Force 1 '07"] = "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80",
        ["Ultraboost 23"] = "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1200&q=80",
        ["NMD_R1"] = "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80",
        ["RS-X Tech"] = "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80",
        ["Fresh Foam X 1080v13"] = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
        ["Fresh Foam X 880v13"] = "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=1200&q=80",
        ["GEL-Kayano 31"] = "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=80",
    };

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
                    ImageUrl = ProductImageUrlByName["Air Zoom Pegasus 40"],
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
                    ImageUrl = ProductImageUrlByName["Air Force 1 '07"],
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
                    ImageUrl = ProductImageUrlByName["Ultraboost 23"],
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
                    ImageUrl = ProductImageUrlByName["NMD_R1"],
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
                    ImageUrl = ProductImageUrlByName["RS-X Tech"],
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
                    ImageUrl = ProductImageUrlByName["Fresh Foam X 1080v13"],
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
                    ImageUrl = ProductImageUrlByName["Fresh Foam X 880v13"],
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
                    ImageUrl = ProductImageUrlByName["GEL-Kayano 31"],
                    SizesCsv = "7,8,9,10,11,12",
                    StockQty = 26,
                    CreatedAt = DateTime.UtcNow,
                });
        }

        var productsToUpdate = await context.Products
            .Where(product => EF.Functions.ILike(product.ImageUrl, "https://example.com/images/%"))
            .ToListAsync();

        foreach (var product in productsToUpdate)
        {
            if (ProductImageUrlByName.TryGetValue(product.Name, out var imageUrl))
            {
                product.ImageUrl = imageUrl;
            }
        }

        await context.SaveChangesAsync();
    }
}
