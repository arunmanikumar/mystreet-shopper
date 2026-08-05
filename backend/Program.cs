using MyStreet.Shoppers.Api.Models;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://localhost:5000");

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

var sneakers = new List<Sneaker>
{
    new Sneaker(1, "Street Runner", "Performance sneaker with mesh upper and responsive cushioning.", 129.99M, "Men", string.Empty),
    new Sneaker(2, "Court Classic", "Retro court silhouette with leather construction and durable grip.", 139.99M, "Unisex", string.Empty),
    new Sneaker(3, "Trail Blaze", "All-terrain sneaker with reinforced sole and premium traction.", 149.99M, "Outdoor", string.Empty),
    new Sneaker(4, "Velocity Mid", "Lightweight mid-top sneaker built for everyday comfort.", 119.99M, "Lifestyle", string.Empty),
    new Sneaker(5, "Urban Flex", "Low-profile sneaker with knit upper and modern city style.", 99.99M, "Lifestyle", string.Empty)
};

app.MapGet("/api/sneakers", () => Results.Ok(sneakers));

app.MapPost("/api/checkout", (CheckoutRequest request) =>
{
    var validItems = request.Items.Where(item => sneakers.Any(s => s.Id == item.SneakerId)).ToList();
    if (!validItems.Any())
    {
        return Results.BadRequest(new { message = "Cart items are invalid." });
    }

    var total = validItems.Sum(item => sneakers.First(s => s.Id == item.SneakerId).Price * item.Quantity);
    var orderId = Guid.NewGuid().ToString("N");

    var response = new OrderResponse(orderId, total, "Order received locally.");
    return Results.Ok(response);
});

app.Run();
