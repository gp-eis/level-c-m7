param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if (-not ('CheckerboardExtractor' -as [type])) {
  Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;

public static class CheckerboardExtractor
{
    private static bool IsBackground(Color color)
    {
        int max = Math.Max(color.R, Math.Max(color.G, color.B));
        int min = Math.Min(color.R, Math.Min(color.G, color.B));
        // Generated checkerboard tiles and their antialiased grid seams are
        // extremely neutral (chroma <= 5) but can fall as low as RGB 232.
        // Warm white character details have higher chroma, and flood filling
        // from the canvas edge keeps enclosed eye/book highlights intact.
        return max - min <= 5 && min >= 232;
    }

    public static void Extract(string inputPath, string outputPath)
    {
        using (var source = new Bitmap(inputPath))
        using (var output = new Bitmap(source.Width, source.Height, PixelFormat.Format32bppArgb))
        using (var graphics = Graphics.FromImage(output))
        {
            graphics.DrawImageUnscaled(source, 0, 0);
            int width = output.Width;
            int height = output.Height;
            var visited = new bool[width * height];
            var queue = new Queue<int>();

            Action<int, int> enqueue = (x, y) => {
                int index = y * width + x;
                if (visited[index] || !IsBackground(output.GetPixel(x, y))) return;
                visited[index] = true;
                queue.Enqueue(index);
            };

            for (int x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height - 1); }
            for (int y = 0; y < height; y++) { enqueue(0, y); enqueue(width - 1, y); }

            while (queue.Count > 0)
            {
                int index = queue.Dequeue();
                int x = index % width;
                int y = index / width;
                Color color = output.GetPixel(x, y);
                output.SetPixel(x, y, Color.FromArgb(0, color.R, color.G, color.B));
                if (x > 0) enqueue(x - 1, y);
                if (x + 1 < width) enqueue(x + 1, y);
                if (y > 0) enqueue(x, y - 1);
                if (y + 1 < height) enqueue(x, y + 1);
            }

            output.Save(outputPath, ImageFormat.Png);
        }
    }
}
'@
}

$resolvedInput = (Resolve-Path -LiteralPath $InputPath).Path
$outputDirectory = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$resolvedOutput = [IO.Path]::GetFullPath($OutputPath)
[CheckerboardExtractor]::Extract($resolvedInput, $resolvedOutput)
