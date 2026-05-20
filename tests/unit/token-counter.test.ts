import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { approximateTokens, countTokens, countTokensForLanguage, getTokensPerChar } from '../../src/core/token-counter.js';

describe('TokenCounter', () => {
  describe('approximateTokens', () => {
    it('returns 0 for empty string', () => { assert.strictEqual(approximateTokens(''), 0); });
    it('returns approximately 1 token per 3.6 characters', () => {
      const text = 'a '.repeat(360);
      const result = approximateTokens(text);
      assert.ok(Math.abs(result - 200) <= 10, `expected ~100, got ${result}`);
    });
    it('handles short strings', () => {
      assert.ok(approximateTokens('hello') >= 1);
      assert.ok(approximateTokens('hello world') >= 2);
    });
    it('handles typical code snippet', () => {
      const code = 'function test() { return 42; }';
      assert.ok(approximateTokens(code) >= 1);
    });
  });

  describe('countTokens', () => {
    it('returns 0 for empty string', () => { assert.strictEqual(countTokens(''), 0); });
    it('counts single word as 1 token', () => { assert.strictEqual(countTokens('hello'), 1); });
    it('counts multi-word strings', () => {
      const result = countTokens('hello world foo');
      assert.ok(result >= 3, `expected >= 3, got ${result}`);
    });
    it('recognizes common programming keywords as 1 token', () => {
      assert.strictEqual(countTokens('function'), 1);
      assert.strictEqual(countTokens('const'), 1);
      assert.strictEqual(countTokens('return'), 1);
    });
    it('handles realistic code', () => {
      const code = 'const x = 42;\nconsole.log(x);';
      const result = countTokens(code);
      assert.ok(result >= 5, `expected >= 5, got ${result}`);
    });
    it('splits long identifiers into subword tokens', () => {
      const long = 'VeryLongVariableNameWithCamelCaseAndMore';
      assert.ok(countTokens(long) > 1, 'long identifier should split into multiple tokens');
    });
  });

  describe('countTokensForLanguage', () => {
    it('uses language-specific ratios', () => {
      const text = 'function hello() { return 42; }';
      const ts = countTokensForLanguage(text, 'typescript');
      const prose = countTokensForLanguage(text, 'prose');
      assert.ok(ts !== prose, 'different languages should yield different counts');
    });
    it('returns consistent results for same input', () => {
      const text = 'const x = 42;';
      assert.strictEqual(countTokensForLanguage(text, 'typescript'), countTokensForLanguage(text, 'typescript'));
    });
    it('handles unknown language with default ratio', () => {
      const text = 'some longer text here to show the difference between ratios';
      const unknown = countTokensForLanguage(text, 'unknown_lang'); // 1/3.6
      const xmlDefault = countTokensForLanguage(text, 'xml'); // 1/4.2
      assert.ok(unknown > 0);
      assert.notStrictEqual(unknown, xmlDefault);
    });
  });

  describe('getTokensPerChar', () => {
    it('returns positive ratios', () => {
      assert.ok(getTokensPerChar('typescript') > 0);
      assert.ok(getTokensPerChar('python') > 0);
    });
    it('returns default ratio for unknown language', () => {
      assert.strictEqual(getTokensPerChar('unknown'), getTokensPerChar('unknown'));
      assert.ok(getTokensPerChar('unknown') > 0);
    });
    it('recognizes various programming languages', () => {
      ['typescript', 'python', 'go', 'java', 'rust', 'html', 'css', 'json'].forEach(lang => {
        assert.ok(getTokensPerChar(lang) > 0, `${lang} should have a ratio`);
      });
    });
  });
});
