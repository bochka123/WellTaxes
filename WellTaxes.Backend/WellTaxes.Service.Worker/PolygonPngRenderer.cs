using NetTopologySuite.Geometries;
using SkiaSharp;

namespace WellTaxes.Service.Worker
{
    public static class PolygonPngRenderer
    {
        public static void RenderToPng(string path, IEnumerable<Geometry> geometries, int width = 1600, int height = 1000)
        {
            var env = new Envelope();
            foreach (var g in geometries) env.ExpandToInclude(g.EnvelopeInternal);

            var padX = env.Width * 0.05;
            var padY = env.Height * 0.05;
            env.ExpandBy(padX, padY);

            using var bitmap = new SKBitmap(width, height);
            using var canvas = new SKCanvas(bitmap);
            canvas.Clear(SKColors.White);

            using var fillPaint = new SKPaint { Style = SKPaintStyle.Fill, Color = new SKColor(0, 120, 255, 60), IsAntialias = true };
            using var strokePaint = new SKPaint { Style = SKPaintStyle.Stroke, Color = new SKColor(0, 80, 200, 200), StrokeWidth = 1, IsAntialias = true };

            foreach (var g in geometries)
            {
                DrawGeometry(canvas, g, env, width, height, fillPaint, strokePaint);
            }

            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            using var fs = File.OpenWrite(path);
            data.SaveTo(fs);
        }

        private static void DrawGeometry(SKCanvas canvas, Geometry g, Envelope env, int width, int height, SKPaint fill, SKPaint stroke)
        {
            switch (g)
            {
                case Polygon p:
                    DrawPolygon(canvas, p, env, width, height, fill, stroke);
                    break;
                case MultiPolygon mp:
                    for (int i = 0; i < mp.NumGeometries; i++)
                        DrawGeometry(canvas, mp.GetGeometryN(i), env, width, height, fill, stroke);
                    break;
                default:
                    break;
            }
        }

        private static void DrawPolygon(SKCanvas canvas, Polygon poly, Envelope env, int width, int height, SKPaint fill, SKPaint stroke)
        {
            using var path = new SKPath();

            AddRing(path, poly.ExteriorRing, env, width, height);
            for (int i = 0; i < poly.NumInteriorRings; i++)
                AddRing(path, poly.GetInteriorRingN(i), env, width, height);

            canvas.DrawPath(path, fill);
            canvas.DrawPath(path, stroke);
        }

        private static void AddRing(SKPath path, LineString ring, Envelope env, int width, int height)
        {
            var coords = ring.Coordinates;
            if (coords.Length == 0) return;

            var p0 = WorldToScreen(coords[0], env, width, height);
            path.MoveTo(p0);

            for (int i = 1; i < coords.Length; i++)
            {
                var pi = WorldToScreen(coords[i], env, width, height);
                path.LineTo(pi);
            }
            path.Close();
        }

        private static SKPoint WorldToScreen(Coordinate c, Envelope env, int width, int height)
        {
            var x = (float)((c.X - env.MinX) / env.Width * width);
            var y = (float)(height - ((c.Y - env.MinY) / env.Height * height));
            return new SKPoint(x, y);
        }
    }
}
