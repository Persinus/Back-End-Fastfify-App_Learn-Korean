// Route phục vụ Stoplight Elements
const fp = require('fastify-plugin');

module.exports = fp(async function (fastify, opts) {
  fastify.get("/stoplight", async (request, reply) => {
    reply.type("text/html").send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Stoplight Elements</title>
          <link rel="icon" type="image/png" href="https://cdn-icons-png.flaticon.com/128/6422/6422199.png"/>
          <meta property="og:title" content="Korean Learning API Docs" />
          <meta property="og:description" content="API documentation for the Korean learning app. Try out endpoints, view schemas, and more!" />
          <meta property="og:image" content="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
          <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
          <script src="https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js"></script>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
          <style>
            body { background: #f8fafc; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .custom-header {
              display: flex;
              align-items: center;
              gap: 20px;
              background:rgb(72, 178, 223); /* Green header */
              color: #fff;
              padding: 24px 32px 18px 32px;
              border-bottom-left-radius: 24px;
              border-bottom-right-radius: 24px;
              box-shadow: 0 4px 16px rgba(34,197,94,0.08);
            }
            .custom-header img.logo {
              height: 64px;
              border-radius: 12px;
              background: #fff;
              padding: 6px;
            }
            .custom-header .info {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .custom-header .info .title {
              font-size: 2rem;
              font-weight: bold;
              letter-spacing: 1px;
            }
            .custom-header .info .desc {
              font-size: 1.1rem;
              opacity: 0.92;
            }
            .custom-header .info .links a {
              color: #facc15;
              text-decoration: none;
              margin-right: 18px;
              font-weight: 500;
            }
            .custom-header .info .links a:hover {
              text-decoration: underline;
            }
            .links .to-overview {
              background: #facc15;
              color: #1e40af !important;
              padding: 6px 16px;
              border-radius: 8px;
              margin-left: 12px;
              font-weight: 600;
              transition: background 0.2s;
            }
            .links .to-overview:hover {
              background: #fff;
              color: #1e40af !important;
              text-decoration: underline;
            }
            .team-list {
              display: flex;
              gap: 18px;
              margin-top: 10px;
            }
            .member {
              display: flex;
              flex-direction: column;
              align-items: center;
              font-size: 0.95rem;
              background: rgba(255,255,255,0.08);
              border-radius: 10px;
              padding: 8px 12px;
              transition: box-shadow 0.2s;
              min-width: 90px;
            }
            .member:hover {
              box-shadow: 0 2px 12px #fff3;
            }
            .member img {
              width: 38px;
              height: 38px;
              border-radius: 50%;
              margin-bottom: 4px;
              border: 2px solid #fff;
              object-fit: cover;
            }
            .member .role {
              font-size: 0.85em;
              opacity: 0.8;
            }
            .member .socials {
              margin-top: 4px;
              display: flex;
              gap: 8px;
            }
            .member .socials a {
              color: #fff;
              opacity: 0.7;
              font-size: 1.1em;
              transition: opacity 0.2s;
            }
            .member .socials a:hover {
              opacity: 1;
              color: #facc15;
            }
            .fe-group .fe-avatars {
              display: flex;
              align-items: center;
              margin-bottom: 4px;
            }
            .fe-group .fe-avatars img {
              width: 38px;
              height: 38px;
              border-radius: 50%;
              border: 2px solid #fff;
              object-fit: cover;
              margin-left: -12px;
              background: #fff;
              box-shadow: 0 1px 4px #0002;
            }
            .fe-group .fe-avatars img:first-child {
              margin-left: 0;
              z-index: 2;
            }
            .fe-group .fe-avatars img:last-child {
              z-index: 1;
            }
            .qr-list {
              margin-left: auto;
              display: flex;
              flex-direction: column;
              gap: 12px;
              align-items: flex-end;
            }
            .qr-item {
              display: flex;
              align-items: center;
              gap: 10px;
              cursor: pointer;
              transition: transform 0.2s;
              background: #fff2;
              border-radius: 10px;
              padding: 6px 12px;
            }
            .qr-item:hover {
              transform: scale(1.08) rotate(-3deg);
              box-shadow: 0 4px 16px #1e40af44;
              background: #fff4;
            }
            .qr-label {
              font-size: 1em;
              color: #facc15;
              margin-left: 2px;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .qr-canvas {
              border-radius: 8px;
              background: #fff;
              box-shadow: 0 2px 8px #0002;
            }
            .elements-container {
              margin: 32px auto 0 auto;
              max-width: 1200px;
              background: #fff;
              border-radius: 18px;
              box-shadow: 0 2px 16px rgba(30,64,175,0.06);
              padding: 24px;
            }
            .toast {
              position: fixed;
              top: 24px;
              right: 24px;
              background:rgb(99, 241, 151);
              color: #fff;
              padding: 14px 24px;
              border-radius: 8px;
              font-size: 1.1rem;
              box-shadow: 0 2px 12px #0002;
              opacity: 0;
              pointer-events: none;
              transition: opacity 0.3s;
              z-index: 9999;
            }
            .toast.show {
              opacity: 1;
              pointer-events: auto;
            }
          </style>
        </head>
        <body>
          <div class="custom-header">
            <img class="logo" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="Logo" />
            <div class="info">
              <div class="title">My API Documentation</div>
              <div class="desc">
                API documentation for the Korean learning app.<br>
                Backend by <b>Fastify</b> - Frontend by <b>React</b>.
              </div>
              <div class="links">
                <a href="https://your-frontend-link.com" target="_blank">Frontend</a>
                <a href="https://github.com/your-repo" target="_blank">GitHub</a>
                <a href="/overview" class="to-overview"><i class="fas fa-info-circle"></i> App Overview</a>
              </div>
              <div class="team-list">
                <div class="member">
                  <img src="https://avatars.githubusercontent.com/u/199482290?v=4" alt="Persinus"/>
                  <div>Persinus</div>
                  <div class="role">Backend</div>
                  <div class="socials">
                    <a href="https://github.com/Persinus" target="_blank" title="GitHub"><i class="fab fa-github"></i></a>
                    <a href="https://www.facebook.com/nguyen.manh.943841" target="_blank" title="Facebook"><i class="fab fa-facebook"></i></a>
                    <a href="https://github.com/Persinus/Back-End-Fastfify-App_Learn-Korean" target="_blank" title="Project Repo"><i class="fas fa-code"></i></a>
                  </div>
                </div>
                <div class="member fe-group">
                  <div class="fe-avatars">
                    <img src="https://avatars.githubusercontent.com/u/199482290?v=4" alt="Persinus"/>
                    <img src="https://avatars.githubusercontent.com/u/167536924?v=4" alt="Phan Duc Tho"/>
                  </div>
                  <div>Persinus & Phan Duc Tho</div>
                  <div class="role">Frontend</div>
                  <div class="socials">
                    <a href="https://github.com/Persinus/App_Learn_KOREAN_EXPO_ReactNative" target="_blank"  title="Project Repo"><i class="fas fa-code"></i></a>
                  </div>
                </div>
                <div class="member">
                  <img src="https://avatars.githubusercontent.com/u/167536924?v=4" alt="Phan Duc Tho"/>
                  <div>Phan Duc Tho</div>
                  <div class="role">UI/UX (Figma)</div>
                  <div class="socials">
                  <a href="https://github.com/PhanDucThoWork" target="_blank" title="GitHub"><i class="fab fa-github"></i></a>
                    <a href="https://www.facebook.com/phan.uc.tho.586318" target="_blank" title="Facebook"><i class="fab fa-facebook"></i></a>
                  </div>
                </div>
              </div>
            </div>
            <div class="qr-list">
              <div class="qr-item" onclick="window.open('https://your-frontend-link.com','_blank')">
                <canvas id="qr-fe" class="qr-canvas"></canvas>
                <span class="qr-label"><i class="fas fa-globe"></i> FE QR</span>
              </div>
              <div class="qr-item" onclick="window.open('https://www.figma.com/file/your-figma-id','_blank')">
                <canvas id="qr-figma" class="qr-canvas"></canvas>
                <span class="qr-label"><i class="fab fa-figma"></i> Figma QR</span>
              </div>
              <div class="qr-item" onclick="window.open('https://play.google.com/store/apps/details?id=your.app.id','_blank')">
                <canvas id="qr-chplay" class="qr-canvas"></canvas>
                <span class="qr-label"><i class="fab fa-google-play"></i> CH Play</span>
              </div>
            </div>
          </div>
          <div style="background:#facc15;color:#1e40af;padding:12px 20px;border-radius:8px;margin-bottom:18px;">
            <b>Guide:</b> Select an API from the left menu to view details and try requests directly in your browser.<br>
            If authentication is required, please log in and paste your token into the "Authorize" section.<br>
            You can use the search bar above to quickly find endpoints, view request/response examples, and export the OpenAPI schema.<br>
            For more details, click on each endpoint to see parameters, request bodies, and response schemas. Try out the "Try It" feature to test APIs live!
          </div>
          <div class="elements-container">
            <elements-api
              apiDescriptionUrl="/documentation/json"
              router="hash"
              layout="sidebar"
             
            />
          </div>
          <div class="toast" id="toast">API request sent successfully!</div>
          <script>
            // QR code hiệu ứng
            new QRious({
              element: document.getElementById('qr-fe'),
              value: 'https://your-frontend-link.com',
              size: 70,
              background: '#fff',
              foreground: '#1e40af',
              level: 'H'
            });
            new QRious({
              element: document.getElementById('qr-figma'),
              value: 'https://www.figma.com/file/your-figma-id',
              size: 70,
              background: '#fff',
              foreground: '#1e40af',
              level: 'H'
            });
            new QRious({
              element: document.getElementById('qr-chplay'),
              value: 'https://play.google.com/store/apps/details?id=your.app.id',
              size: 70,
              background: '#fff',
              foreground: '#1e40af',
              level: 'H'
            });

            // Toast khi execute
            setTimeout(() => {
              const observer = new MutationObserver(() => {
                const btn = document.querySelector('elements-api button[aria-label="Execute"]');
                if (btn) {
                  btn.addEventListener('click', () => {
                    showToast('API request sent successfully!');
                  });
                }
              });
              observer.observe(document.body, { childList: true, subtree: true });
            }, 1000);

            function showToast(msg) {
              const toast = document.getElementById('toast');
              toast.textContent = msg;
              toast.classList.add('show');
              setTimeout(() => toast.classList.remove('show'), 2500);
            }
          </script>
          <div id="fab" style="position:fixed;bottom:100px;right:32px;z-index:9999;display:flex;flex-direction:column;gap:18px;">
            <button onclick="window.open('/feedback','_blank')" title="Feedback" style="background:#facc15;color:#1e40af;border:none;border-radius:50%;width:56px;height:56px;box-shadow:0 2px 12px #0003;font-size:1.6em;cursor:pointer;">
              <i class="fas fa-comment-dots"></i>
            </button>
            <button onclick="window.open('/overview','_blank')" title="App Overview" style="background:#1e40af;color:#fff;border:none;border-radius:50%;width:56px;height:56px;box-shadow:0 2px 12px #0003;font-size:1.6em;cursor:pointer;">
              <i class="fas fa-info-circle"></i>
            </button>
          </div>
          <a href="/spotlight" class="back-btn"><i class="fas fa-arrow-left"></i> Back to API Docs</a>
   
          <!--Start of Tawk.to Script-->
  <!--Start of Tawk.to Script-->
  <script type="text/javascript">
  var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
  (function(){
  var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
  s1.async=true;
  s1.src='https://embed.tawk.to/682b976e714ec01918f31299/1irl4f2fo';
  s1.charset='UTF-8';
  s1.setAttribute('crossorigin','*');
  s0.parentNode.insertBefore(s1,s0);
  })();
  </script>
  <!--End of Tawk.to Script-->
  <!--End of Tawk.to Script-->
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
          })();
          </script>
          <!--End of Tawk.to Script-->
        </body>
      </html>
    `);
  });

});