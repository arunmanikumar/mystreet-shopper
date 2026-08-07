using System.Collections.Generic;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using MyStreet.Domain.Entities;
using MyStreet.Infrastructure.Services;

namespace MyStreet.Tests;

public class JwtTokenGeneratorTests
{
    [Fact]
    public void GenerateToken_WithValidConfiguration_ReturnsJwt()
    {
        var inMemory = new Dictionary<string, string?>
        {
            ["JwtSettings:Issuer"] = "mystreet",
            ["JwtSettings:Audience"] = "mystreet-users",
            ["JwtSettings:SigningKey"] = new string('a', 32)
        };

        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemory).Build();
        var generator = new JwtTokenGenerator(config);

        var user = new User { Id = Guid.NewGuid(), Email = "test@example.com", FirstName = "Test", LastName = "User", IsAdmin = false };

        var token = generator.GenerateToken(user);

        token.Should().NotBeNullOrWhiteSpace();
        token.Split('.').Length.Should().Be(3);
    }

    [Fact]
    public void GenerateToken_MissingIssuer_Throws()
    {
        var inMemory = new Dictionary<string, string?>
        {
            ["JwtSettings:Audience"] = "mystreet-users",
            ["JwtSettings:SigningKey"] = new string('a', 32)
        };

        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemory).Build();
        var generator = new JwtTokenGenerator(config);

        var user = new User { Id = Guid.NewGuid(), Email = "a@b.com", FirstName = "A", LastName = "B", IsAdmin = false };

        Action act = () => generator.GenerateToken(user);

        act.Should().Throw<InvalidOperationException>().WithMessage("*issuer*");
    }

    [Fact]
    public void GenerateToken_MissingAudience_Throws()
    {
        var inMemory = new Dictionary<string, string?>
        {
            ["JwtSettings:Issuer"] = "mystreet",
            ["JwtSettings:SigningKey"] = new string('a', 32)
        };

        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemory).Build();
        var generator = new JwtTokenGenerator(config);

        var user = new User { Id = Guid.NewGuid(), Email = "a@b.com", FirstName = "A", LastName = "B", IsAdmin = false };

        Action act = () => generator.GenerateToken(user);

        act.Should().Throw<InvalidOperationException>().WithMessage("*audience*");
    }

    [Fact]
    public void GenerateToken_MissingSigningKey_Throws()
    {
        var inMemory = new Dictionary<string, string?>
        {
            ["JwtSettings:Issuer"] = "mystreet",
            ["JwtSettings:Audience"] = "mystreet-users"
        };

        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemory).Build();
        var generator = new JwtTokenGenerator(config);

        var user = new User { Id = Guid.NewGuid(), Email = "a@b.com", FirstName = "A", LastName = "B", IsAdmin = false };

        Action act = () => generator.GenerateToken(user);

        act.Should().Throw<InvalidOperationException>().WithMessage("*signing key*");
    }

    [Fact]
    public void GenerateToken_ShortSigningKey_Throws()
    {
        var inMemory = new Dictionary<string, string?>
        {
            ["JwtSettings:Issuer"] = "mystreet",
            ["JwtSettings:Audience"] = "mystreet-users",
            ["JwtSettings:SigningKey"] = "short-key"
        };

        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemory).Build();
        var generator = new JwtTokenGenerator(config);

        var user = new User { Id = Guid.NewGuid(), Email = "a@b.com", FirstName = "A", LastName = "B", IsAdmin = false };

        Action act = () => generator.GenerateToken(user);

        act.Should().Throw<InvalidOperationException>().WithMessage("*at least 32*");
    }
}
