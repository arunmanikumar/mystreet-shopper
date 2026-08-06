using FluentAssertions;
using Moq;
using MyStreet.Application.Contracts;
using MyStreet.Application.Exceptions;
using MyStreet.Application.Services;
using MyStreet.Domain.Entities;
using MyStreet.Infrastructure.Services;

namespace MyStreet.Tests;

public class ProductServiceTests
{
    [Fact]
    public async Task GetAllAsync_MapsProductsToResponses()
    {
        // Arrange
        var repository = new Mock<IProductRepository>();
        var products = new List<Product>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Runner",
                Brand = "Nike",
                Description = "Lightweight",
                Price = 120,
                ImageUrl = "https://example.com/runner.jpg",
                SizesCsv = "8,9,10",
                StockQty = 4,
                CreatedAt = DateTime.UtcNow
            }
        };

        repository
            .Setup(repo => repo.GetAllAsync(null, null, null, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(products);

        var service = new ProductService(repository.Object);

        // Act
        var response = await service.GetAllAsync();

        // Assert
        response.Should().HaveCount(1);
        response[0].Name.Should().Be("Runner");
        response[0].Sizes.Should().Equal("8", "9", "10");
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsMappedProduct()
    {
        // Arrange
        var repository = new Mock<IProductRepository>();
        var id = Guid.NewGuid();

        repository
            .Setup(repo => repo.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Product
            {
                Id = id,
                Name = "Court",
                Brand = "Puma",
                Description = "Daily",
                Price = 99,
                ImageUrl = "https://example.com/court.jpg",
                SizesCsv = "7,8",
                StockQty = 8,
                CreatedAt = DateTime.UtcNow
            });

        var service = new ProductService(repository.Object);

        // Act
        var response = await service.GetByIdAsync(id);

        // Assert
        response.Should().NotBeNull();
        response!.Id.Should().Be(id);
        response.Sizes.Should().Equal("7", "8");
    }

    [Fact]
    public async Task GetByIdAsync_MissingProduct_ReturnsNull()
    {
        // Arrange
        var repository = new Mock<IProductRepository>();
        var id = Guid.NewGuid();

        repository
            .Setup(repo => repo.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);

        var service = new ProductService(repository.Object);

        // Act
        var response = await service.GetByIdAsync(id);

        // Assert
        response.Should().BeNull();
    }

    [Fact]
    public async Task AddAsync_CreatesProductAndMapsResponse()
    {
        // Arrange
        var repository = new Mock<IProductRepository>();
        Product? captured = null;

        repository
            .Setup(repo => repo.AddAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()))
            .Callback<Product, CancellationToken>((product, _) => captured = product)
            .ReturnsAsync((Product product, CancellationToken _) => product);

        var service = new ProductService(repository.Object);

        // Act
        var response = await service.AddAsync(new ProductCreateRequest
        {
            Name = "  Air One  ",
            Brand = "  Nike ",
            Description = "  Cushion ",
            Price = 150,
            ImageUrl = "  https://example.com/air.jpg  ",
            SizesCsv = "8,9,10",
            StockQty = 3
        });

        // Assert
        captured.Should().NotBeNull();
        captured!.Name.Should().Be("Air One");
        captured.Brand.Should().Be("Nike");
        captured.Description.Should().Be("Cushion");
        captured.ImageUrl.Should().Be("https://example.com/air.jpg");
        response.Name.Should().Be("Air One");
    }

    [Fact]
    public async Task AddAsync_NormalizesSizesAndRemovesDuplicates()
    {
        // Arrange
        var repository = new Mock<IProductRepository>();
        Product? captured = null;

        repository
            .Setup(repo => repo.AddAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()))
            .Callback<Product, CancellationToken>((product, _) => captured = product)
            .ReturnsAsync((Product product, CancellationToken _) => product);

        var service = new ProductService(repository.Object);

        // Act
        await service.AddAsync(new ProductCreateRequest
        {
            Name = "Model",
            Brand = "Brand",
            Description = "Desc",
            Price = 100,
            ImageUrl = "https://example.com/model.jpg",
            SizesCsv = " 8,9,8, 9 ,10 ",
            StockQty = 5
        });

        // Assert
        captured.Should().NotBeNull();
        captured!.SizesCsv.Should().Be("8,9,10");
    }

    [Fact]
    public async Task UpdateAsync_UpdatesExistingProduct()
    {
        // Arrange
        var repository = new Mock<IProductRepository>();
        var id = Guid.NewGuid();
        var existing = new Product
        {
            Id = id,
            Name = "Old",
            Brand = "OldBrand",
            Description = "OldDesc",
            Price = 99,
            ImageUrl = "https://example.com/old.jpg",
            SizesCsv = "8,9",
            StockQty = 1,
            CreatedAt = DateTime.UtcNow
        };

        repository
            .Setup(repo => repo.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        repository
            .Setup(repo => repo.UpdateAsync(existing, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var service = new ProductService(repository.Object);

        // Act
        var response = await service.UpdateAsync(id, new ProductUpdateRequest
        {
            Name = " New Name ",
            Brand = " New Brand ",
            Description = " New Desc ",
            Price = 130,
            ImageUrl = " https://example.com/new.jpg ",
            SizesCsv = "10,11",
            StockQty = 6
        });

        // Assert
        response.Should().NotBeNull();
        response!.Name.Should().Be("New Name");
        existing.SizesCsv.Should().Be("10,11");
        existing.StockQty.Should().Be(6);
    }

    [Fact]
    public async Task DeleteAsync_DelegatesToRepository()
    {
        // Arrange
        var repository = new Mock<IProductRepository>();
        var id = Guid.NewGuid();

        repository
            .Setup(repo => repo.DeleteAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var service = new ProductService(repository.Object);

        // Act
        var deleted = await service.DeleteAsync(id);

        // Assert
        deleted.Should().BeTrue();
    }

    [Fact]
    public async Task AddAsync_InvalidEmptySizes_ThrowsAppException()
    {
        // Arrange
        var repository = new Mock<IProductRepository>();
        var service = new ProductService(repository.Object);

        // Act
        var act = async () => await service.AddAsync(new ProductCreateRequest
        {
            Name = "Model",
            Brand = "Brand",
            Description = "Desc",
            Price = 100,
            ImageUrl = "https://example.com/model.jpg",
            SizesCsv = " , , ",
            StockQty = 2
        });

        // Assert
        var exception = await act.Should().ThrowAsync<AppException>();
        exception.Which.ErrorCode.Should().Be("INVALID_SIZES");
        exception.Which.StatusCode.Should().Be(400);
    }
}