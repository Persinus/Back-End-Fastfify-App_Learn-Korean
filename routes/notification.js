const fp = require('fastify-plugin');
const { getNotificationsSchema, markAsReadSchema, markAllAsReadSchema } = require('../Schema/User');

module.exports = fp(async function (fastify, opts) {
  const notificationsCollection = fastify.mongo.db.collection('notifications');
  // Lấy danh sách thông báo
  fastify.get('/notifications', {
    schema: {
      ...getNotificationsSchema,
      tags: ['Thông báo'],
      description: `API này trả về danh sách thông báo của user theo username.`,
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              content: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              isRead: { type: 'boolean' }
            }
          }
        }
      },
      operationId: 'getAllNotifications',
      summary: 'Lấy danh sách thông báo của user',
      querystring: {
        type: 'object',
        properties: {
          username: { type: 'string' }
        },
        required: ['username']
      }
    }
  }, async (req, reply) => {
    const { username } = req.query;
    const notifications = await notificationsCollection
      .find({ username })
      .sort({ createdAt: -1 })
      .toArray();
    reply.send(notifications);
  });

  // Đánh dấu thông báo đã đọc
  fastify.post('/notifications/mark-as-read', {
    schema: {
      ...markAsReadSchema,
      operationId: 'markNotificationAsRead',
      summary: 'Đánh dấu thông báo đã đọc',
      description: `API này dùng để đánh dấu thông báo đã đọc cho user.`,
      tags: ['Thông báo']
    },
    params: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id']
    }

  }, async (req, reply) => {
    // Xử lý đánh dấu đã đọc ở đây
    reply.send({ msg: 'Đã đánh dấu đã đọc (demo)' });
  });

  // Đánh dấu tất cả thông báo đã đọc
  fastify.post('/notifications/mark-all-as-read', {
    schema: {
      ...markAllAsReadSchema,
      operationId: 'markAllNotificationsAsRead',
      summary: 'Đánh dấu tất cả thông báo đã đọc',
      tags: ['Thông báo']
    }
  }, async (req, reply) => {
    // Xử lý đánh dấu tất cả đã đọc ở đây
    reply.send({ msg: 'Đã đánh dấu tất cả đã đọc (demo)' });
  });
});