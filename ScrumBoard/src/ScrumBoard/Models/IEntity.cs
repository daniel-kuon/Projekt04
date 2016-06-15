namespace ScrumBoard.Models
{
    public interface IEntity
    {
        bool RemoveFromContext(SbDbContext context);
        bool AddOrUpdate(SbDbContext context);
    }
}