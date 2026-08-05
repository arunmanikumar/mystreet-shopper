namespace MyStreet.Shoppers.Api.Models;

public sealed record CheckoutRequest(IEnumerable<CheckoutItem> Items);

public sealed record CheckoutItem(int SneakerId, int Quantity);
