namespace WellTaxes.Service.Core.Interfaces
{
    public interface IUserContext
    {
        Guid UserId { get; }
        bool IsAuthenticated { get; }
        void SetUserId(Guid userId);
    }
}
