using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using ScrumBoard.Models;

namespace ScrumBoard.Migrations
{
    [DbContext(typeof(SbDbContext))]
    [Migration("20160614092310_Project")]
    partial class Project
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "1.0.0-rc2-20901")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("ScrumBoard.Models.Project", b =>
                {
                    b.Property<int?>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTime>("Deadline");

                    b.Property<string>("Description");

                    b.Property<DateTime>("InsertDate");

                    b.Property<string>("Name");

                    b.Property<DateTime>("UpdateDate");

                    b.HasKey("Id");

                    b.ToTable("Projects");
                });
        }
    }
}
