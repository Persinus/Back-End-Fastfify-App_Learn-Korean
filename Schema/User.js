// --- Register Schema ---
const registerSchema = {
  body: {
    type: 'object',
    properties: {
      username: { type: 'string' },
      password: { type: 'string' },
      email: { type: 'string' },
      avatarUrl: { type: 'string' }
    },
    required: ['username', 'password']
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

// --- Login Schema ---
const loginSchema = {
  body: {
    type: 'object',
    properties: {
      username: { type: 'string' },
      password: { type: 'string' }
    },
    required: ['username', 'password']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
        token: { type: 'string' }
      }
    }
  }
};

// --- Get Profile Schema ---
const getProfileSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            email: { type: 'string' },
            avatar: { type: 'string' },
            score: { type: 'number' }, // đổi từ score sang score
            gold: { type: 'number' },
            diamond: { type: 'number' },
            freeCourses: { type: 'array', items: { type: 'object' } },
            paidCourses: { type: 'array', items: { type: 'object' } },
            achievements: { type: 'array', items: { type: 'object' } },
            dailyMissions: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    }
  }
};

// --- Update Profile Schema ---
const updateProfileSchema = {
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email', nullable: true },
      avatar: { type: 'string', format: 'uri', nullable: true },
      score: { type: 'number', nullable: true }, // đổi từ score sang score
      gold: { type: 'number', nullable: true },
      diamond: { type: 'number', nullable: true }
    },
    required: []
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

// --- Change Password Schema ---
const changePasswordSchema = {
  body: {
    type: 'object',
    properties: {
      oldPassword: { type: 'string' },
      newPassword: { type: 'string' }
    },
    required: ['oldPassword', 'newPassword']
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

// --- Upload Avatar Schema ---
const uploadAvatarSchema = {
  consumes: ['multipart/form-data'],
  body: {
    type: 'object',
    properties: {
      avatar: { type: 'string', format: 'binary' }
    },
    required: ['avatar']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
        avatar: { type: 'string' }
      }
    }
  }
};

// --- Get All Users Schema ---
const getAllUsersSchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          email: { type: 'string' },
          avatar: { type: 'string' },
          score: { type: 'number' }, // đổi từ score sang score
          gold: { type: 'number' },
          diamond: { type: 'number' }
        }
      }
    }
  }
};

// --- Delete User Schema ---
const deleteUserSchema = {
  params: {
    type: 'object',
    properties: {
      username: { type: 'string' }
    },
    required: ['username']
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

// --- Update Stats Schema ---
const updateStatsSchema = {
  body: {
    type: 'object',
    properties: {
      score: { type: 'number' }, // đổi từ score sang score
      gold: { type: 'number' },
      diamond: { type: 'number' }
    },
    required: []
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

// --- Complete Daily Mission Schema ---
const completeDailyMissionSchema = {
  body: {
    type: 'object',
    properties: {
      missionId: { type: 'string' }
    },
    required: ['missionId']
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

// --- Update Personal Info Schema ---
const updatePersonalInfoSchema = {
  body: {
    type: 'object',
    properties: {
      fullName: { type: 'string' },
      birthday: { type: 'string', format: 'date' },
      gender: { type: 'string', enum: ['male', 'female', 'other'] }
    },
    required: []
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

// --- Mark Notification Read Schema ---
const markNotificationReadSchema = {
  body: {
    type: 'object',
    properties: {
      notificationId: { type: 'string' }
    },
    required: ['notificationId']
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

module.exports = {
  registerSchema,
  loginSchema,
  getProfileSchema,
  updateProfileSchema,
  changePasswordSchema,
  uploadAvatarSchema,
  getAllUsersSchema,
  deleteUserSchema,
  updateStatsSchema,
  completeDailyMissionSchema,
  updatePersonalInfoSchema,
  markNotificationReadSchema
};