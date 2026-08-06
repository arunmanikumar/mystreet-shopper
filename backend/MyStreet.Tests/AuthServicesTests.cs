using System.IdentityModel.Tokens.Jwt;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using MyStreet.Domain.Entities;
using MyStreet.Infrastructure.Services;

namespace MyStreet.Tests;

public class AuthServicesTests
{
    [Fact]
    public void JwtTokenGenerator_GeneratesExpectedClaims()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:Issuer"] = "MyStreet.Test",
                ["JwtSettings:Audience"] = "MyStreet.Client",
                ["JwtSettings:SigningKey"] = "development_secret_key_32chars_minimum!"
            })
            .Build();

        var generator = new JwtTokenGenerator(configuration);
        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Ada",
            LastName = "Lovelace",
            Email = "ada@example.com",
            IsAdmin = true
        };

        var token = generator.GenerateToken(user);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        jwt.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == user.Id.ToString());
        jwt.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Email && c.Value == user.Email);
        jwt.Claims.Should().Contain(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier" && c.Value == user.Id.ToString());
        jwt.Claims.Should().Contain(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name" && c.Value == "Ada Lovelace");
        jwt.Claims.Should().Contain(c => c.Type == "isAdmin" && c.Value == "True");
    }

    [Fact]
    public void PasswordHasher_ProducesVerifiableHash()
    {
        var hasher = new PasswordHasher();

        var hash = hasher.Hash("P@ssw0rd123");

        hasher.Verify("P@ssw0rd123", hash).Should().BeTrue();
        hasher.Verify("wrong-password", hash).Should().BeFalse();
    }
}
