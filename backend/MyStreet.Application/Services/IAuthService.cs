using System.Threading;
using System.Threading.Tasks;
using MyStreet.Application.Contracts;

namespace MyStreet.Application.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
}
