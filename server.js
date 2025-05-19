require('dotenv').config();
const path = require('path');
const fastify = require('fastify')({ logger: true });

// Plugins
const swagger = require('@fastify/swagger');
const swaggerUI = require('@fastify/swagger-ui');
const cors = require('@fastify/cors');
const mongodb = require('fastify-mongodb');
const jwt = require('@fastify/jwt');
const fastifyStatic = require('@fastify/static');

// Đăng ký Swagger + Swagger UI
fastify.register(swagger, {
  swagger: {
    info: {
      title: "My API",
      description: "Testing the Fastify swagger integration",
      version: "1.0.0"
    },
    consumes: ["application/json"],
    produces: ["application/json"]
  }
});

fastify.register(swaggerUI, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'none',
    deepLinking: true,
    displayRequestDuration: true,
    filter: true,
    defaultModelsExpandDepth: -1,
    showExtensions: true,
    showCommonExtensions: true,
  },
  uiHooks: {
    onRequest: (request, reply, next) => { next(); },
    preHandler: (request, reply, next) => { next(); }
  },
  staticCSP: true,
  swaggerUIOptions: {
    customCss: `
      .swagger-ui .topbar { background-color: #1e40af; }
      .swagger-ui .info { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
      .swagger-ui .scheme-container { background-color: #e0f2fe; }
      .swagger-ui .opblock { border-radius: 10px; box-shadow: 0 0 10px rgba(30, 64, 175, 0.5); }
    `,
    customSiteTitle: "My Awesome API Docs",
    customfavIcon: "https://cdn-icons-png.flaticon.com/128/6422/6422199.png"
  },
  transformStaticCSP: (header) => header,
});

// Các plugin khác
fastify.register(cors, { origin: '*' });
fastify.register(mongodb, {
  forceClose: true,
  url: process.env.MONGO_URL,
});
fastify.register(jwt, {
  secret: process.env.JWT_SECRET,
});
fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'uploads'),
  prefix: '/uploads/', // Truy cập ảnh qua /uploads/...
});

// Route ví dụ cho Swagger tự động nhận diện
fastify.get('/ping', {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          pong: { type: 'string' }
        }
      }
    }
  }
}, async () => {
  return { pong: 'it works!' };
});

// Route phục vụ Stoplight Elements
fastify.get('/spotlight', async (request, reply) => {
  reply.type('text/html').send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Stoplight Elements</title>
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
          <b>Hướng dẫn:</b> Chọn API ở menu trái để xem chi tiết, thử request trực tiếp trên trình duyệt.<br>
          Nếu cần token, hãy đăng nhập và copy token vào phần "Authorize".
        </div>
        <div class="elements-container">
          <elements-api
            apiDescriptionUrl="/documentation/json"
            router="hash"
            layout="sidebar"
            hideExport="true"
            hideTryIt="false"
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
        <a href="/spotlight" class="back-btn"><i class="fas fa-arrow-left"></i> Back to API Docs</a>
      </body>
    </html>
  `);
});

// Route giới thiệu App Học Tiếng Hàn
fastify.get('/overview', async (request, reply) => {
  reply.type('text/html').send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Korean Learning App Overview</title>
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

// Route gửi nhận xét
fastify.post('/feedback', {
  schema: {
    tags: ['Feedback'],
    summary: 'Gửi nhận xét app',
    description: 'Người dùng gửi nhận xét và số sao đánh giá.',
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        rating: { type: 'number', minimum: 1, maximum: 5 },
        comment: { type: 'string' },
        role: { type: 'string', enum: ['vote'] }
      },
      required: ['name', 'rating', 'role']
    },
    response: {
      200: {
        type: 'object',
        properties: { msg: { type: 'string' } }
      }
    }
  }
}, async (req, reply) => {
  const { name, rating, comment, role } = req.body;
  await fastify.mongo.db.collection('feedback').insertOne({
    name, rating, comment, role, createdAt: new Date()
  });
  reply.send({ msg: 'Đã nhận góp ý, cảm ơn bạn!' });
});

fastify.post('/feedback/admin', {
  schema: {
    tags: ['Feedback'],
    summary: 'Xem thống kê nhận xét (quản trị)',
    description: 'Quản trị viên nhập mật khẩu để xem thống kê và tất cả nhận xét.',
    body: {
      type: 'object',
      properties: { password: { type: 'string' } },
      required: ['password']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          avg: { type: 'number' },
          count: { type: 'number' },
          feedbacks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                rating: { type: 'number' },
                comment: { type: 'string' },
                createdAt: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
}, async (req, reply) => {
  const { password } = req.body;
  if (password !== process.env.FEEDBACK_ADMIN_PASSWORD) {
    return reply.code(401).send({ msg: 'Sai mật khẩu!' });
  }
  const feedbacks = await fastify.mongo.db.collection('feedback').find({ role: 'vote' }).toArray();
  const count = feedbacks.length;
  const avg = count ? (feedbacks.reduce((a, b) => a + b.rating, 0) / count).toFixed(2) : 0;
  reply.send({ avg, count, feedbacks });
});

fastify.get('/feedback', async (request, reply) => {
  reply.type('text/html').send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Góp ý & Đánh giá App</title>
        <meta charset="utf-8"/>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
        <style>
          body { background: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; }
          .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 2px 16px #1e40af22; padding: 32px; }
          h2 { color: #1e40af; margin-bottom: 12px; }
          .form-group { margin-bottom: 18px; }
          label { font-weight: 500; color: #1e40af; display: block; margin-bottom: 6px; }
          input, textarea, select {
            width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 1em;
          }
          textarea { min-height: 70px; }
          .stars { display: flex; gap: 6px; font-size: 1.6em; color: #facc15; cursor: pointer; }
          .stars .fa-star { transition: color 0.2s; }
          .submit-btn {
            background: #1e40af; color: #fff; border: none; padding: 12px 24px; border-radius: 8px;
            font-size: 1.1em; font-weight: 600; cursor: pointer; transition: background 0.2s;
          }
          .submit-btn:hover { background: #facc15; color: #1e40af; }
          .thanks { color: #22c55e; font-weight: 600; margin-top: 18px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Góp ý & Đánh giá Ứng dụng</h2>
          <form id="feedback-form" autocomplete="off">
            <div class="form-group">
              <label for="name">Họ và tên <span style="color:red">*</span></label>
              <input type="text" id="name" name="name" required placeholder="Nhập họ tên của bạn"/>
            </div>
            <div class="form-group">
              <label>Chọn số sao <span style="color:red">*</span></label>
              <div class="stars" id="stars">
                <i class="fa-regular fa-star" data-value="1"></i>
                <i class="fa-regular fa-star" data-value="2"></i>
                <i class="fa-regular fa-star" data-value="3"></i>
                <i class="fa-regular fa-star" data-value="4"></i>
                <i class="fa-regular fa-star" data-value="5"></i>
              </div>
              <input type="hidden" id="rating" name="rating" required value="0"/>
            </div>
            <div class="form-group">
              <label for="comment">Nhận xét</label>
              <textarea id="comment" name="comment" placeholder="Nhận xét về app..."></textarea>
            </div>
            <div class="form-group">
              <label><input type="radio" name="role" value="vote" checked required/> Tôi là người vote</label>
            </div>
            <button type="submit" class="submit-btn">Gửi nhận xét</button>
          </form>
          <div class="thanks" id="thanks" style="display:none;">
            <i class="fas fa-check-circle"></i> Cảm ơn bạn đã góp ý!
          </div>
        </div>
        <script>
          // Xử lý chọn sao
          const stars = document.querySelectorAll('#stars .fa-star');
          const ratingInput = document.getElementById('rating');
          stars.forEach(star => {
            star.addEventListener('mouseenter', function() {
              highlightStars(this.dataset.value);
            });
            star.addEventListener('mouseleave', function() {
              highlightStars(ratingInput.value);
            });
            star.addEventListener('click', function() {
              ratingInput.value = this.dataset.value;
              highlightStars(this.dataset.value);
            });
          });
          function highlightStars(val) {
            stars.forEach(star => {
              if (star.dataset.value <= val) {
                star.classList.add('fas');
                star.classList.remove('fa-regular');
              } else {
                star.classList.remove('fas');
                star.classList.add('fa-regular');
              }
            });
          }
          // Xử lý submit
          document.getElementById('feedback-form').onsubmit = async function(e) {
            e.preventDefault();
            if (ratingInput.value === "0") {
              alert("Vui lòng chọn số sao đánh giá!");
              return;
            }
            const res = await fetch('/feedback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: document.getElementById('name').value,
                rating: Number(ratingInput.value),
                comment: document.getElementById('comment').value,
                role: 'vote'
              })
            });
            if (res.ok) {
              document.getElementById('thanks').style.display = 'block';
              setTimeout(() => {
                document.getElementById('thanks').style.display = 'none';
                document.getElementById('feedback-form').reset();
                highlightStars(0);
              }, 2200);
            } else {
              alert('Có lỗi xảy ra!');
            }
          };
        </script>
      </body>
    </html>
  `);
});

fastify.get('/feedback/admin', async (request, reply) => {
  reply.type('text/html').send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Quản trị nhận xét App</title>
        <meta charset="utf-8"/>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
        <style>
          body { background: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 2px 16px #1e40af22; padding: 32px; }
          h2 { color: #1e40af; margin-bottom: 12px; }
          .form-group { margin-bottom: 18px; }
          label { font-weight: 500; color: #1e40af; display: block; margin-bottom: 6px; }
          input[type="password"] { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 1em; }
          .submit-btn {
            background: #1e40af; color: #fff; border: none; padding: 10px 22px; border-radius: 8px;
            font-size: 1.1em; font-weight: 600; cursor: pointer; transition: background 0.2s;
          }
          .submit-btn:hover { background: #facc15; color: #1e40af; }
          .stats { margin: 18px 0; }
          .feedback-list { margin-top: 18px; }
          .feedback-item { border-bottom: 1px solid #e5e7eb; padding: 10px 0; }
          .feedback-item:last-child { border-bottom: none; }
          .star { color: #facc15; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Quản trị nhận xét App</h2>
          <form id="admin-form" autocomplete="off">
            <div class="form-group">
              <label for="password">Nhập mật khẩu quản trị:</label>
              <input type="password" id="password" required/>
            </div>
            <button type="submit" class="submit-btn">Xem thống kê</button>
          </form>
          <div class="stats" id="stats" style="display:none;"></div>
          <div class="feedback-list" id="feedback-list"></div>
        </div>
        <script>
          document.getElementById('admin-form').onsubmit = async function(e) {
            e.preventDefault();
            const pw = document.getElementById('password').value;
            const res = await fetch('/feedback/admin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password: pw })
            });
            if (res.ok) {
              const data = await res.json();
              document.getElementById('stats').style.display = 'block';
              document.getElementById('stats').innerHTML = 
                '<b>Điểm trung bình:</b> <span class="star">★</span> ' + data.avg + '/5<br>' +
                '<b>Tổng lượt nhận xét:</b> ' + data.count;
              let html = '';
              data.feedbacks.forEach(fb => {
                html += '<div class="feedback-item"><b>' + fb.name + '</b> - <span class="star">★</span> ' + fb.rating +
                  '<br><i>' + (fb.comment || '') + '</i></div>';
              });
              document.getElementById('feedback-list').innerHTML = html;
            } else {
              alert('Sai mật khẩu hoặc lỗi server!');
            }
          };
        </script>
      </body>
    </html>
  `);
});

// Đăng ký các route riêng
fastify.register(require('./routes/User'), { prefix: '/auth' });

// Khởi động server
const PORT = process.env.PORT || 3000;
fastify.listen({ port: PORT }, (err) => {
  if (err) throw err;
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📄 Swagger UI available at http://localhost:${PORT}/documentation`);

});
