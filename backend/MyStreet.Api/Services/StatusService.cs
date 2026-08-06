namespace MyStreet.Api.Services;

public class StatusService : IStatusService
{
    public string ApplicationName => "MyStreet Sneakers API";
    public string Status => "Running";
    public string Framework => ".NET 10";
    public DateTime UtcNow => DateTime.UtcNow;
}
