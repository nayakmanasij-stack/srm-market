import { useEffect, useState } from 'react'
import './App.css'

const categories = ['Books', 'Electronics', 'Cycles', 'Hostel essentials', 'Other']
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

async function requestListings(options) {
  const response = await fetch('/api/listings', options)
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || 'Could not reach the marketplace API. Please try again.')
  }
  return response.json()
}

export default function App() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [loadAttempt, setLoadAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    requestListings({ signal: controller.signal }).then(setListings).catch((error) => {
      if (!controller.signal.aborted) setLoadError(error.message)
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [loadAttempt])

  function retry() {
    setLoading(true)
    setLoadError('')
    setLoadAttempt((previous) => previous + 1)
  }

  async function publish(event) {
    event.preventDefault()
    if (saving) return

    const form = event.currentTarget
    const fields = Object.fromEntries(new FormData(form))
    setSaving(true)
    setFeedback(null)
    try {
      const listing = await requestListings({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, price: Number(fields.price) }),
      })
      setListings((previous) => [listing, ...previous.filter(({ _id }) => _id !== listing._id)].slice(0, 50))
      form.reset()
      setFeedback({ message: 'Listing published.' })
      if (loadError) retry()
    } catch (error) {
      setFeedback({ message: error.message, error: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <main>
      <header className="masthead">
        <p className="eyebrow">SRM MARKET</p>
        <h1>Campus marketplace</h1>
        <p>Post an item for sale or browse the latest listings.</p>
      </header>
      <div className="market">
        <section className="panel" aria-labelledby="post-title">
          <h2 id="post-title">Post a listing</h2>
          <form onSubmit={publish}>
            <label>Item name<input name="title" required maxLength="80" /></label>
            <label>Category<select name="category" defaultValue="" required>
              <option value="" disabled>Choose a category</option>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select></label>
            <label>Price (₹)<input name="price" type="number" min="1" max="100000" step="1" required /></label>
            <label>Description<textarea name="description" required maxLength="500" rows="4" /></label>
            <button type="submit" disabled={loading || saving}>{saving ? 'Publishing…' : 'Publish listing'}</button>
            {feedback && <p role={feedback.error ? 'alert' : 'status'} className={feedback.error ? 'error' : 'success'}>{feedback.message}</p>}
          </form>
        </section>
        <section className="listings" aria-labelledby="listings-title" aria-busy={loading}>
          <h2 id="listings-title">Latest listings</h2>
          {loading && <p role="status">Loading listings…</p>}
          {loadError && <div className="panel"><p role="alert" className="error">{loadError}</p><button type="button" disabled={saving} onClick={retry}>Try again</button></div>}
          {!loading && !loadError && listings.length === 0 && <p className="panel">No listings yet. Post the first item using the form.</p>}
          {listings.length > 0 && <ul className="listing-list">
            {listings.map((listing) => <li className="panel listing" key={listing._id}>
              <div className="listing-top"><span>{listing.category}</span><strong>{currency.format(listing.price)}</strong></div>
              <h3>{listing.title}</h3>
              <p>{listing.description}</p>
            </li>)}
          </ul>}
        </section>
      </div>
    </main>
  )
}
