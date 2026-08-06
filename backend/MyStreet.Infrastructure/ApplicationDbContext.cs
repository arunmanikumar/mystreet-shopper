using Microsoft.EntityFrameworkCore;
using MyStreet.Domain.Entities;

namespace MyStreet.Infrastructure;

public sealed class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Product> Products { get; set; } = null!;
    public DbSet<Order> Orders { get; set; } = null!;
    public DbSet<OrderItem> OrderItems { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(x => x.LastName).IsRequired().HasMaxLength(100);
            entity.Property(x => x.Email).IsRequired().HasMaxLength(200);
            entity.Property(x => x.PasswordHash).IsRequired();
            entity.Property(x => x.IsAdmin).IsRequired();
            entity.Property(x => x.CreatedAt).IsRequired();
            entity.HasMany(x => x.Orders)
                .WithOne(x => x.User)
                .HasForeignKey(x => x.UserId);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).IsRequired().HasMaxLength(200);
            entity.Property(x => x.Brand).IsRequired().HasMaxLength(100);
            entity.Property(x => x.Description).IsRequired();
            entity.Property(x => x.Price).HasPrecision(10, 2).IsRequired();
            entity.Property(x => x.ImageUrl).IsRequired();
            entity.Property(x => x.SizesCsv).IsRequired();
            entity.Property(x => x.StockQty).IsRequired();
            entity.Property(x => x.CreatedAt).IsRequired();
            entity.HasMany(x => x.OrderItems)
                .WithOne(x => x.Product)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.UserId).IsRequired();
            entity.Property(x => x.ShippingAddress).IsRequired();
            entity.Property(x => x.PaymentMethod).IsRequired();
            entity.Property(x => x.Status).IsRequired();
            entity.Property(x => x.TotalAmount).HasPrecision(10, 2).IsRequired();
            entity.Property(x => x.CreatedAt).IsRequired();
            entity.HasMany(x => x.OrderItems)
                .WithOne(x => x.Order)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.OrderId).IsRequired();
            entity.Property(x => x.ProductId).IsRequired();
            entity.Property(x => x.ProductName).IsRequired();
            entity.Property(x => x.Size).IsRequired();
            entity.Property(x => x.Quantity).IsRequired();
            entity.Property(x => x.Price).HasPrecision(10, 2).IsRequired();
        });
    }
}
