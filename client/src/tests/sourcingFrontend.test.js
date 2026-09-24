import assert from 'node:assert/strict';
import { productRequestService } from '../services/productRequest.service.js';
import { quoteService } from '../services/quote.service.js';

console.log('====================================================');
console.log('🚀 Executing SajiloMarts Frontend Sourcing & Quote Test Suite');
console.log('====================================================');

// Test 1: Sourcing service method signatures
assert.strictEqual(typeof productRequestService.createRequest, 'function', 'createRequest must be a function');
assert.strictEqual(typeof productRequestService.getUserRequests, 'function', 'getUserRequests must be a function');
assert.strictEqual(typeof productRequestService.getRequestById, 'function', 'getRequestById must be a function');
assert.strictEqual(typeof productRequestService.generateQuote, 'function', 'generateQuote must be a function');
assert.strictEqual(typeof productRequestService.confirmQuote, 'function', 'confirmQuote must be a function');
assert.strictEqual(typeof productRequestService.cancelRequest, 'function', 'cancelRequest must be a function');
console.log('✅ Client productRequestService method signatures verified');

// Test 2: Quote service method signatures
assert.strictEqual(typeof quoteService.calculateQuote, 'function', 'calculateQuote must be a function');
console.log('✅ Client quoteService method signatures verified');

console.log('🎉 All frontend Sourcing & Quote unit checks PASSED!');
