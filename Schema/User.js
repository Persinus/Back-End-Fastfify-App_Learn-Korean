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
            score: { type: 'number' },
            gold: { type: 'number' },
            diamond: { type: 'number' },
            friends: { type: 'array', items: { type: 'string' } }, // danh sách bạn bè đã xác nhận
            friendRequests: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  from: { type: 'string' }, // username người gửi
                  status: { type: 'string', enum: ['pending', 'accepted', 'rejected'] }
                },
                required: ['from', 'status']
              }
            },
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
      score: { type: 'number', nullable: true },
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
          score: { type: 'number' },
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
      score: { type: 'number' },
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

// --- Friend Request Schema ---
const friendRequestSchema = {
  body: {
    type: 'object',
    properties: {
      from: { type: 'string' },
      to: { type: 'string' }
    },
    required: ['from', 'to']
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

// --- Accept/Reject Friend Request Schema ---
const respondFriendRequestSchema = {
  body: {
    type: 'object',
    properties: {
      requestId: { type: 'string' },
      accept: { type: 'boolean' }
    },
    required: ['requestId', 'accept']
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

// --- Send Message Schema ---
const sendMessageSchema = {
  body: {
    type: 'object',
    properties: {
      from: { type: 'string' },
      to: { type: 'string' },
      content: { type: 'string' }
    },
    required: ['from', 'to', 'content']
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' }, messageId: { type: 'string' } }
    }
  }
};

// --- Get Conversation Schema ---
const getConversationSchema = {
  querystring: {
    type: 'object',
    properties: {
      user1: { type: 'string' },
      user2: { type: 'string' }
    },
    required: ['user1', 'user2']
  },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          from: { type: 'string' },
          to: { type: 'string' },
          content: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      }
    }
  }
};

// Khi tạo user mới, thêm mặc định:
const newUser = {
  // ...other fields...
  friends: [],
  friendRequests: [],
  // ...
};

module.exports = {
  newUser,
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
  markNotificationReadSchema,
  friendRequestSchema,
  respondFriendRequestSchema,
  sendMessageSchema,
  getConversationSchema
};