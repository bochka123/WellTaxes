namespace WellTaxes.Service.Orders.Models
{
    public class ApiResponse
    {
        public ApiResponse(bool success)
        {
            Ok = success;
        }
        public ApiResponse(bool success, string? message) : this(success)
        {
            Message = message;
        }

        public bool Ok { get; set; }
        public string? Message { get; set; }
    }

    public class ApiResponse<T> : ApiResponse
    {
        public ApiResponse(bool success) : base(success)
        {
        }

        public ApiResponse(bool success, string? message) : base(success, message)
        {
        }

        public ApiResponse(T? data) : base(true)
        {
            Data = data;
        }

        public T? Data { get; set; }
    }
}
