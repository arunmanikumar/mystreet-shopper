namespace MyStreet.Domain.Entities;

public sealed class Order
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = new User();
    public string ShippingAddress { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
