namespace MyStreet.Domain.Entities;

public sealed class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = new Order();
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = new Product();
    public string ProductName { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}
