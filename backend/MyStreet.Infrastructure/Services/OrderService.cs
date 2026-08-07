using Microsoft.EntityFrameworkCore;
using MyStreet.Application.Contracts;
using MyStreet.Application.Exceptions;
using MyStreet.Application.Services;
using MyStreet.Domain.Entities;

namespace MyStreet.Infrastructure.Services;

public sealed class OrderService : IOrderService
{
    private const string PlacedStatus = "PLACED";

    private readonly ApplicationDbContext _context;
    private readonly IOrderRepository _orderRepository;
    private readonly IProductRepository _productRepository;

    public OrderService(
        ApplicationDbContext context,
        IOrderRepository orderRepository,
        IProductRepository productRepository)
    {
        _context = context;
        _orderRepository = orderRepository;
        _productRepository = productRepository;
    }

    public async Task<OrderResponse> CreateAsync(Guid userId, CreateOrderRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedItems = NormalizeItems(request.Items);

        if (normalizedItems.Count == 0)
        {
            throw new AppException("EMPTY_CART", "At least one order item is required.", 400);
        }

        var paymentMethod = request.PaymentMethod ?? throw new AppException("INVALID_PAYMENT_METHOD", "Payment method must be COD, UPI, or Zelle.", 400);
        var shippingAddress = request.ShippingAddress?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(shippingAddress))
        {
            throw new AppException("INVALID_SHIPPING_ADDRESS", "Shipping address is required.", 400);
        }

        var orderItems = new List<OrderItem>();
        decimal totalAmount = 0m;

        await using var transaction = _context.Database.IsRelational()
            ? await _context.Database.BeginTransactionAsync(cancellationToken)
            : null;

        try
        {
            foreach (var item in normalizedItems)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId, cancellationToken)
                    ?? throw new AppException("PRODUCT_NOT_FOUND", $"Product '{item.ProductId}' does not exist.", 404);

                if (!HasSize(product.SizesCsv, item.Size))
                {
                    throw new AppException("INVALID_SIZE", $"Size '{item.Size}' is not available for product '{product.Name}'.", 400);
                }

                if (item.Quantity > product.StockQty)
                {
                    throw new AppException("INSUFFICIENT_STOCK", $"Not enough stock for product '{product.Name}' in size '{item.Size}'.", 400);
                }

                var stockReserved = await TryReserveStockAsync(product, item.Quantity, cancellationToken);

                if (!stockReserved)
                {
                    throw new AppException("INSUFFICIENT_STOCK", $"Not enough stock for product '{product.Name}' in size '{item.Size}'.", 400);
                }

                var lineTotal = product.Price * item.Quantity;
                totalAmount += lineTotal;

                orderItems.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    ProductName = product.Name,
                    Size = item.Size,
                    Quantity = item.Quantity,
                    Price = product.Price,
                    Order = null!,
                    Product = null!
                });
            }

            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                User = null!,
                ShippingAddress = shippingAddress,
                PaymentMethod = paymentMethod.ToString(),
                Status = PlacedStatus,
                TotalAmount = totalAmount,
                CreatedAt = DateTime.UtcNow,
                OrderItems = orderItems
            };

            var created = await _orderRepository.AddAsync(order, cancellationToken);

            if (transaction is not null)
            {
                await transaction.CommitAsync(cancellationToken);
            }

            return ToResponse(created);
        }
        catch
        {
            if (transaction is not null)
            {
                await transaction.RollbackAsync(cancellationToken);
            }

            throw;
        }
    }

    public async Task<IReadOnlyList<OrderResponse>> GetMineAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var orders = await _orderRepository.GetMineAsync(userId, cancellationToken);
        return orders.Select(ToResponse).ToList();
    }

    public async Task<OrderResponse> GetByIdAsync(Guid userId, bool isAdmin, Guid id, CancellationToken cancellationToken = default)
    {
        var order = await _orderRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new AppException("ORDER_NOT_FOUND", "The requested order was not found.", 404);

        if (!isAdmin && order.UserId != userId)
        {
            throw new AppException("ORDER_FORBIDDEN", "You are not allowed to view this order.", 403);
        }

        return ToResponse(order);
    }

    private static OrderResponse ToResponse(Order order)
    {
        return new OrderResponse
        {
            Id = order.Id,
            UserId = order.UserId,
            ShippingAddress = order.ShippingAddress,
            PaymentMethod = order.PaymentMethod,
            Status = order.Status,
            TotalAmount = order.TotalAmount,
            CreatedAt = order.CreatedAt,
            OrderItems = order.OrderItems
                .OrderBy(item => item.ProductName)
                .ThenBy(item => item.Size)
                .Select(item => new OrderItemResponse
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    Size = item.Size,
                    Quantity = item.Quantity,
                    Price = item.Price,
                    LineTotal = item.Price * item.Quantity
                })
                .ToList()
        };
    }

    private static List<NormalizedOrderItem> NormalizeItems(IEnumerable<CreateOrderItemRequest> items)
    {
        var normalizedItems = new List<NormalizedOrderItem>();

        foreach (var item in items)
        {
            if (!item.ProductId.HasValue)
            {
                throw new AppException("INVALID_ORDER_ITEM", "Each order item must reference a product.", 400);
            }

            if (!item.Quantity.HasValue || item.Quantity.Value <= 0)
            {
                throw new AppException("INVALID_ORDER_ITEM", "Each order item must have a quantity of at least 1.", 400);
            }

            if (string.IsNullOrWhiteSpace(item.Size))
            {
                throw new AppException("INVALID_ORDER_ITEM", "Each order item must include a selected size.", 400);
            }

            normalizedItems.Add(new NormalizedOrderItem(
                item.ProductId.Value,
                item.Size.Trim(),
                item.Quantity.Value));
        }

        return normalizedItems;
    }

    private static bool HasSize(string sizesCsv, string size)
    {
        return SplitSizesCsv(sizesCsv)
            .Any(item => string.Equals(item, size, StringComparison.OrdinalIgnoreCase));
    }

    private static IEnumerable<string> SplitSizesCsv(string sizesCsv)
    {
        return sizesCsv
            .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
            .Where(item => !string.IsNullOrWhiteSpace(item));
    }

    private async Task<bool> TryReserveStockAsync(Product product, int quantity, CancellationToken cancellationToken)
    {
        if (_context.Database.IsRelational())
        {
            var affectedRows = await _context.Products
                .Where(item => item.Id == product.Id && item.StockQty >= quantity)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(item => item.StockQty, item => item.StockQty - quantity), cancellationToken);

            return affectedRows == 1;
        }

        if (product.StockQty < quantity)
        {
            return false;
        }

        product.StockQty -= quantity;
        return await _productRepository.UpdateAsync(product, cancellationToken);
    }

    private sealed record NormalizedOrderItem(Guid ProductId, string Size, int Quantity);
}