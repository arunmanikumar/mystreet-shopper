namespace MyStreet.Shoppers.Api.Models;

public sealed record OrderResponse(string OrderId, decimal Total, string Message);
