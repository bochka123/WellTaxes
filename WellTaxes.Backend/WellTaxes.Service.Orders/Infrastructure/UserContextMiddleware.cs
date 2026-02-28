using Microsoft.Identity.Web;

namespace WellTaxes.Service.Orders.Infrastructure
{
    public class UserContextMiddleware(RequestDelegate next, ILogger<UserContextMiddleware> logger)
    {
        public async Task InvokeAsync(HttpContext context, Core.Interfaces.IUserContext userContext)
        {
            try
            {
                var user = context.User;

                if (user?.Identity?.IsAuthenticated == true)
                {
                    var userIdClaim = user.FindFirst(ClaimConstants.ObjectId)?.Value
                                   ?? user.FindFirst("oid")?.Value
                                   ?? user.FindFirst("sub")?.Value;

                    if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var userId))
                    {
                        userContext.SetUserId(userId);
                        logger.LogDebug("User context set for user: {UserId}", userId);
                    }
                    else
                    {
                        logger.LogWarning("User is authenticated but user ID claim not found or invalid");
                    }
                }
                else
                {
                    logger.LogDebug("User is not authenticated");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while setting user context");
            }

            await next(context);
        }
    }

    public static class UserContextMiddlewareExtensions
    {
        public static IApplicationBuilder UseUserContext(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<UserContextMiddleware>();
        }
    }
}
