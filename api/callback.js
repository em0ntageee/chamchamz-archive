export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Missing code parameter');
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).send(`GitHub OAuth Error: ${data.error_description || data.error}`);
    }

    const token = data.access_token;
    
    // Ép trình duyệt chuyển hướng thẳng kèm token về trang admin, bỏ qua popup script
    return res.redirect(302, `https://chamchamz-archive.vercel.app/admin/#/access_token=${token}&provider=github`);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
}
