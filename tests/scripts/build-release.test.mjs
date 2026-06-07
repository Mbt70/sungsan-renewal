import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('release build script', () => {
  it('excludes install data shop and legacy diagnostic/import files from deployment zip', () => {
    const source = readFileSync(path.join(process.cwd(), 'scripts', 'build-release.ps1'), 'utf8');

    for (const directory of ['data', 'install', 'shop']) {
      assert.match(source, new RegExp(`"${directory}"`));
    }

    for (const deniedPath of [
      'g4_import.php',
      'g4_import_run.php',
      'yc4_import.php',
      'yc4_import_run.php',
      'orderupgrade.php',
      'shop.config.php',
      'adm\\phpinfo.php',
    ]) {
      assert.match(source, new RegExp(deniedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }

    assert.match(source, /releaseDenyPaths/);
    assert.match(source, /function Get-RelativeReleasePath/);
    assert.match(source, /function Test-ReleaseFileAllowed/);
    assert.match(source, /Refusing to package a file outside www/);
    assert.match(source, /\[System\.IO\.Compression\.ZipFile\]::Open/);
    assert.match(source, /\[System\.IO\.Compression\.ZipFileExtensions\]::CreateEntryFromFile/);
    assert.match(source, /\$relativePath = Get-RelativeReleasePath/);
    assert.match(source, /if \(-not \(Test-ReleaseFileAllowed -RelativePath \$relativePath\)\)/);
    assert.doesNotMatch(source, /stagingPath/);
  });

  it('creates a SHA256 checksum beside the deployment zip', () => {
    const source = readFileSync(path.join(process.cwd(), 'scripts', 'build-release.ps1'), 'utf8');

    assert.match(source, /Get-FileHash/);
    assert.match(source, /-Algorithm SHA256/);
    assert.match(source, /\$checksumPath/);
    assert.match(source, /\.sha256/);
    assert.match(source, /Set-Content/);
    assert.match(source, /Release checksum created/);
  });

  it('keeps accidental secrets dumps backups and deployment keys out of the release zip', () => {
    const source = readFileSync(path.join(process.cwd(), 'scripts', 'build-release.ps1'), 'utf8');
    const runbook = readFileSync(path.join(process.cwd(), 'docs', 'operations', 'cafe24-deployment.md'), 'utf8');

    for (const directory of ['backup', 'backups', 'dumps', 'secrets', 'release']) {
      assert.match(source, new RegExp(`"${directory}"`));
    }

    for (const pattern of [
      '^\\.env($|\\.)',
      'dbconfig\\.php$',
      '\\.(sql|dump|bak)$',
      '\\.sql\\.(gz|zip)$',
      '\\.(pem|key|ppk|p12)$',
    ]) {
      assert.match(source, new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }

    assert.match(source, /releaseDenyFilePatterns/);
    assert.match(source, /foreach \(\$pattern in \$releaseDenyFilePatterns\)/);
    assert.match(source, /if \(\$fileName -match \$pattern\)/);
    assert.match(runbook, /\.env/);
    assert.match(runbook, /DB dump/);
    assert.match(runbook, /백업/);
    assert.match(runbook, /비밀키/);
  });

  it('documents checksum verification in the Cafe24 runbook', () => {
    const source = readFileSync(path.join(process.cwd(), 'docs', 'operations', 'cafe24-deployment.md'), 'utf8');

    assert.match(source, /SHA256/);
    assert.match(source, /Get-FileHash/);
    assert.match(source, /\.sha256/);
    assert.match(source, /SFTP/);
  });
});
