import express from 'express';

const categories = ['Books', 'Electronics', 'Cycles', 'Hostel essentials', 'Other'];

function parseListing(body) {
  if (!body || typeof body !== 'object') return null;
  if (typeof body.title !== 'string' || typeof body.description !== 'string') return null;

  const title = body.title.trim();
  const description = body.description.trim();
  const { price, category } = body;
  if (!title || title.length > 80 || !description || description.length > 500) return null;
  if (!Number.isInteger(price) || price < 1 || price > 100000) return null;
  if (!categories.includes(category)) return null;

  return { title, description, price, category };
}

export function createApp(Listing) {
  const app = express();
  app.use(express.json({ limit: '8kb' }));

  app.get('/', (_req, res) => {
    res.json({ message: 'SRM Marketplace API is running!' });
  });

  app.get('/api/listings', async (_req, res) => {
    const listings = await Listing.find().sort({ createdAt: -1, _id: -1 }).limit(50);
    res.json(listings);
  });

  app.post('/api/listings', async (req, res) => {
    const listing = parseListing(req.body);
    if (!listing) {
      return res.status(400).json({
        error: 'Enter a title, description, category, and a whole-rupee price between ₹1 and ₹100,000.',
      });
    }

    const savedListing = await Listing.create(listing);
    res.status(201).json(savedListing);
  });

  app.use((err, _req, res, next) => {
    if (res.headersSent) return next(err);
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Send valid JSON.' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'The listing is too large.' });
    console.error('Listing request failed:', err.name);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  });

  return app;
}
