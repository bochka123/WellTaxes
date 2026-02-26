using Dapper;
using Npgsql;
using WellTaxes.Service.Core.Entities;

namespace WellTaxes.Service.Worker.Extensions
{
    public static class JurisdictionExtensions
    {
        public static async Task<IEnumerable<Jurisdiction>> GetIdAndZipAsync(this NpgsqlConnection db)
        {
            var sql = @"SELECT id, zipcode FROM jurisdictions;";

            // Dapper сам відкриє і закриє connection, якщо він ще закритий
            var jurisdictions = await db.QueryAsync<Jurisdiction>(sql);

            // Очистимо Name та Geometry, щоб не було непотрібних даних
            foreach (var j in jurisdictions)
            {
                j.Name = string.Empty;
                j.Geometry = null;
                j.CreatedAt = default;
                j.UpdatedAt = default;
            }

            return jurisdictions;
        }

        public static async Task InsertJurisdictionsToDb(this NpgsqlConnection db, List<Jurisdiction> jurisdictions)
        {
            if (jurisdictions == null || jurisdictions.Count == 0)
            {
                Console.WriteLine("⚠️ No jurisdictions to insert.");
                return;
            }

            try
            {
                await db.OpenAsync();

                using var transaction = await db.BeginTransactionAsync();

                var sql = @"
                    INSERT INTO jurisdictions (id, name, zipcode, geom, created_at, updated_at)
                    VALUES (@id, @name, @zipcode, ST_GeomFromText(@wkt, 4269), @created, @updated)
                    ON CONFLICT (zipcode) DO NOTHING;
                ";

                foreach (var j in jurisdictions)
                {
                    using var cmd = new NpgsqlCommand(sql, db, transaction);
                    cmd.Parameters.AddWithValue("id", j.Id);
                    cmd.Parameters.AddWithValue("name", j.Name);
                    cmd.Parameters.AddWithValue("zipcode", j.ZipCode);
                    cmd.Parameters.AddWithValue("wkt", j.Geometry.AsText()); // конвертуємо Geometry у WKT
                    cmd.Parameters.AddWithValue("created", j.CreatedAt);
                    cmd.Parameters.AddWithValue("updated", j.UpdatedAt);

                    await cmd.ExecuteNonQueryAsync();
                }

                await transaction.CommitAsync();
                Console.WriteLine($"✅ Inserted {jurisdictions.Count} jurisdictions into database.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error inserting jurisdictions: {ex.Message}");
            }
            finally
            {
                await db.CloseAsync();
            }
        }
    }
}
