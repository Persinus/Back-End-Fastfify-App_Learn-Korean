// --- Daily Mission Schemas ---

const getDailyMissionsSchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          missionId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          reward: { type: 'object', additionalProperties: true },
          requirement: { type: 'object', additionalProperties: true },
          expiryDate: { type: 'string', format: 'date-time' },
          isCompleted: { type: 'boolean' },
          isClaimed: { type: 'boolean' }
        },
      },
    },
  },
};

const getUserDailyMissionsSchema = {
  params: {
    type: 'object',
    properties: {
      username: { type: 'string' }
    },
    required: ['username']
  },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          missionId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          reward: { type: 'object', additionalProperties: true },
          requirement: { type: 'object', additionalProperties: true },
          expiryDate: { type: 'string', format: 'date-time' },
          isCompleted: { type: 'boolean' },
          isClaimed: { type: 'boolean' }
        }
      }
    }
  }
};

const createMissionSchema = {
  body: {
    type: 'object',
    properties: {
      missionId: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      reward: {
        type: 'object',
        properties: {
          gold: { type: 'number' }
        },
        required: ['gold'],
        additionalProperties: true
      },
      requirement: { type: 'object', additionalProperties: true },
      expiryDate: { type: 'string', format: 'date-time' }
    },
    required: ['missionId', 'title', 'description', 'reward', 'requirement', 'expiryDate']
  },
  response: {
    201: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
        mission: { type: 'object', additionalProperties: true }
      }
    }
  }
};

const updateMissionSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    },
    required: ['id']
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      reward: { type: 'object', additionalProperties: true },
      requirement: { type: 'object', additionalProperties: true },
      expiryDate: { type: 'string', format: 'date-time' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' }
      }
    }
  }
};

const deleteMissionSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    },
    required: ['id']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' }
      }
    }
  }
};





const claimAndCompleteMissionSchema = {
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

module.exports = {
  getDailyMissionsSchema,
  getUserDailyMissionsSchema,
  createMissionSchema,
  updateMissionSchema,
  deleteMissionSchema,
 

  claimAndCompleteMissionSchema,
};