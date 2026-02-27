using WellTaxes.Service.Core.Interfaces;

namespace WellTaxes.Service.Core.Services
{
    public class UserContext : IUserContext
    {
        private Guid _userId;

        public Guid UserId
        {
            get
            {
                if (_userId == Guid.Empty)
                {
                    throw new UnauthorizedAccessException("User is not authenticated");
                }
                return _userId;
            }
        }

        public bool IsAuthenticated => _userId != Guid.Empty;

        public void SetUserId(Guid userId)
        {
            _userId = userId;
        }
    }
}
