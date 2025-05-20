const fp = require('fastify-plugin');
module.exports = fp(async function (fastify, opts) {
  fastify.get("/feedback", async (request, reply) => {
  reply.type("text/html").send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Góp ý & Đánh giá App</title>
        <meta charset="utf-8"/>
        <link rel="icon" type="image/png" href="https://cdn-icons-png.flaticon.com/128/6422/6422199.png"/>
        <meta property="og:title" content="Korean Learning API Docs" />
        <meta property="og:description" content="API documentation for the Korean learning app. Try out endpoints, view schemas, and more!" />
        <meta property="og:image" content="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
        <meta name="twitter:card" content="summary_large_image" />
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

fastify.get("/feedback/admin", async (request, reply) => {
  reply.type("text/html").send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Quản trị nhận xét App</title>
        <meta charset="utf-8"/>
        <link rel="icon" type="image/png" href="https://cdn-icons-png.flaticon.com/128/6422/6422199.png"/>
        <meta property="og:title" content="Korean Learning API Docs" />
        <meta property="og:description" content="API documentation for the Korean learning app. Try out endpoints, view schemas, and more!" />
        <meta property="og:image" content="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
        <meta name="twitter:card" content="summary_large_image" />
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
// Route gửi nhận xét
fastify.post(
  "/feedback",
  {
    schema: {
      tags: ["Feedback"],
      summary: "Gửi nhận xét app",
      description: "Người dùng gửi nhận xét và số sao đánh giá.",
      body: {
        type: "object",
        properties: {
          name: { type: "string" },
          rating: { type: "number", minimum: 1, maximum: 5 },
          comment: { type: "string" },
          role: { type: "string", enum: ["vote"] },
        },
        required: ["name", "rating", "role"],
      },
      response: {
        200: {
          type: "object",
          properties: { msg: { type: "string" } },
        },
      },
    },
  },
  async (req, reply) => {
    const { name, rating, comment, role } = req.body;
    await fastify.mongo.db.collection("feedback").insertOne({
      name,
      rating,
      comment,
      role,
      createdAt: new Date(),
    });
    reply.send({ msg: "Đã nhận góp ý, cảm ơn bạn!" });
  }
);

fastify.post(
  "/feedback/admin",
  {
    schema: {
      tags: ["Feedback"],
      summary: "Xem thống kê nhận xét (quản trị)",
      description:
        "Quản trị viên nhập mật khẩu để xem thống kê và tất cả nhận xét.",
      body: {
        type: "object",
        properties: { password: { type: "string" } },
        required: ["password"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            avg: { type: "number" },
            count: { type: "number" },
            feedbacks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  rating: { type: "number" },
                  comment: { type: "string" },
                  createdAt: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  },
  async (req, reply) => {
    const { password } = req.body;
    if (password !== process.env.FEEDBACK_ADMIN_PASSWORD) {
      return reply.code(401).send({ msg: "Sai mật khẩu!" });
    }
    const feedbacks = await fastify.mongo.db
      .collection("feedback")
      .find({ role: "vote" })
      .toArray();
    const count = feedbacks.length;
    const avg = count
      ? (feedbacks.reduce((a, b) => a + b.rating, 0) / count).toFixed(2)
      : 0;
    reply.send({ avg, count, feedbacks });
  }
);

});