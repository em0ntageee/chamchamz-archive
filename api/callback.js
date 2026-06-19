export default async function handler(req, res) {
  // Cấu hình Header cho phép nhận phản hồi từ mọi nguồn để tránh bị chặn trình duyệt
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  const { code } = req.query;

  if (!code) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(400).send('<h3>Lỗi: Thiếu tham số code từ GitHub</h3>');
  }

  try {
    // Sử dụng fetch tích hợp sẵn cấu hình chi tiết
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code: code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(400).send(`<h3>GitHub OAuth Error: ${data.error_description || data.error}</h3>`);
    }

    // Đoạn mã script chuẩn gửi token về cửa sổ mẹ và tự đóng popup
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authenticating...</title>
      </head>
      <body>
        <p>Đang xác thực quyền quản trị, vui lòng đợi...</p>
        <script>
          (function() {
            function recieve() {
              window.opener.postMessage(
                'authorization:github:success:${JSON.stringify({
                  token: data.access_token,
                  provider: 'github',
                })}',
                window.location.origin
              );
              window.close();
            }
            setTimeout(recieve, 500);
          })();
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(content);
  } catch (error) {
    console.error(error);
    res.setHeader('Content-Type', 'text/html');
    return res.status(500).send(`<h3>Server Error: ${error.message}</h3>`);
  }
}
