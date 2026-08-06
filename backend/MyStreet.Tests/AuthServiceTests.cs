using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Primitives;
using MyStreet.Application.Contracts;
using MyStreet.Application.Exceptions;
using MyStreet.Infrastructure;
using MyStreet.Infrastructure.Repositories;
using MyStreet.Infrastructure.Services;

namespace MyStreet.Tests;

public class AuthServiceTests
{
    [Fact]
    public async Task RegisterAsync_NormalizesEmailAndSetsNonAdminUser()
    {
        await using var context = CreateContext();
        var repository = new UserRepository(context);
        var hasher = new PasswordHasher();
        var tokenGenerator = new JwtTokenGenerator(CreateConfiguration());
        var service = new AuthService(repository, hasher, tokenGenerator);

        var response = await service.RegisterAsync(new RegisterRequest
        {
            FirstName = "Ada",
            LastName = "Lovelace",
            Email = "ADA@Example.COM",
            Password = "P@ssw0rd123"
        });

        response.Email.Should().Be("ada@example.com");
        response.FirstName.Should().Be("Ada");
        response.LastName.Should().Be("Lovelace");
        response.IsAdmin.Should().BeFalse();
        response.Token.Should().NotBeNullOrWhiteSpace();

        var savedUser = await context.Users.SingleAsync();
        savedUser.Email.Should().Be("ada@example.com");
        savedUser.IsAdmin.Should().BeFalse();
        hasher.Verify("P@ssw0rd123", savedUser.PasswordHash).Should().BeTrue();
    }

    [Fact]
    public async Task RegisterAsync_ThrowsWhenEmailAlreadyExists()
    {
        await using var context = CreateContext();
        var repository = new UserRepository(context);
        var hasher = new PasswordHasher();
        var tokenGenerator = new JwtTokenGenerator(CreateConfiguration());
        var service = new AuthService(repository, hasher, tokenGenerator);

        await service.RegisterAsync(new RegisterRequest
        {
            FirstName = "Ada",
            LastName = "Lovelace",
            Email = "ada@example.com",
            Password = "P@ssw0rd123"
        });

        var act = async () => await service.RegisterAsync(new RegisterRequest
        {
            FirstName = "Grace",
            LastName = "Hopper",
            Email = "ADA@EXAMPLE.COM",
            Password = "P@ssw0rd123"
        });

        var exception = await act.Should().ThrowAsync<AppException>();
        exception.Which.ErrorCode.Should().Be("EMAIL_ALREADY_EXISTS");
        exception.Which.StatusCode.Should().Be(409);
    }

    [Fact]
    public async Task LoginAsync_ReturnsInvalidCredentialsForWrongPassword()
    {
        await using var context = CreateContext();
        var repository = new UserRepository(context);
        var hasher = new PasswordHasher();
        var tokenGenerator = new JwtTokenGenerator(CreateConfiguration());
        var service = new AuthService(repository, hasher, tokenGenerator);

        await service.RegisterAsync(new RegisterRequest
        {
            FirstName = "Ada",
            LastName = "Lovelace",
            Email = "ada@example.com",
            Password = "P@ssw0rd123"
        });

        var act = async () => await service.LoginAsync(new LoginRequest
        {
            Email = "ada@example.com",
            Password = "wrong-password"
        });

        var exception = await act.Should().ThrowAsync<AppException>();
        exception.Which.ErrorCode.Should().Be("INVALID_CREDENTIALS");
        exception.Which.StatusCode.Should().Be(401);
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private static Microsoft.Extensions.Configuration.IConfiguration CreateConfiguration()
    {
        return new TestConfiguration();
    }

    private sealed class TestConfiguration : Microsoft.Extensions.Configuration.IConfiguration
    {
        private readonly Dictionary<string, string?> _data = new()
        {
            ["JwtSettings:Issuer"] = "MyStreet.Test",
            ["JwtSettings:Audience"] = "MyStreet.Client",
            ["JwtSettings:SigningKey"] = "development_secret_key_32chars_minimum!"
        };

        public string? this[string key]
        {
            get => _data.TryGetValue(key, out var value) ? value : null;
            set => _data[key] = value;
        }

        public IEnumerable<IConfigurationSection> GetChildren()
        {
            return Enumerable.Empty<IConfigurationSection>();
        }

        public Microsoft.Extensions.Primitives.IChangeToken GetReloadToken()
        {
            return new TestChangeToken();
        }

        public IConfigurationSection GetSection(string key)
        {
            return new TestConfigurationSection(_data, key);
        }
    }

    private sealed class TestConfigurationSection : Microsoft.Extensions.Configuration.IConfigurationSection
    {
        private readonly Dictionary<string, string?> _data;
        private readonly string _key;

        public TestConfigurationSection(Dictionary<string, string?> data, string key)
        {
            _data = data;
            _key = key;
        }

        public string? this[string key]
        {
            get => _data.TryGetValue($"{_key}:{key}", out var value) ? value : null;
            set => _data[$"{_key}:{key}"] = value;
        }

        public string Key => _key;

        public string Path => _key;

        public string? Value
        {
            get => _data.TryGetValue(_key, out var value) ? value : null;
            set => _data[_key] = value;
        }

        public IEnumerable<IConfigurationSection> GetChildren()
        {
            return Enumerable.Empty<IConfigurationSection>();
        }

        public Microsoft.Extensions.Primitives.IChangeToken GetReloadToken()
        {
            return new TestChangeToken();
        }

        public IConfigurationSection GetSection(string key)
        {
            return new TestConfigurationSection(_data, $"{_key}:{key}");
        }
    }

    private sealed class TestChangeToken : Microsoft.Extensions.Primitives.IChangeToken
    {
        public bool HasChanged => false;
        public bool ActiveChangeCallbacks => false;

        public IDisposable RegisterChangeCallback(Action<object?> callback, object? state)
        {
            return new EmptyDisposable();
        }

        private sealed class EmptyDisposable : IDisposable
        {
            public void Dispose()
            {
            }
        }
    }
}
