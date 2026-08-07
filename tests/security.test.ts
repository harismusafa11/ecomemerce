import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

process.env.SECURITY_SALT = 'unit-test-salt';

const { hashPassword, verifyPassword, isValidEmail, sanitizeInput, isValidPassword, generateAuthToken, verifyAuthToken } = await import('../lib/security.ts');

test('hashPassword/verifyPassword roundtrip', () => {
    const hash = hashPassword('Secret123');
    assert.ok(hash);
    assert.notEqual(hash, 'Secret123');
    assert.equal(verifyPassword('Secret123', hash), true);
    assert.equal(verifyPassword('wrong', hash), false);
    assert.equal(verifyPassword('Secret123', ''), false);
});

test('isValidEmail', () => {
    assert.equal(isValidEmail('user@example.com'), true);
    assert.equal(isValidEmail(' a@b.co '), true);
    assert.equal(isValidEmail('not-an-email'), false);
    assert.equal(isValidEmail(''), false);
    assert.equal(isValidEmail('a@b'), false);
});

test('sanitizeInput strips tags and trims', () => {
    assert.equal(sanitizeInput('  <script>alert(1)</script>  '), 'scriptalert(1)/script');
    assert.equal(sanitizeInput('hello'), 'hello');
    assert.equal(sanitizeInput('x'.repeat(600), 500).length, 500);
});

test('isValidPassword', () => {
    assert.equal(isValidPassword('Secret123').valid, true);
    assert.equal(isValidPassword('short').valid, false);
    assert.equal(isValidPassword('lowercase123').valid, false);
    assert.equal(isValidPassword('UPPERCASE123').valid, false);
    assert.equal(isValidPassword('NoNumber!').valid, false);
});

test('auth token roundtrip and tamper detection', () => {
    const token = generateAuthToken(42);
    const payload = verifyAuthToken(token);
    assert.ok(payload);
    assert.equal(payload!.userId, 42);
    assert.ok(payload!.expires > Date.now());

    const [enc, sig] = token.split('.');
    const tampered = `${Buffer.from('1.9999999999999').toString('base64url')}.${sig}`;
    assert.equal(verifyAuthToken(tampered), null);
    assert.equal(verifyAuthToken('garbage'), null);
    assert.equal(verifyAuthToken(''), null);
});

test('expired auth token is rejected', () => {
    const expiredPayload = `1.${Date.now() - 1000}`;
    const enc = Buffer.from(expiredPayload).toString('base64url');
    const sig = crypto.createHmac('sha256', 'unit-test-salt').update(expiredPayload).digest('base64url');
    assert.equal(verifyAuthToken(`${enc}.${sig}`), null);
});
