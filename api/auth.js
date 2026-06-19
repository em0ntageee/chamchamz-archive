/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function handler(req, res) {
  const client_id = process.env.OAUTH_CLIENT_ID || process.env.GITHUB_OAUTH_CLIENT_ID;
  
  if (!client_id) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.writeHead(500);
    res.write(`
      <html>
        <head>
          <title>Lỗi Máy Chủ | Chamchamz Archive</title>
          <style>
            body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f0f9ff; color: #1e293b; }
            .card { background: white; padding: 2rem; border-radius: 1rem; border: 3px solid #0f172a; box-shadow: 4px 4px 0 0 #0f172a; max-width: 400px; text-align: center; }
            h2 { color: #e11d48; margin-top: 0; }
            code { background: #ffe4e6; color: #be123c; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Lỗi Cấu Hình GitHub OAuth 🚨</h2>
            <p>Ứng dụng chưa được cấu hình <code>OAUTH_CLIENT_ID</code> hoặc <code>GITHUB_OAUTH_CLIENT_ID</code> trong cấu hình môi trường.</p>
            <p style="font-size: 0.8rem; color: #64748b;">Vui lòng thêm biến môi trường này vào trang cấu hình máy chủ của bạn trước khi tiếp tục.</p>
          </div>
        </body>
      </html>
    `);
    res.end();
    return;
  }

  // Generate unique state string and scope parameters
  // Decap CMS looks for access and write repository controls, so default scopes include 'repo'
  const scopes = req.query?.scope || 'repo,user';
  const state = Math.random().toString(36).substring(2, 15);

  const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${scopes}&state=${state}`;
  
  // High reliability manual HTTP redirect
  res.writeHead(302, { Location: authorizeUrl });
  res.end();
}
