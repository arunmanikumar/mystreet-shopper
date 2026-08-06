using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using MyStreet.Application.Exceptions;

namespace MyStreet.Api.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            _logger.LogWarning(ex, "Application exception for request {Path} with code {ErrorCode}", context.Request.Path, ex.ErrorCode);
            await WriteResponseAsync(context, ex.StatusCode, ex.ErrorCode, ex.Message, context.Request.Path);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception for request {Path}", context.Request.Path);
            await WriteResponseAsync(context, (int)HttpStatusCode.InternalServerError, "INTERNAL_SERVER_ERROR", "An unexpected error occurred.", context.Request.Path);
        }
    }

    private static Task WriteResponseAsync(HttpContext context, int statusCode, string error, string message, string path)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var payload = new
        {
            timestamp = DateTime.UtcNow.ToString("o"),
            path,
            error,
            message
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(payload, JsonOptions));
    }
}
