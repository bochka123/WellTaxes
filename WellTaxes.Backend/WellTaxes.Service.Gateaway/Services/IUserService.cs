using WellTaxes.Service.Gateaway.Data.Entities;

namespace WellTaxes.Service.Gateaway.Services
{
    public interface IUserService
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User?> GetUserByIdAsync(Guid id);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User?> GetUserByUsernameAsync(string username);
        Task<User> CreateUserAsync(string username, string email, string firstName, string lastName, string? phoneNumber = null);
        Task<User?> UpdateUserAsync(Guid id, string username, string email, string firstName, string lastName, string? phoneNumber = null);
        Task<bool> DeleteUserAsync(Guid id);
        Task<bool> UserExistsAsync(Guid id);
    }
}
