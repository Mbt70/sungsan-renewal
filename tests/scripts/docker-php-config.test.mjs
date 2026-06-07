import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function readPhpIni() {
  return readFileSync(path.join(process.cwd(), 'docker', 'php', 'php.ini'), 'utf8');
}

function readIniValue(source, key) {
  const pattern = new RegExp(`^\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=\\s*([^\\r\\n]+)`, 'm');
  const match = source.match(pattern);
  return match ? match[1].trim().replace(/^"|"$/g, '') : null;
}

function parseSize(value) {
  const match = String(value).match(/^(\d+)([KMG])?$/i);
  if (!match) {
    throw new Error(`Cannot parse PHP size value: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = (match[2] || '').toUpperCase();
  const multiplier = unit === 'G' ? 1024 : unit === 'K' ? 1 / 1024 : 1;

  return amount * multiplier;
}

describe('docker php security config', () => {
  it('keeps runtime errors private and hides PHP version details', () => {
    const source = readPhpIni();

    assert.equal(readIniValue(source, 'display_errors'), 'Off');
    assert.equal(readIniValue(source, 'log_errors'), 'On');
    assert.equal(readIniValue(source, 'expose_php'), 'Off');
  });

  it('keeps uploads within the planned operating limit', () => {
    const source = readPhpIni();

    assert.ok(parseSize(readIniValue(source, 'upload_max_filesize')) <= 20);
    assert.ok(parseSize(readIniValue(source, 'post_max_size')) <= 24);
  });

  it('sets baseline session cookie protections for staging parity', () => {
    const source = readPhpIni();

    assert.equal(readIniValue(source, 'session.cookie_httponly'), '1');
    assert.equal(readIniValue(source, 'session.cookie_samesite'), 'Lax');
    assert.equal(readIniValue(source, 'session.use_strict_mode'), '1');
  });
});
