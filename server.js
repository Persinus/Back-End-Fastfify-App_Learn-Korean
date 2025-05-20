require("dotenv").config();
const path = require("path");
const fastify = require("fastify")({ logger: true });

// Plugins
const swagger = require("@fastify/swagger");
const swaggerUI = require("@fastify/swagger-ui");
const cors = require("@fastify/cors");
const mongodb = require("fastify-mongodb");
const jwt = require("@fastify/jwt");
const fastifyStatic = require("@fastify/static");

// Đăng ký Swagger + Swagger UI
fastify.register(require('@fastify/swagger'), {
  mode: 'dynamic',
  openapi: {
    openapi: '3.0.3',
    info: {
      title: 'My API',
      description: 'Testing the Fastify OpenAPI integration',
      version: '1.0.0'
    }
  }
});
fastify.register(require('@fastify/swagger-ui'), {
  routePrefix: '/documentation'
});

// Các plugin khác
fastify.register(cors, { origin: "*" });
fastify.register(mongodb, {
  forceClose: true,
  url: process.env.MONGO_URL,
});
fastify.register(jwt, {
  secret: process.env.JWT_SECRET,
});

// Route ví dụ cho Swagger tự động nhận diện
fastify.get(
  "/ping",
  {
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            pong: { type: "string" },
          },
        },
      },
    },
  },
  async () => {
    return { pong: "it works!" };
  }
);
// Đăng ký các route riêng
fastify.register(require("./routes/User"), { prefix: "/User" });
fastify.register(require('./routes/freeCourse'), { prefix: "/freeCourse" });
fastify.register(require('./routes/paidCourse'), { prefix: "/paidCourse" });
fastify.register(require('./routes/achievement'), { prefix: "/achievement" });
fastify.register(require('./routes/mission'), { prefix: "/mission" });
fastify.register(require('./routes/notification'), { prefix: "/notification" });
fastify.register(require('./routes/vocabulary'), { prefix: "/vocabulary" });
fastify.register(require('./routes/feedbackPage'));
fastify.register(require('./routes/Overview'));
fastify.register(require('./routes/stoplightPage'));

// Khởi động server
const PORT = process.env.PORT || 3000;
fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) throw err;
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(
    `📄 Swagger UI available at http://localhost:${PORT}/documentation`
  );
});
