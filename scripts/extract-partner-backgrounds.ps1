Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

$partnerDirectory = Join-Path $PSScriptRoot "../public/partners"
$logos = @(
  @{ Source = "ace-trans.png"; Target = "ace-trans-cutout.png"; Mode = "white-with-mark" },
  @{ Source = "avc-securite.jpg"; Target = "avc-securite-cutout.png"; Mode = "white" },
  @{ Source = "eden-park.jpg"; Target = "eden-park-logo.png"; Mode = "white"; Crop = $true },
  @{ Source = "soditra.jpg"; Target = "soditra-cutout.png"; Mode = "white" },
  @{ Source = "equip-jardin.png"; Target = "equip-jardin-cutout.png"; Mode = "solid"; Background = @(135, 192, 65); Foreground = @(30, 95, 50) },
  @{ Source = "bregent.png"; Target = "bregent-cutout.png"; Mode = "solid"; Background = @(28, 14, 31); Foreground = @(48, 26, 47) }
)

foreach ($logo in $logos) {
  $sourcePath = Join-Path $partnerDirectory $logo.Source
  $targetPath = Join-Path $partnerDirectory $logo.Target
  $original = [System.Drawing.Bitmap]::new($sourcePath)
  $input = [System.Drawing.Bitmap]::new($original.Width, $original.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($input)
  $graphics.DrawImage($original, [System.Drawing.Rectangle]::new(0, 0, $original.Width, $original.Height))
  $graphics.Dispose()
  $original.Dispose()

  $rect = [System.Drawing.Rectangle]::new(0, 0, $input.Width, $input.Height)
  $lock = $input.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $bytes = [byte[]]::new($lock.Stride * $input.Height)
  [System.Runtime.InteropServices.Marshal]::Copy($lock.Scan0, $bytes, 0, $bytes.Length)
  $input.UnlockBits($lock)
  $input.Dispose()

  for ($y = 0; $y -lt $rect.Height; $y++) {
    for ($x = 0; $x -lt $rect.Width; $x++) {
      $index = ($y * $lock.Stride) + ($x * 4)
      if ($logo.Mode -eq "solid") {
        $background = $logo.Background
        $foreground = $logo.Foreground
        $opacity = 0.0
        for ($channel = 0; $channel -lt 3; $channel++) {
          $byteIndex = $index + (2 - $channel)
          $opacity += ($bytes[$byteIndex] - $background[$channel]) / (255.0 - $background[$channel])
        }
        $alpha = [int][Math]::Round([Math]::Max(0.0, [Math]::Min(1.0, $opacity / 3.0)) * 255)
        $bytes[$index] = [byte]$foreground[2]
        $bytes[$index + 1] = [byte]$foreground[1]
        $bytes[$index + 2] = [byte]$foreground[0]
        $bytes[$index + 3] = [byte]$alpha
        continue
      }

      # Keep the white stars and lettering within the blue ACE TRANS globe.
      if ($logo.Mode -eq "white-with-mark") {
        $ellipse = [Math]::Pow(($x - 140.0) / 94.0, 2) + [Math]::Pow(($y - 105.0) / 94.0, 2)
        if ($ellipse -lt 0.94) { continue }
      }
      $minimum = [Math]::Min($bytes[$index], [Math]::Min($bytes[$index + 1], $bytes[$index + 2]))
      $alpha = 255 - $minimum
      if ($alpha -lt 14) { $alpha = 0 }
      if ($alpha -gt 0) {
        for ($channel = 0; $channel -lt 3; $channel++) {
          $composite = $bytes[$index + $channel]
          $unmatted = (($composite * 255) - ((255 - $alpha) * 255)) / $alpha
          $bytes[$index + $channel] = [byte][Math]::Max(0.0, [Math]::Min(255.0, [Math]::Round($unmatted)))
        }
      }
      $bytes[$index + 3] = [byte]$alpha
    }
  }

  $result = [System.Drawing.Bitmap]::new($rect.Width, $rect.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $resultLock = $result.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $resultLock.Scan0, $bytes.Length)
  $result.UnlockBits($resultLock)
  if ($logo.Crop) {
    $minX = $rect.Width
    $minY = $rect.Height
    $maxX = 0
    $maxY = 0
    for ($y = 0; $y -lt $rect.Height; $y++) {
      for ($x = 0; $x -lt $rect.Width; $x++) {
        if ($bytes[(($y * $lock.Stride) + ($x * 4)) + 3] -gt 20) {
          $minX = [Math]::Min($minX, $x)
          $minY = [Math]::Min($minY, $y)
          $maxX = [Math]::Max($maxX, $x)
          $maxY = [Math]::Max($maxY, $y)
        }
      }
    }
    $padding = 16
    $left = [Math]::Max(0, $minX - $padding)
    $top = [Math]::Max(0, $minY - $padding)
    $crop = [System.Drawing.Rectangle]::new($left, $top, [Math]::Min($rect.Width - $left, $maxX - $left + $padding + 1), [Math]::Min($rect.Height - $top, $maxY - $top + $padding + 1))
    $cropped = $result.Clone($crop, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $cropped.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
  } else {
    $result.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  $result.Dispose()
  Write-Output $targetPath
}
