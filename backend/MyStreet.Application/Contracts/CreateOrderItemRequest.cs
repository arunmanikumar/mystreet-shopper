using System.ComponentModel.DataAnnotations;

namespace MyStreet.Application.Contracts;

public class CreateOrderItemRequest
{
    [Required]
    public Guid? ProductId { get; set; }

    [Required]
    public string Size { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int? Quantity { get; set; }
}