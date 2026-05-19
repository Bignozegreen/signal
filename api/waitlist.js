export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  const response = await fetch(`${supabaseUrl}/rest/v1/waitlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ email })
  });

  if (response.status === 201) {
    return res.status(200).json({ success: true });
  } else if (response.status === 409) {
    return res.status(200).json({ success: true, message: 'Already registered' });
  } else {
    return res.status(500).json({ error: 'Could not save email' });
  }
}
