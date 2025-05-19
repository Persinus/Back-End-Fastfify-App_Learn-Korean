// --- Achievement Schemas ---
const getAchievementsSchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          achievementId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string' },
          reward: { type: 'object', additionalProperties: true },
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
          title: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string' },
          reward: { type: 'object', additionalProperties: true },
          requirement: { type: 'object', additionalProperties: true },
          isClaimed: { type: 'boolean' },
          point: { type: 'number' }, // Thêm điểm từng achievement nếu cần
        },
      },
    },
  },
};

const claimAchievementSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
        reward: { type: 'object', additionalProperties: true },
      },
    },
  },
};

// --- Lesson Schemas ---
const createLessonSchema = {
  body: {
    type: 'object',
    required: ['lessonId', 'title', 'description', 'category', 'level', 'content', 'exercises', 'isPremium'],
    properties: {
      lessonId: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      category: { type: 'string' },
      level: { type: 'number' },
      content: { type: 'array', items: { type: 'string' } },
      exercises: { type: 'array', items: { type: 'string' } },
      isPremium: { type: 'boolean' },
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

const getLessonsSchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          lessonId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          level: { type: 'number' },
          content: { type: 'array', items: { type: 'string' } },
          exercises: { type: 'array', items: { type: 'string' } },
          isPremium: { type: 'boolean' },
          point: { type: 'number' }, // Thêm điểm từng bài nếu cần
        },
      },
    },
  },
};

const getLessonByIdSchema = {
  params: {
    type: 'object',
    properties: {
      lessonId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        lessonId: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        level: { type: 'number' },
        content: { type: 'array', items: { type: 'string' } },
        exercises: { type: 'array', items: { type: 'string' } },
        isPremium: { type: 'boolean' },
        point: { type: 'number' }, // Thêm điểm nếu cần
      },
    },
  },
};

const updateLessonSchema = {
  params: {
    type: 'object',
    properties: {
      lessonId: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      category: { type: 'string' },
      level: { type: 'number' },
      content: { type: 'array', items: { type: 'string' } },
      exercises: { type: 'array', items: { type: 'string' } },
      isPremium: { type: 'boolean' },
    },
  },
};

const deleteLessonSchema = {
  params: {
    type: 'object',
    properties: {
      lessonId: { type: 'string' },
    },
  },
};

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
        },
      },
    },
  },
};

const completeMissionSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
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

const claimMissionSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
        reward: { type: 'object', additionalProperties: true },
      },
    },
  },
};

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

// --- Free Course Schema ---
const freeCourseSchema = {
  type: 'object',
  properties: {
    unit: { type: 'number' },
    lessons: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          image: { type: 'string' },
          progress: { type: 'number' }, // điểm user đạt được với bài này
        },
        required: ['id', 'title', 'description', 'image', 'progress']
      }
    }
  },
  required: ['unit', 'lessons']
};

// --- Paid Course Schema ---
const paidCourseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    price: { type: 'string' },
    teacher: { type: 'string' },
    rating: { type: 'number' },
    description: { type: 'string' },
    image: { type: 'string' },
    cover: { type: 'string' },
    lessons: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'object' }, // { vn: '...', en: '...' }
          duration: { type: 'object' }, // { vn: '...', en: '...' }
          isLocked: { type: 'boolean' },
          type: { type: 'string' }
        },
        required: ['id', 'title', 'duration', 'isLocked', 'type']
      }
    }
  },
  required: ['id', 'name', 'price', 'teacher', 'rating', 'description', 'image', 'cover', 'lessons']
};

// --- Vocabulary Schemas ---
const getVocabularySchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          word: { type: 'string' },
          pronunciation: { type: 'string' },
          meaning: { type: 'string' },
          example: { type: 'string' },
          category: { type: 'string' },
          level: { type: 'number' },
        },
      },
    },
  },
};

const getVocabularyByCategorySchema = {
  params: {
    type: 'object',
    properties: {
      category: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          word: { type: 'string' },
          pronunciation: { type: 'string' },
          meaning: { type: 'string' },
          example: { type: 'string' },
          category: { type: 'string' },
          level: { type: 'number' },
        },
      },
    },
  },
};

const searchVocabularySchema = {
  querystring: {
    type: 'object',
    properties: {
      q: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          word: { type: 'string' },
          pronunciation: { type: 'string' },
          meaning: { type: 'string' },
          example: { type: 'string' },
          category: { type: 'string' },
          level: { type: 'number' },
        },
      },
    },
  },
};

// --- Register Schema ---
const registerSchema = {
  body: {
    type: 'object',
    properties: {
      username: { type: 'string' },
      password: { type: 'string' },
      email: { type: 'string', format: 'email' },
      avatarUrl: { type: 'string', format: 'uri', nullable: true }
    },
    required: ['username', 'password', 'email']
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
        msg: { type: 'string' }
      }
    }
  }
};

// --- Profile Schemas ---
const updateProfileSchema = {
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email', nullable: true },
      avatar: { type: 'string', format: 'uri', nullable: true },
      score: { type: 'number', nullable: true },
      gold: { type: 'number', nullable: true },
      diamond: { type: 'number', nullable: true },
    },
    required: []
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

const uploadAvatarSchema = {
  consumes: ['multipart/form-data'],
  body: {
    type: 'object',
    properties: {
      // Không cần username nếu dùng JWT
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
            lessons: { type: 'array', items: { type: 'object' } },
            achievements: { type: 'array', items: { type: 'object' } },
            dailyMissions: { type: 'array', items: { type: 'object' } },
            // ... thêm các trường khác nếu cần
          }
        }
      }
    }
  }
};

// --- EXPORT ALL ---
module.exports = {
  // Achievement
  getAchievementsSchema,
  getUserAchievementsSchema,
  claimAchievementSchema,
  // Lesson
  createLessonSchema,
  getLessonsSchema,
  getLessonByIdSchema,
  updateLessonSchema,
  deleteLessonSchema,
  // Daily Mission
  getDailyMissionsSchema,
  completeMissionSchema,
  claimMissionSchema,
  // Notification
  getNotificationsSchema,
  markAsReadSchema,
  markAllAsReadSchema,
  // Course
  freeCourseSchema,
  paidCourseSchema,
  // Vocabulary
  getVocabularySchema,
  getVocabularyByCategorySchema,
  searchVocabularySchema,
  // Register & Login
  registerSchema,
  loginSchema,
  // Profile
  updateProfileSchema,
  uploadAvatarSchema,
  getProfileSchema,
};