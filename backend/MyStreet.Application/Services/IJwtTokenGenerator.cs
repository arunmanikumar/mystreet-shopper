using MyStreet.Domain.Entities;

namespace MyStreet.Application.Services;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
