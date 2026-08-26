$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

foreach ($directory in @('lessons', 'reading', 'phonics')) {
  New-Item -ItemType Directory -Path (Join-Path $root $directory) -Force | Out-Null
}

foreach ($week in 1..4) {
  $weekHtml = @"
<!doctype html>
<html lang="en-US" translate="no">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Week $week — Animals</title><link rel="stylesheet" href="css/styles.css"></head>
<body class="week-home" data-week="$week"><main id="week-app"></main><script src="js/data.js"></script><script src="js/main.js"></script><script src="js/week-home.js"></script></body>
</html>
"@
  Set-Content -LiteralPath (Join-Path $root "week-$week.html") -Value $weekHtml -Encoding utf8

  foreach ($page in 1..7) {
    $pagePadded = $page.ToString('00')
    $lessonHtml = @"
<!doctype html>
<html lang="en-US" translate="no">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Literacy Week $week — Page $page — Animals</title><link rel="stylesheet" href="../css/styles.css"></head>
<body class="lesson-page" data-week="$week" data-page="$page"><main id="literacy-app"></main><script src="../js/data.js"></script><script src="../js/main.js"></script><script src="../js/literacy.js"></script></body>
</html>
"@
    Set-Content -LiteralPath (Join-Path $root "lessons\week-$week-page-$pagePadded.html") -Value $lessonHtml -Encoding utf8
  }

  foreach ($track in @('reading', 'phonics')) {
    $trackTitle = (Get-Culture).TextInfo.ToTitleCase($track)
    $trackHtml = @"
<!doctype html>
<html lang="en-US" translate="no">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>$trackTitle Week $week — Animals</title><link rel="stylesheet" href="../css/styles.css"><link rel="stylesheet" href="../css/reading-phonics-shell.css"></head>
<body class="lesson-page" data-week="$week" data-track="$track"><main id="track-app"></main><script src="../js/data.js"></script><script src="../js/main.js"></script><script src="../js/track.js"></script></body>
</html>
"@
    Set-Content -LiteralPath (Join-Path $root "$track\week-$week.html") -Value $trackHtml -Encoding utf8
  }

  foreach ($assetType in @('images', 'audio', 'video')) {
    $assetDirectory = Join-Path $root "assets\$assetType\week-$week"
    New-Item -ItemType Directory -Path $assetDirectory -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $assetDirectory '.gitkeep') -Value '' -Encoding utf8
  }
}
