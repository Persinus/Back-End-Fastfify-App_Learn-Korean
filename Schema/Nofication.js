// --- Notification Schemas ---
const getNotificationsSchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          notificationId: { type: 'string' },
          title: { type: 'string' },
          message: { type: 'string' },
          isRead: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};

const getNotificationByIdSchema = {
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
        title: { type: 'string' },
        message: { type: 'string' },
        isRead: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
      }
    }
  }
};

const createNotificationSchema = {
  body: {
    type: 'object',
    required: ['title', 'message', 'username'],
    properties: {
      title: { type: 'string' },
      message: { type: 'string' },
      username: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
        notification: {
          type: 'object',
          properties: {
            notificationId: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            isRead: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          }
        }
      }
    }
  }
};

const updateNotificationSchema = {
  params: {
    type: 'object',
    properties: { notificationId: { type: 'string' } },
    required: ['notificationId']
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      message: { type: 'string' },
      isRead: { type: 'boolean' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

const deleteNotificationSchema = {
  params: {
    type: 'object',
    properties: { notificationId: { type: 'string' } },
    required: ['notificationId']
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

const markAsReadSchema = {
  body: {
    type: 'object',
    required: ['notificationId', 'username'],
    properties: {
      notificationId: { type: 'string' },
      username: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

const markAllAsReadSchema = {
  body: {
    type: 'object',
    required: ['username'],
    properties: {
      username: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  },
};

module.exports = {
  getNotificationsSchema,
  getNotificationByIdSchema,
  createNotificationSchema,
  updateNotificationSchema,
  deleteNotificationSchema,
  markAsReadSchema,
  markAllAsReadSchema,
};