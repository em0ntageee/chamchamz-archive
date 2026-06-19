/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default async function handler(req, res) {
  // Safe helper to extract search queries from native Node req
  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const client_id = process.env.OAUTH_CLIENT_ID || process.env.GITHUB_OAUTH_CLIENT_ID;
  const client_secret = process.env.OAUTH_CLIENT_SECRET || process.env.GITHUB_OAUTH_CLIENT_SECRET;

  if (!code) {
    return sendResponse(res, 'error', 'Không nhận được mã ủy quyền (code) từ GitHub.');
  }

  if (!client_id || !client_secret) {
    return sendResponse(res, 'error', 'Thiếu biến môi trường cấu hình danh tính ứng dụng GITHUB_OAUTH_CLIENT_ID hoặc GITHUB_OAUTH_CLIENT_SECRET.');
  }

  try {
    // Swap code for access token via a secure GitHub endpoint invocation
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
        state
      })
    });

    if (!tokenResponse.ok) {
      throw new Error(`Đường truyền GitHub báo lỗi HTTP: ${tokenResponse.status}`);
    }

    const data = await tokenResponse.json();

    if (data.error) {
      return sendResponse(res, 'error', `GitHub phản hồi lỗi: ${data.error_description || data.error}`);
    }

    if (data.access_token) {
      return sendResponse(res, 'success', {
        token: data.access_token,
        provider: 'github'
      });
    }

    return sendResponse(res, 'error', 'Ủy quyền thành công nhưng không tìm thấy token đăng nhập trong tệp trả về.');
  } catch (err) {
    return sendResponse(res, 'error', err instanceof Error ? err.message : 'Đã có sự cố ngoài ý muốn trong quá trình bắt tay OAuth.');
  }
}

function sendResponse(res, status, content) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.writeHead(200);

  let statusContainerHTML = '';
  let communicationScript = '';

  if (status === 'success') {
    const serializedPayload = JSON.stringify(content);
    statusContainerHTML = `
      <div class="success-box">
        <div class="emoji">🎉</div>
        <h2>Đăng Nhập Thành Công!</h2>
        <p>Đang gửi mã bảo mật đến bảng quản lý của bạn...</p>
        <p class="sub-alert">Cửa sổ phụ này sẽ tự động đóng ngay.</p>
      </div>
    `;
    
    // Netlify CMS / Decap CMS listens precisely to values of format 'authorization:provider:status:JSON_STRING'
    // Sending both wildcard "*" and origin is the gold standard for reliable cross-domain popup communication
    communicationScript = `
      (function() {
        const payload = ${serializedPayload};
        const messageKey = 'authorization:github:success:' + JSON.stringify(payload);
        
        // Write fallback token credentials directly into the same-domain localStorage
        try {
          const cmsUser = {
            backendName: 'github',
            token: payload.token,
            useLocalGit: false
          };
          localStorage.setItem('netlify-cms-user', JSON.stringify(cmsUser));
          localStorage.setItem('decap-cms-user', JSON.stringify(cmsUser));
          console.log("Saved fallback local storage credentials successfully.");
        } catch(err) {
          console.error("Local storage credentials write failed:", err);
        }
        
        if (window.opener) {
          try {
            window.opener.postMessage(messageKey, window.location.origin);
          } catch(e) {
            console.warn("Retrying with wildcard origin due to modern cross-origin constraints.");
          }
          window.opener.postMessage(messageKey, '*');
          
          setTimeout(function() {
            window.close();
          }, 600);
        } else {
          document.querySelector('p').innerText = 'Kết nối thành công! Cửa sổ phụ sẽ tự đóng và trang chính sẽ tự động đăng nhập.';
          setTimeout(function() {
            window.close();
          }, 1500);
        }
      })();
    `;
  } else {
    statusContainerHTML = `
      <div class="error-box">
        <div class="emoji">⚠️</div>
        <h2>Sự Cố Xác Thực</h2>
        <p>${content}</p>
        <button onclick="window.close()" class="close-btn">Đóng Cửa Sổ</button>
      </div>
    `;
    communicationScript = `
      (function() {
        const messageKey = 'authorization:github:error:${content}';
        if (window.opener) {
          window.opener.postMessage(messageKey, window.location.origin);
          window.opener.postMessage(messageKey, '*');
        }
      })();
    `;
  }

  res.write(`
    <!doctype html>
    <html lang="vi">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác Thực OAuth | Chamchamz Archive</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f9ff;
            color: #1e293b;
          }
          .box {
            background: white;
            padding: 2rem;
            border-radius: 1.5rem;
            border: 4px solid #0f172a;
            box-shadow: 6px 6px 0 0 #0f172a;
            max-width: 440px;
            width: 90%;
            text-align: center;
            box-sizing: border-box;
          }
          .success-box h2 {
            color: #0284c7;
            margin-top: 0.5rem;
          }
          .error-box h2 {
            color: #ef4444;
            margin-top: 0.5rem;
          }
          .emoji {
            font-size: 3rem;
          }
          p {
            font-weight: 500;
            line-height: 1.5;
            color: #475569;
          }
          .sub-alert {
            font-size: 0.8rem;
            color: #94a3b8;
            margin-top: 1rem;
          }
          .close-btn {
            background: #0f172a;
            color: white;
            border: none;
            padding: 0.6rem 1.2rem;
            border-radius: 0.5rem;
            font-weight: bold;
            cursor: pointer;
            margin-top: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="box">
          ${statusContainerHTML}
        </div>
        <script>
          ${communicationScript}
        </script>
      </body>
    </html>
  `);

  res.end();
}
