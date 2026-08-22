// Test script for Login ID Generator utility
import { generateInitials, formatLoginId } from '../src/utils/login-id.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

console.log('Running Login ID Generator tests...');

// 1. Test initials generator
assert(generateInitials('John Doe') === 'JODO', 'John Doe should produce JODO');
assert(generateInitials('John') === 'JOHN', 'John (single word >= 4 chars) should produce JOHN');
assert(generateInitials('Adi') === 'ADIX', 'Adi (single word < 4 chars) should produce ADIX');
assert(generateInitials('Su') === 'SUXX', 'Su should produce SUXX');
assert(generateInitials('A') === 'AXXX', 'A should produce AXXX');
assert(generateInitials('John Fitz Gerald') === 'JOGE', 'John Fitz Gerald should use first and last word -> JOGE');
assert(generateInitials('  jane   smith  ') === 'JASM', 'Should handle whitespace -> JASM');

// 2. Test Login ID formatting
assert(formatLoginId('ACM', 'JODO', 2026, 1) === 'ACMJODO2026001', 'Serial 1 should be zero-padded to 001');
assert(formatLoginId('ACM', 'JODO', 2026, 99) === 'ACMJODO2026099', 'Serial 99 should be zero-padded to 099');
assert(formatLoginId('ACM', 'JODO', 2026, 100) === 'ACMJODO2026100', 'Serial 100 should remain 100');
assert(formatLoginId('acm-corp', 'jodo', '2026', 5) === 'ACMCORPJODO2026005', 'Should strip non-alphanumeric and uppercase everything');

console.log('✅ All Login ID Generator tests passed successfully!');
