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
});
