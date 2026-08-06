using System.ComponentModel.DataAnnotations;

namespace MyStreet.Application.Contracts;

public class ProductCreateRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Brand { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal Price { get; set; }

    [Required]
    public string ImageUrl { get; set; } = string.Empty;

    [Required]
    public string SizesCsv { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int StockQty { get; set; }
}
