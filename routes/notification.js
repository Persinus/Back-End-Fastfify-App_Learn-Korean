const fp = require('fastify-plugin');
const {
  getNotificationsSchema,
  getNotificationByIdSchema,
  createNotificationSchema,
  updateNotificationSchema,
  deleteNotificationSchema,
  markAsReadSchema,
  markAllAsReadSchema,
} = require('../Schema/Nofication');

function getTimeAgo(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay >= 1) {
    // Nếu quá 1 ngày, trả về ngày/tháng/năm
    return created.toLocaleDateString('vi-VN');
  }
  if (diffHour >= 1) {
    return `${diffHour} giờ trước`;
  }
  if (diffMin >= 1) {
    return `${diffMin} phút trước`;
  }
  return 'Vừa xong';
}

module.exports = fp(async function (fastify, opts) {
  const notificationsCollection = fastify.mongo.db.collection('notifications');

  // Lấy danh sách thông báo theo user (có timeAgo)
  fastify.get('/notifications', {
    schema: {
      ...getNotificationsSchema,
      tags: ['Thông báo'],
      summary: 'Lấy danh sách thông báo theo user',
      operationId: 'getNotifications',
      querystring: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              notificationId: { type: 'string' },
              username: { type: 'string' },
              title: { type: 'string' },
              content: { type: 'string' },
              isRead: { type: 'boolean' },
              createdAt: { type: 'string' },
              timeAgo: { type: 'string' }
            },
            additionalProperties: true
          }
        }
      }
    }
  }, async (req, reply) => {
    const { username } = req.query;
    const notifications = await notificationsCollection.find({ username }).toArray();
    const result = notifications.map(n => ({
      ...n,
      timeAgo: getTimeAgo(n.createdAt)
    }));
    reply.send(result);
  });

  // Lấy thông báo theo ID (có timeAgo và response schema)
  fastify.get('/notifications/:notificationId', {
    schema: {
      ...getNotificationByIdSchema,
      tags: ['Thông báo'],
      summary: 'Lấy thông báo theo ID',
      operationId: 'getNotificationById',
      params: {
        type: 'object',
        properties: { notificationId: { type: 'string' } },
        required: ['notificationId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            notificationId: { type: 'string' },
            username: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            isRead: { type: 'boolean' },
            createdAt: { type: 'string' },
            timeAgo: { type: 'string' }
          },
          additionalProperties: true
        }
      }
    }
  }, async (req, reply) => {
    const { notificationId } = req.params;
    const notification = await notificationsCollection.findOne({ notificationId });
    if (!notification) return reply.code(404).send({ msg: 'Notification not found' });
    reply.send({
      ...notification,
      timeAgo: getTimeAgo(notification.createdAt)
    });
  });

  // Tạo thông báo mới
  fastify.post('/notifications', {
    schema: {
      ...createNotificationSchema,
      tags: ['Thông báo'],
      summary: 'Tạo thông báo mới',
      operationId: 'createNotification'
    }
  }, async (req, reply) => {
    const data = {
      ...req.body,
      notificationId: Date.now().toString(),
      isRead: false,
      createdAt: new Date().toISOString()
    };
    await notificationsCollection.insertOne(data);
    reply.send({ msg: 'Notification created', notification: data });
  });

  // Cập nhật thông báo
  fastify.put('/notifications/:notificationId', {
    schema: {
      ...updateNotificationSchema,
      tags: ['Thông báo'],
      summary: 'Cập nhật thông báo',
      operationId: 'updateNotification'
    }
  }, async (req, reply) => {
    const { notificationId } = req.params;
    await notificationsCollection.updateOne(
      { notificationId },
      { $set: req.body }
    );
    reply.send({ msg: 'Notification updated' });
  });

  // Xóa thông báo
  fastify.delete('/notifications/:notificationId', {
    schema: {
      ...deleteNotificationSchema,
      tags: ['Thông báo'],
      summary: 'Xóa thông báo',
      operationId: 'deleteNotification'
    }
  }, async (req, reply) => {
    const { notificationId } = req.params;
    await notificationsCollection.deleteOne({ notificationId });
    reply.send({ msg: 'Notification deleted' });
  });

  // Đánh dấu thông báo đã đọc
  fastify.post('/notifications/mark-as-read', {
    schema: {
      ...markAsReadSchema,
      operationId: 'markNotificationAsRead',
      summary: 'Đánh dấu thông báo đã đọc',
      description: `API này dùng để đánh dấu thông báo đã đọc cho user.`,
      tags: ['Thông báo']
    }
  }, async (req, reply) => {
    const { notificationId, username } = req.body;
    await notificationsCollection.updateOne(
      { notificationId, username },
      { $set: { isRead: true } }
    );
    reply.send({ msg: 'Đã đánh dấu đã đọc' });
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
    const { username } = req.body;
    await notificationsCollection.updateMany(
      { username },
      { $set: { isRead: true } }
    );
    // Lấy lại danh sách thông báo đã cập nhật trạng thái
    const notifications = await notificationsCollection.find({ username }).sort({ createdAt: -1 }).toArray();
    reply.send({ msg: 'Đã đánh dấu tất cả đã đọc', notifications });
  });

  // Lấy tất cả thông báo chưa đọc
  fastify.get('/notifications/unread', {
    schema: {
      tags: ['Thông báo'],
      summary: 'Lấy tất cả thông báo chưa đọc',
      querystring: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: {
        200: {
          type: 'array',
          items: { type: 'object', additionalProperties: true }
        }
      }
    }
  }, async (req, reply) => {
    const { username } = req.query;
    const notifications = await notificationsCollection
      .find({ username, isRead: false })
      .sort({ createdAt: -1 })
      .toArray();

    // Thêm trường timeAgo
    const result = notifications.map(n => ({
      ...n,
      timeAgo: getTimeAgo(n.createdAt)
    }));

    reply.send(result);
  });

}); // <-- chỉ giữ dòng này để đóng module.exports