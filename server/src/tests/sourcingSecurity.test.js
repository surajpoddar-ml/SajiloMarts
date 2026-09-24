import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { normalizeProductUrl, detectMarketplace, resolveAuthoritativeMarketplace } from '../utils/urlSecurity.js';
import { validateCreateProductRequest } from '../validations/productRequest.validation.js';
import { productRequestService } from '../services/productRequest.service.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/index.js';

test('Sourcing Request URL Security & SSRF Protection Test Suite', async (t) => {
  await t.test('1. Normalizes valid Indian marketplace URLs correctly', () => {
    const rawAmazon = 'https://www.amazon.in/dp/B08N5WRWNW?utm_source=fb&ref=xyz#overview';
    const cleanAmazon = normalizeProductUrl(rawAmazon);
    assert.strictEqual(cleanAmazon, 'https://www.amazon.in/dp/B08N5WRWNW');
    assert.strictEqual(detectMarketplace(cleanAmazon), 'amazon-india');

    const rawFlipkart = 'https://www.flipkart.com/boat-rockerz-450/p/itm12345?gclid=abc';
    const cleanFlipkart = normalizeProductUrl(rawFlipkart);
    assert.strictEqual(cleanFlipkart, 'https://www.flipkart.com/boat-rockerz-450/p/itm12345');
    assert.strictEqual(detectMarketplace(cleanFlipkart), 'flipkart');
  });

  await t.test('2. Rejects private network and SSRF targets', () => {
    const ssrfTargets = [
      'http://localhost:5000/secret',
      'http://127.0.0.1:8080/admin',
      'http://0.0.0.0:3000',
      'http://10.0.0.1/product',
      'http://192.168.1.1/router',
      'http://172.16.0.5/api',
      'http://169.254.169.254/latest/meta-data/',
      'http://internal-db.corp/data',
      'ftp://amazon.in/file',
      'javascript:alert(1)',
    ];

    for (const url of ssrfTargets) {
      assert.throws(
        () => normalizeProductUrl(url),
        (err) => err instanceof BadRequestError,
        `Expected ${url} to be rejected as an SSRF/unsafe target`
      );
    }
  });

  await t.test('3. Rejects non-standard network ports in product URLs', () => {
    assert.throws(
      () => normalizeProductUrl('https://www.amazon.in:8443/product'),
      (err) => err instanceof BadRequestError
    );
  });

  await t.test('4. Validates required sourcing fields in request validator', () => {
    // Missing URL
    assert.throws(
      () => validateCreateProductRequest({ productName: 'Phone', productPriceInr: 100 }),
      (err) => err instanceof BadRequestError && err.message.includes('Product URL')
    );

    // Missing Name
    assert.throws(
      () => validateCreateProductRequest({ productUrl: 'https://amazon.in/p/1', productPriceInr: 100 }),
      (err) => err instanceof BadRequestError && err.message.includes('Product name')
    );

    // Invalid Quantity
    assert.throws(
      () => validateCreateProductRequest({
        productUrl: 'https://amazon.in/p/1',
        productName: 'Watch',
        quantity: -5,
      }),
      (err) => err instanceof BadRequestError && err.message.includes('Quantity')
    );
  });
});
