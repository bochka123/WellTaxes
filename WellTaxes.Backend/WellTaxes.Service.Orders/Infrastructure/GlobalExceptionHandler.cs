using System.Net;
using System.Text.Json;
using WellTaxes.Service.Orders.Models;

namespace WellTaxes.Service.Orders.Infrastructure
{
    public class GlobalExceptionHandler(RequestDelegate next, ILogger<GlobalExceptionHandler> logger)
    {
        public async Task Invoke(HttpContext context)
        {
            try
            {
                await next(context);
            }
            catch (UnauthorizedAccessException ex)
            {
                logger.LogError(ex, "Unauthorized access exception occurred.");
                await HandleException(context, ex.Message, HttpStatusCode.BadRequest);
            }
            catch (InternalPointerBobrException ex)
            {
                logger.LogError(ex, "Invalid operation exeption.");
                await HandleException(context, ex.Message, HttpStatusCode.BadRequest);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unhandled exception occurred.");
                await HandleException(context, ex.Message, HttpStatusCode.InternalServerError);
            }
        }

        private async Task HandleException(HttpContext context, string message, HttpStatusCode statusCode)
        {
            context.Response.StatusCode = (int)statusCode;
            context.Response.ContentType = "application/json";

            var response = new ApiResponse(false, message);
            var jsonResponse = JsonSerializer.Serialize(response);

            await context.Response.WriteAsync(jsonResponse);
        }
    }
}
