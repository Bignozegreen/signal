export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan } = req.body;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  const priceIds = {
    starter: 'price_1TYoRNFLrUCIoBlRNyvHrF70',
    pro: 'price_1TYoSyFLrUCIoBlRXrwB9l4g',
    analyst: 'price_1TYoUBFLrUCIoBlRfB2pDDKb'
  };

  const priceId = priceIds[plan];
  if (!priceId) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  const baseUrl = 'https://signal-chi-bay.vercel.app';

  const params = new URLSearchParams({
    'mode': 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'success_url': `${baseUrl}/dashboard.html?subscribed=true`,
    'cancel_url': `${baseUrl}/index.html`
  });

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const session = await response.json();

    if (session.url) {
      res.status(200).json({ url: session.url });
    } else {
      res.status(500).json({ error: 'Could not create checkout session', detail: session });
    }
  } catch (err) {
    res.status(500).json({ error: 'Checkout failed' });
  }
}
