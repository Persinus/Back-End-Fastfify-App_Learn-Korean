const fp = require('fastify-plugin');

module.exports = fp(async function (fastify, opts) {
  // Route giới thiệu App Học Tiếng Hàn
fastify.get("/overview", async (request, reply) => {
  // Gửi HTML trả về cho client
  reply.type("text/html").send(`
    <!DOCTYPE html>
    <html>
        <head>
          <title>Korean Learning App Overview</title>
          <link rel="icon" type="image/png" href="https://cdn-icons-png.flaticon.com/128/1055/1055685.png"/>
          <meta property="og:title" content="Korean Learning API Docs" />
          <meta property="og:description" content="API documentation for the Korean learning app. Try out endpoints, view schemas, and more!" />
          <meta property="og:image" content="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
          <style>
            body { background: #f8fafc; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:rgb(64, 185, 66); }
            .container { max-width: 900px; margin: 32px auto; background: #fff; border-radius: 18px; box-shadow: 0 2px 16px #1e40af22; padding: 32px; }
            .header { display: flex; align-items: center; gap: 24px; }
            .header img { width: 90px; border-radius: 16px; box-shadow: 0 2px 8px #0002; }
            .header .title { font-size: 2.2rem; font-weight: bold; color:rgb(51, 228, 90); }
            .desc { margin: 18px 0 24px 0; font-size: 1.15rem; }
            .links { display: flex; gap: 18px; margin-bottom: 18px; flex-wrap: wrap; }
            .links a {
              display: flex; align-items: center; gap: 8px;
              background: #1e40af; color: #fff; text-decoration: none;
              padding: 10px 18px; border-radius: 8px; font-weight: 500; font-size: 1.05em;
              transition: background 0.2s;
            }
            .links a:hover { background: #facc15; color: #1e40af; }
            .screenshots { display: flex; gap: 18px; margin: 24px 0; flex-wrap: wrap; }
            .screenshots img { width: 180px; border-radius: 12px; box-shadow: 0 2px 8px #0001; }
            .video-demo { margin: 24px 0; text-align: center; }
            .video-demo video { width: 100%; max-width: 600px; border-radius: 14px; box-shadow: 0 2px 12px #0002; }
            .back-btn {
              display: inline-flex; align-items: center; gap: 8px;
              background: #facc15; color: #1e40af; text-decoration: none;
              padding: 10px 18px; border-radius: 8px; font-weight: 500; font-size: 1.05em;
              margin-top: 24px; transition: background 0.2s;
            }
            .back-btn:hover { background: #1e40af; color: #fff; }
            @media (max-width: 600px) {
              .header { flex-direction: column; align-items: flex-start; }
              .screenshots { flex-direction: column; align-items: center; }
              .screenshots img { width: 95vw; max-width: 320px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://cdn-icons-png.flaticon.com/512/197/197582.png" alt="Korean App Logo"/>
              <div>
                <div class="title">Korean Learning App - Expo/React Native</div>
                <div class="desc">
                  This app helps you learn Korean vocabulary, grammar, pronunciation, and daily conversation.<br>
                  Built with <b>Expo/React Native</b>, powered by Fastify backend, supporting Android/iOS/Web.
                </div>
              </div>
            </div>
            <div class="links">
              <a href="https://play.google.com/store/apps/details?id=your.app.id" target="_blank"><i class="fab fa-google-play"></i> Google Play</a>
              <a href="https://apps.apple.com/app/idYOUR_APP_ID" target="_blank"><i class="fab fa-apple"></i> App Store</a>
              <a href="https://your-frontend-link.com" target="_blank"><i class="fas fa-globe"></i> Frontend</a>
              <a href="https://github.com/your-repo" target="_blank"><i class="fab fa-github"></i> GitHub</a>
              <a href="https://www.figma.com/file/your-figma-id" target="_blank"><i class="fab fa-figma"></i> Figma</a>
              <a href="https://drive.google.com/your-doc-link" target="_blank"><i class="fas fa-file-alt"></i> Documentation</a>
            </div>
            <div><b>Main Features:</b>
              <ul>
                <li>Practice vocabulary, grammar, and accurate Korean pronunciation</li>
                <li>Learn through games, flashcards, and interactive exercises</li>
                <li>Study reminders and personal progress tracking</li>
                <li>User-friendly interface, multi-platform support</li>
                <li>Data synchronization and learning statistics</li>
              </ul>
            </div>
            <div class="screenshots">
              <img src="https://i.imgur.com/2yaf2wb.png" alt="Screenshot 1"/>
              <img src="https://i.imgur.com/8p2vQnF.png" alt="Screenshot 2"/>
              <img src="https://i.imgur.com/3n6bQkJ.png" alt="Screenshot 3"/>
            </div>
            <div class="video-demo">
              <video controls poster="https://i.imgur.com/2yaf2wb.png">
                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
                Your browser does not support the video tag.
              </video>
              <div style="margin-top:8px; color:#1e40af; font-weight:500;">Demo video of main features</div>
            </div>
            <a href="/spotlight" class="back-btn"><i class="fas fa-arrow-left"></i> Back to API Docs</a>
          </div>
        </body>
      </html>
    `);
  });
  
});