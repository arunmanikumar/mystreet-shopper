using System.Text.Json.Serialization;

namespace MyStreet.Application.Contracts;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum OrderPaymentMethod
{
    COD,
    UPI,
    Zelle,
}