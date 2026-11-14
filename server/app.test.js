import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from './app.js';

const listings = [];
const Listing = {
  find() {
    return {
      sort(order) {
        assert.deepEqual(order, { createdAt: -1, _id: -1 });
        return { limit: (count) => listings.slice(0, count) };
      },
    };
  },
  create(listing) {
    const saved = { ...listing, _id: String(listings.length + 1) };
    listings.unshift(saved);
    return saved;
  },
};

test('listing requests validate input, save valid entries, and return them newest first', async (t) => {
  const server = createApp(Listing).listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  await new Promise((resolve) => server.once('listening', resolve));
  const endpoint = `http://127.0.0.1:${server.address().port}/api/listings`;
  const post = (body) => fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const valid = { title: '  Lab coat  ', description: '  Size M  ', category: 'Other', price: 250 };

  assert.deepEqual(await (await fetch(endpoint)).json(), []);
  for (const invalid of [{ price: '250' }, { price: 2.5 }, { title: ' ' }, { category: 'Pets' }]) {
    const response = await post({ ...valid, ...invalid });
    assert.equal(response.status, 400);
    assert.ok((await response.json()).error);
  }

  const response = await post({ ...valid, owner: 'ignored' });
  assert.equal(response.status, 201);
  const saved = await response.json();
  assert.deepEqual(saved, { ...valid, title: 'Lab coat', description: 'Size M', _id: '1' });
  const newer = await post({ ...valid, title: 'Engineering textbook', category: 'Books' });
  assert.equal(newer.status, 201);
  assert.deepEqual(await (await fetch(endpoint)).json(), [await newer.json(), saved]);
});
