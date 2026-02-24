using Microsoft.AspNetCore.Mvc;
using WellTaxes.Service.Gateaway.Services;

namespace WellTaxes.Service.Gateaway.Controllers
{
    /// <summary>
    /// Controller for managing users
    /// </summary>
    [ApiController]
    [Route("[controller]/[action]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Gets all users
        /// </summary>
        /// <returns>List of all users</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        /// <summary>
        /// Gets a user by ID
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>User details</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        /// <summary>
        /// Creates a new user
        /// </summary>
        /// <param name="request">User creation request</param>
        /// <returns>Created user</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
        {
            var user = await _userService.CreateUserAsync(
                request.Username,
                request.Email,
                request.FirstName,
                request.LastName,
                request.PhoneNumber);

            return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
        }

        /// <summary>
        /// Updates a user
        /// </summary>
        /// <param name="id">User ID</param>
        /// <param name="request">User update request</param>
        /// <returns>Updated user</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request)
        {
            var user = await _userService.UpdateUserAsync(
                id,
                request.Username,
                request.Email,
                request.FirstName,
                request.LastName,
                request.PhoneNumber);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        /// <summary>
        /// Deletes a user
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>No content</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _userService.DeleteUserAsync(id);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }
    }

    /// <summary>
    /// Request model for creating a user
    /// </summary>
    public record CreateUserRequest(string Username, string Email, string FirstName, string LastName, string? PhoneNumber);

    /// <summary>
    /// Request model for updating a user
    /// </summary>
    public record UpdateUserRequest(string Username, string Email, string FirstName, string LastName, string? PhoneNumber);
}
