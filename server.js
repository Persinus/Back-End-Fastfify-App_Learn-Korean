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
    customfavIcon: "https://example.com/favicon.ico"
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

// Route phục vụ Redoc docs
fastify.get('/redoc', async (request, reply) => {
  reply.type('text/html').send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Redoc</title>
        <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
      </head>
      <body>
        <redoc spec-url="/documentation/json"></redoc>
      </body>
    </html>
  `);
});

// Route phục vụ Stoplight Elements
fastify.get('/stoplight', async (request, reply) => {
  reply.type('text/html').send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Stoplight Elements</title>
        <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
        <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
      </head>
      <body>
        <elements-api
          apiDescriptionUrl="/documentation/json"
          router="hash"
        />
      </body>
    </html>
  `);
});

// Route phục vụ Spotlight API Docs
fastify.get('/spotlight', async (request, reply) => {
  reply.type('text/html').send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Spotlight API Docs</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <script src="https://cdn.jsdelivr.net/npm/@spotlightjs/spotlight@1.7.4/dist/spotlight.bundle.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@spotlightjs/spotlight@1.7.4/dist/spotlight.min.css"/>
      </head>
      <body>
        <div id="spotlight"></div>
        <script>
          window.onload = function() {
            window.spotlight.init({
              spec: '/documentation/json',
              dom_id: '#spotlight'
            });
          }
        </script>
      </body>
    </html>
  `);
});

// Đăng ký các route riêng
fastify.register(require('./routes/auth'), { prefix: '/auth' });
fastify.register(require('./routes/Lesson'), { prefix: '/lesson' });
fastify.register(require('./routes/User'), { prefix: '/user' });
fastify.register(require('./routes/Achivement'), { prefix: '/achievements' });
fastify.register(require('./routes/Nofication'), { prefix: '/notifications' });
fastify.register(require('./routes/DailyMission'), { prefix: '/daily-missions' });

// Khởi động server
const PORT = process.env.PORT || 3000;
fastify.listen({ port: PORT }, (err) => {
  if (err) throw err;
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📄 Swagger UI available at http://localhost:${PORT}/documentation`);
  console.log(`📄 Redoc UI available at http://localhost:${PORT}/redoc`);
});
