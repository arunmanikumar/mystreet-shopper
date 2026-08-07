using FluentAssertions;
using Moq;
using MyStreet.Application.Contracts;
using MyStreet.Application.Exceptions;
using MyStreet.Application.Services;
using MyStreet.Domain.Entities;
using MyStreet.Infrastructure.Services;

namespace MyStreet.Tests;

public class AuthServiceTests
{
    [Fact]
    public async Task RegisterAsync_SuccessfulRegistration_ReturnsAuthResponse()
    {
        // Arrange
        var repository = new Mock<IUserRepository>();
        var passwordHasher = new Mock<IPasswordHasher>();
        var tokenGenerator = new Mock<IJwtTokenGenerator>();
        User? savedUser = null;

        repository
            .Setup(repo => repo.EmailExistsAsync("ada@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        repository
            .Setup(repo => repo.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .Callback<User, CancellationToken>((user, _) => savedUser = user)
            .Returns(Task.CompletedTask);

        repository
            .Setup(repo => repo.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        passwordHasher
            .Setup(hasher => hasher.Hash("P@ssw0rd123"))
            .Returns("hashed-password");

        tokenGenerator
            .Setup(generator => generator.GenerateToken(It.IsAny<User>()))
            .Returns("token-value");

        var service = new AuthService(repository.Object, passwordHasher.Object, tokenGenerator.Object);

        // Act
        var response = await service.RegisterAsync(new RegisterRequest
        {
            FirstName = "Ada",
            LastName = "Lovelace",
            Email = "ADA@Example.COM",
            Password = "P@ssw0rd123"
        });

        // Assert
        response.Email.Should().Be("ada@example.com");
        response.Token.Should().Be("token-value");
        response.FirstName.Should().Be("Ada");
        response.LastName.Should().Be("Lovelace");
        response.IsAdmin.Should().BeFalse();

        savedUser.Should().NotBeNull();
        savedUser!.Email.Should().Be("ada@example.com");
        savedUser.IsAdmin.Should().BeFalse();

        repository.Verify(repo => repo.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        tokenGenerator.Verify(generator => generator.GenerateToken(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ThrowsConflict()
    {
        // Arrange
        var repository = new Mock<IUserRepository>();
        var passwordHasher = new Mock<IPasswordHasher>();
        var tokenGenerator = new Mock<IJwtTokenGenerator>();

        repository
            .Setup(repo => repo.EmailExistsAsync("ada@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var service = new AuthService(repository.Object, passwordHasher.Object, tokenGenerator.Object);

        // Act
        var act = async () => await service.RegisterAsync(new RegisterRequest
        {
            FirstName = "Grace",
            LastName = "Hopper",
            Email = "ADA@EXAMPLE.COM",
            Password = "P@ssw0rd123"
        });

        // Assert
        var exception = await act.Should().ThrowAsync<AppException>();
        exception.Which.ErrorCode.Should().Be("EMAIL_ALREADY_EXISTS");
        exception.Which.StatusCode.Should().Be(409);

        repository.Verify(repo => repo.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
        repository.Verify(repo => repo.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task RegisterAsync_AlwaysCreatesNonAdmin()
    {
        // Arrange
        var repository = new Mock<IUserRepository>();
        var passwordHasher = new Mock<IPasswordHasher>();
        var tokenGenerator = new Mock<IJwtTokenGenerator>();
        User? savedUser = null;

        repository
            .Setup(repo => repo.EmailExistsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        repository
            .Setup(repo => repo.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .Callback<User, CancellationToken>((user, _) => savedUser = user)
            .Returns(Task.CompletedTask);

        repository
            .Setup(repo => repo.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        passwordHasher
            .Setup(hasher => hasher.Hash(It.IsAny<string>()))
            .Returns("hash-value");

        tokenGenerator
            .Setup(generator => generator.GenerateToken(It.IsAny<User>()))
            .Returns("token");

        var service = new AuthService(repository.Object, passwordHasher.Object, tokenGenerator.Object);

        // Act
        await service.RegisterAsync(new RegisterRequest
        {
            FirstName = "Jane",
            LastName = "Doe",
            Email = "jane@example.com",
            Password = "StrongPwd123"
        });

        // Assert
        savedUser.Should().NotBeNull();
        savedUser!.IsAdmin.Should().BeFalse();
    }

    [Fact]
    public async Task RegisterAsync_PasswordIsHashedBeforePersisting()
    {
        // Arrange
        var repository = new Mock<IUserRepository>();
        var passwordHasher = new Mock<IPasswordHasher>();
        var tokenGenerator = new Mock<IJwtTokenGenerator>();
        User? savedUser = null;

        repository
            .Setup(repo => repo.EmailExistsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        repository
            .Setup(repo => repo.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .Callback<User, CancellationToken>((user, _) => savedUser = user)
            .Returns(Task.CompletedTask);

        repository
            .Setup(repo => repo.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        passwordHasher
            .Setup(hasher => hasher.Hash("PlainPassword"))
            .Returns("hashed-value");

        tokenGenerator
            .Setup(generator => generator.GenerateToken(It.IsAny<User>()))
            .Returns("token");

        var service = new AuthService(repository.Object, passwordHasher.Object, tokenGenerator.Object);

        // Act
        await service.RegisterAsync(new RegisterRequest
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            Password = "PlainPassword"
        });

        // Assert
        passwordHasher.Verify(hasher => hasher.Hash("PlainPassword"), Times.Once);
        savedUser.Should().NotBeNull();
        savedUser!.PasswordHash.Should().Be("hashed-value");
    }

    [Fact]
    public async Task LoginAsync_SuccessfulLogin_ReturnsAuthResponse()
    {
        // Arrange
        var repository = new Mock<IUserRepository>();
        var passwordHasher = new Mock<IPasswordHasher>();
        var tokenGenerator = new Mock<IJwtTokenGenerator>();
        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Ada",
            LastName = "Lovelace",
            Email = "ada@example.com",
            PasswordHash = "saved-hash",
            IsAdmin = true
        };

        repository
            .Setup(repo => repo.GetByEmailAsync("ada@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        passwordHasher
            .Setup(hasher => hasher.Verify("P@ssw0rd123", "saved-hash"))
            .Returns(true);

        tokenGenerator
            .Setup(generator => generator.GenerateToken(user))
            .Returns("jwt-token");

        var service = new AuthService(repository.Object, passwordHasher.Object, tokenGenerator.Object);

        // Act
        var response = await service.LoginAsync(new LoginRequest
        {
            Email = "ADA@EXAMPLE.COM",
            Password = "P@ssw0rd123"
        });

        // Assert
        response.Token.Should().Be("jwt-token");
        response.UserId.Should().Be(user.Id);
        response.Email.Should().Be(user.Email);
        response.IsAdmin.Should().BeTrue();
    }

    [Fact]
    public async Task LoginAsync_InvalidEmail_ThrowsInvalidCredentials()
    {
        // Arrange
        var repository = new Mock<IUserRepository>();
        var passwordHasher = new Mock<IPasswordHasher>();
        var tokenGenerator = new Mock<IJwtTokenGenerator>();

        repository
            .Setup(repo => repo.GetByEmailAsync("unknown@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var service = new AuthService(repository.Object, passwordHasher.Object, tokenGenerator.Object);

        // Act
        var act = async () => await service.LoginAsync(new LoginRequest
        {
            Email = "unknown@example.com",
            Password = "irrelevant"
        });

        // Assert
        var exception = await act.Should().ThrowAsync<AppException>();
        exception.Which.ErrorCode.Should().Be("INVALID_CREDENTIALS");
        exception.Which.StatusCode.Should().Be(401);
        passwordHasher.Verify(hasher => hasher.Verify(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ThrowsInvalidCredentials()
    {
        // Arrange
        var repository = new Mock<IUserRepository>();
        var passwordHasher = new Mock<IPasswordHasher>();
        var tokenGenerator = new Mock<IJwtTokenGenerator>();
        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Ada",
            LastName = "Lovelace",
            Email = "ada@example.com",
            PasswordHash = "saved-hash",
            IsAdmin = false
        };

        repository
            .Setup(repo => repo.GetByEmailAsync("ada@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        passwordHasher
            .Setup(hasher => hasher.Verify("wrong-password", "saved-hash"))
            .Returns(false);

        var service = new AuthService(repository.Object, passwordHasher.Object, tokenGenerator.Object);

        // Act
        var act = async () => await service.LoginAsync(new LoginRequest
        {
            Email = "ada@example.com",
            Password = "wrong-password"
        });

        // Assert
        var exception = await act.Should().ThrowAsync<AppException>();
        exception.Which.ErrorCode.Should().Be("INVALID_CREDENTIALS");
        exception.Which.StatusCode.Should().Be(401);
    }
}
