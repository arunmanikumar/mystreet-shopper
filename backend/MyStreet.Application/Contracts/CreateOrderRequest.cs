using System.ComponentModel.DataAnnotations;

namespace MyStreet.Application.Contracts;

public class CreateOrderRequest
{
    [Required]
    [MinLength(1)]
    public List<CreateOrderItemRequest> Items { get; set; } = [];

    [Required]
    [MaxLength(250)]
    public string ShippingAddress { get; set; } = string.Empty;

    [Required]
    public OrderPaymentMethod? PaymentMethod { get; set; }
}