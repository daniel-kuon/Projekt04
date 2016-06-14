using Microsoft.EntityFrameworkCore;

namespace ScrumBoard.Models
{
    /*Schritte für neue Tabelle:
     * 1. Klasss, die von Entity erbt erstellen
     * 2. DbSet hier hinzufügen
     * 3. Klasse in OnModelCreating registrieren
     * 4. dotnet ef migrations add NAME --context SbDbContext
     * 5. dotnet ef database update NAME --context SbDbContext
     *
    */

    public class SbDbContext:DbContext
    {
        public SbDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Project> Projects { get; set; }
        public DbSet<Column> Columns { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Project>();
            modelBuilder.Entity<Column>();
        }
    }
}