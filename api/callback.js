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
        Accept: 'application/json',
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

    // Đoạn mã Script này cực kỳ quan trọng để gửi mã token về cho Decap CMS nhận diện
    const content = `
      <script>
        const target = window.opener || window.parent;
        if (target) {
          target.postMessage(
            'authorization:github:success:${JSON.stringify({
              token: data.access_token,
              provider: 'github',
            })}',
            window.location.origin
          );
        }
      </script>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(content);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
}
