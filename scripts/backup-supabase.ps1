param(
  [Parameter(Mandatory = $true)][string]$Destination
)

$ErrorActionPreference = 'Stop'
$projectRef = 'csbktncqqypgwsgumfkw'
foreach ($tool in @('pg_dump', 'pg_restore')) {
  if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
    throw 'Installer les outils clients PostgreSQL compatibles avec la version du serveur avant la sauvegarde.'
  }
}
if (-not $env:PGHOST -or -not $env:PGUSER -or $env:PGDATABASE -ne 'postgres') {
  throw 'Configurer PGHOST, PGUSER et PGDATABASE=postgres sans transmettre le mot de passe dans le chat.'
}
if ($env:PGHOST -ne "db.$projectRef.supabase.co" -and
    -not ($env:PGHOST.EndsWith('.pooler.supabase.com') -and $env:PGUSER -eq "postgres.$projectRef")) {
  throw 'La connexion doit cibler Golf Prod ; utiliser la connexion directe ou le pooler en mode session.'
}
if ($env:PGPORT -and $env:PGPORT -ne '5432') {
  throw 'Utiliser le port 5432 (connexion directe ou pooler session), pas le pooler transactionnel.'
}
if ($env:PGSSLMODE -ne 'verify-full') {
  throw 'Configurer PGSSLMODE=verify-full et le certificat racine Supabase via PGSSLROOTCERT.'
}
if (-not [System.IO.Path]::IsPathRooted($Destination)) {
  throw 'La destination doit être un chemin absolu sur un stockage privé, hors du dossier public.'
}
$targetDirectory = [System.IO.Path]::GetFullPath($Destination)
$publicDirectory = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../public'))
if ($targetDirectory.TrimEnd([char[]]'\/') -eq $publicDirectory -or
    $targetDirectory.StartsWith($publicDirectory + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'La sauvegarde ne doit pas être accessible depuis le site public.'
}
New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
$stamp = [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfffZ')
$archive = Join-Path $targetDirectory "golf-prod-$stamp.dump"
$dumpErrors = & pg_dump --format=custom --no-owner --no-acl --no-password --file=$archive 2>&1
if ($LASTEXITCODE -ne 0) { throw 'Échec de sauvegarde PostgreSQL. Le fichier éventuel est incomplet ; ne pas le restaurer.' }
$listErrors = & pg_restore --list $archive 2>&1
if ($LASTEXITCODE -ne 0) { throw 'Archive illisible : ne pas utiliser cette sauvegarde.' }
$hash = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash
@{ project = $projectRef; archive = [System.IO.Path]::GetFileName($archive); sha256 = $hash;
  verified = 'Catalogue pg_restore lisible ; restauration complète encore à tester';
  scope = 'Export PostgreSQL sans propriétaires ni ACL ; fichiers Storage et médias externes non inclus'
} | ConvertTo-Json | Set-Content -LiteralPath "$archive.manifest.json" -Encoding UTF8
Write-Output "Sauvegarde créée et catalogue vérifié : $archive"
