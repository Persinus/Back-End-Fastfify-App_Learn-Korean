// --- Achievement Schemas ---
const getAchievementsSchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          achievementId: { type: 'string' },
          index: { type: 'number' }, // Thêm số thứ tự giả
          title: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string' },
          reward: {
            type: 'object',
            properties: {
              gold: { type: 'number' }
            },
            additionalProperties: true
          },
          requirement: { type: 'object', additionalProperties: true },
        },
      },
    },
  },
};

const getUserAchievementsSchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          achievementId: { type: 'string' },
          index: { type: 'number' }, // Thêm số thứ tự giả
          title: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string' },
          reward: {
            type: 'object',
            properties: {
              gold: { type: 'number' }
            },
            additionalProperties: true
          },
          requirement: { type: 'object', additionalProperties: true },
          isClaimed: { type: 'boolean' },
          point: { type: 'number' },
        },
      },
    },
  },
};

const claimAchievementSchema = {
  params: {
    type: 'object',
    properties: { id: { type: 'string' } },
    required: ['id']
  },
  body: {
    type: 'object',
    properties: { username: { type: 'string' } },
    required: ['username']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
        gold: { type: 'number' }
      }
    }
  }
};

const achievementBodySchema = {
  type: 'object',
  required: ['achievementId', 'title', 'description', 'icon', 'reward', 'requirement'],
  properties: {
    achievementId: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    icon: { type: 'string' },
    reward: {
      type: 'object',
      properties: { gold: { type: 'number' } },
      required: ['gold'],
      additionalProperties: true
    },
    requirement: { type: 'object', additionalProperties: true }
  }
};

const createAchievementSchema = {
  body: achievementBodySchema,
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
        achievement: achievementBodySchema
      }
    }
  }
};

const updateAchievementSchema = {
  params: {
    type: 'object',
    properties: { id: { type: 'string' } },
    required: ['id']
  },
  body: achievementBodySchema,
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

module.exports = {
  getAchievementsSchema,
  getUserAchievementsSchema,
  claimAchievementSchema,
  createAchievementSchema,
  updateAchievementSchema,
};