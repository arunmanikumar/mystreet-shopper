namespace MyStreet.Api.Services;

public interface IStatusService
{
    string ApplicationName { get; }
    string Status { get; }
    string Framework { get; }
    DateTime UtcNow { get; }
}
