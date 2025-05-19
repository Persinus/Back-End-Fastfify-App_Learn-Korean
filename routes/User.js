const bcrypt = require('bcrypt');
const fp = require('fastify-plugin');
const path = require('path');
const multer = require('fastify-multer');
const {
  getAchievementsSchema,
  getUserAchievementsSchema,
  claimAchievementSchema,
  getDailyMissionsSchema,
  completeMissionSchema,
  claimMissionSchema,
  getNotificationsSchema,
  markAsReadSchema,
  markAllAsReadSchema,
  getVocabularySchema,
  getVocabularyByCategorySchema,
  searchVocabularySchema,
  registerSchema,
  loginSchema,
  freeCourseSchema,
  paidCourseSchema,
  updateProfileSchema,
  uploadAvatarSchema,
  getProfileSchema,
} = require('../Schema/User');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

module.exports = fp(async function (fastify, opts) {
  const usersCollection = fastify.mongo.db.collection('users');
  const lessonsCollection = fastify.mongo.db.collection('lessons');
  const achievementsCollection = fastify.mongo.db.collection('achievements');
  const dailyMissionsCollection = fastify.mongo.db.collection('dailyMissions');
  const notificationsCollection = fastify.mongo.db.collection('notifications');
  const coursesCollection = fastify.mongo.db.collection('courses');
  const vocabularyCollection = fastify.mongo.db.collection('vocabulary');
  const freeCoursesCollection = fastify.mongo.db.collection('freeCourses');
  const paidCoursesCollection = fastify.mongo.db.collection('paidCourses');

  // Đăng ký
  fastify.post('/register', {
    schema: {
      ...registerSchema,
      tags: ['Người dùng'],
      operationId: 'registerUser',
      summary: 'Đăng ký tài khoản mới',
      description: `
      API cho phép người dùng đăng ký tài khoản mới bằng cách cung cấp 
      username, password, email, và avatarUrl. Nếu username đã tồn tại, 
      hệ thống sẽ trả về lỗi 400.
    `,
    }
  }, async (req, reply) => {
    const { username, password, email, avatarUrl } = req.body;
    const existing = await usersCollection.findOne({ username });
    if (existing) return reply.code(400).send({ msg: 'Username already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = {
      username,
      email: email || '',
      password: hashed,
      avatar: avatarUrl || '/uploads/default-avatar.png',
      score: 0,
      gold: 0,
      diamond: 0,
      lessons: [],
      level: 1,
      experience: 0,
      dailyStreak: 0,
      lastLogin: new Date(),
      achievements: [],
      dailyMissions: [],
    };

    await usersCollection.insertOne(newUser);
    reply.send({ msg: 'Registration successful' });
  });

  // Đăng nhập
  fastify.post('/login', {
    schema: {
      ...loginSchema,
      tags: ['Người dùng'],
      operationId: 'loginUser',
      summary: 'Đăng nhập',
      description: `
      API cho phép người dùng đăng nhập vào tài khoản bằng cách cung cấp 
      username và password. Nếu thông tin đăng nhập không hợp lệ, 
      hệ thống sẽ trả về lỗi 400.
    `,
    }
  }, async (req, reply) => {
    const { username, password } = req.body;
    const user = await usersCollection.findOne({ username });
    if (!user) return reply.code(400).send({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return reply.code(400).send({ msg: 'Invalid credentials' });

    await usersCollection.updateOne(
      { username },
      { $set: { lastLogin: new Date() } }
    );
    reply.send({ msg: 'Login successful' });
  });

  // Upload avatar cho user (dùng uploadAvatarSchema)
  fastify.post('/upload-avatar', {
    preHandler: upload.single('avatar'),
    schema: {
      tags: ['Người dùng'],
      summary: 'Upload avatar cho user',
      description: 'API này dùng để tải lên và cập nhật avatar cho user.',
      
      response: {
        200: {
          description: 'Kết quả upload avatar',
          type: 'object',
          properties: {
            msg: { type: 'string' },
            avatar: { type: 'string' }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { username } = req.body;
    const filePath = '/' + req.file.path.replace(/\\/g, '/');
    await usersCollection.updateOne(
      { username },
      { $set: { avatar: filePath } }
    );
    reply.send({ msg: 'Avatar uploaded and updated', avatar: filePath });
  });

  // Cập nhật avatar bằng link
  fastify.put('/users/:username/avatar', {
    schema: {
      summary: 'Cập nhật avatar cho user bằng link',
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      tags: ['Người dùng'],
      operationId: 'updateUserAvatar',
      description: 'API này dùng để cập nhật avatar cho user bằng link.',
     
      response: {
        200: {
          type: 'object',
          properties: { msg: { type: 'string' }, avatar: { type: 'string' } }
        }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const { avatar } = req.body;
    await usersCollection.updateOne({ username }, { $set: { avatar } });
    reply.send({ msg: 'Avatar updated', avatar });
  });

  // Upload avatar file
  fastify.post('/users/:username/avatar/upload', {
    preHandler: upload.single('avatar'),
    schema: {
      summary: 'Upload user avatar file',
      description: 'API này dùng để tải lên avatar cho user.',
      tags: ['Người dùng'],
      operationId: 'uploadUserAvatar',
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: {
        200: {
          type: 'object',
          properties: { msg: { type: 'string' }, avatar: { type: 'string' } }
        }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const filePath = '/' + req.file.path.replace(/\\/g, '/');
    await usersCollection.updateOne({ username }, { $set: { avatar: filePath } });
    reply.send({ msg: 'Avatar uploaded', avatar: filePath });
  });

  // Lấy thông tin profile user
  fastify.get('/profile', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Lấy thông tin profile user',
      description: 'API này trả về thông tin chi tiết của user theo username.',
      querystring: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: {
        200: {
          description: 'Thông tin profile user',
          type: 'object',
          properties: {
            user: getProfileSchema
          }
        }
      }
    }
  }, async (req, reply) => {
    const { username } = req.query;
    const user = await usersCollection.findOne(
      { username },
      { projection: { password: 0 } }
    );
    reply.send({ user });
  });

  // Đăng xuất
  fastify.post('/logout', {
    schema: {
      operationId: 'logoutUser',
      tags: ['Người dùng'],
      description: 'API này dùng để đăng xuất user.',
      summary: 'Đăng xuất'
    }
  }, async (req, reply) => {
    reply.send({ msg: 'Logged out' });
  });

  // Cập nhật profile user (dùng updateProfileSchema)
  fastify.put('/users/:username', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Cập nhật profile user',
      description: 'API này dùng để cập nhật thông tin profile của user.',
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
    
      response: {
        200: {
          description: 'Kết quả cập nhật profile',
          type: 'object',
          properties: { msg: { type: 'string' } }
        }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const updates = req.body;
    await usersCollection.updateOne({ username }, { $set: updates });
    reply.send({ msg: 'Profile updated' });
  });

  // Lấy danh sách tất cả người dùng (populate lessons, achievements, dailyMissions, có điểm)
  fastify.get('/users', {
    schema: {
      operationId: 'getAllUsers',
      tags: ['Người dùng'],
      summary: 'Lấy danh sách tất cả user (populate điểm bài, thành tựu, nhiệm vụ)',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              username: { type: 'string' },
              email: { type: 'string' },
              avatar: { type: 'string' },
              lessons: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    lessonId: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    point: { type: 'number' },
                  },
                },
              },
              achievements: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    achievementId: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    isClaimed: { type: 'boolean' },
                    point: { type: 'number' },
                  },
                },
              },
              dailyMissions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    missionId: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    isCompleted: { type: 'boolean' },
                    isClaimed: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, async (req, reply) => {
    const users = await usersCollection.find().toArray();

    const populatedUsers = await Promise.all(users.map(async (user) => {
      // Populate lessons với điểm từng bài
      const lessons = await Promise.all(
        (user.lessons || []).map(async (lessonObj) => {
          const lessonData = await lessonsCollection.findOne(
            { lessonId: lessonObj.lessonId },
            { projection: { lessonId: 1, title: 1, description: 1 } }
          );
          return {
            ...lessonData,
            point: lessonObj.point || 0,
          };
        })
      );

      // Populate achievements với điểm từng achievement
      const achievements = await Promise.all(
        (user.achievements || []).map(async (achObj) => {
          const achievementData = await achievementsCollection.findOne(
            { achievementId: achObj.achievementId },
            { projection: { achievementId: 1, title: 1, description: 1 } }
          );
          return {
            ...achievementData,
            isClaimed: achObj.isClaimed,
            point: achObj.point || 0,
          };
        })
      );

      // Populate daily missions
      const dailyMissions = await Promise.all(
        (user.dailyMissions || []).map(async (mission) => {
          const missionData = await dailyMissionsCollection.findOne(
            { missionId: mission.missionId },
            { projection: { missionId: 1, title: 1, description: 1 } }
          );
          return {
            ...missionData,
            isCompleted: mission.isCompleted,
            isClaimed: mission.isClaimed,
          };
        })
      );

      return {
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        lessons,
        achievements,
        dailyMissions,
      };
    }));

    reply.send(populatedUsers);
  });

  // Lấy thông tin user theo username
  fastify.get('/users/:username', {
    schema: {
      summary: 'Get user profile',
      description: 'API này trả về thông tin chi tiết của user theo username.',
      tags: ['Người dùng'],
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
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
                // ... các trường khác
              }
            }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const user = await usersCollection.findOne({ username }, { projection: { password: 0 } });
    reply.send({ user });
  });

 
  // Lấy danh sách thành tựu
  fastify.get('/achievements', {
    schema: {
      ...getAchievementsSchema,
      tags: ['Thành tựu'],
      description: 'API này trả về danh sách tất cả thành tựu.',
      operationId: 'getAllAchievements',
      summary: 'Lấy danh sách tất cả thành tựu'
    }
  }, async (req, reply) => {
    const achievements = await achievementsCollection.find().toArray();
    reply.send(achievements);
  });

  // Lấy thành tựu của 1 user
  fastify.get('/achievements/user', {
    schema: {
      ...getUserAchievementsSchema,
      tags: ['Thành tựu'],
      description: 'API này trả về danh sách thành tựu của user theo username.',
      operationId: 'getUserAchievements',
      summary: 'Lấy thành tựu của user',
      querystring: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      }
    }
  }, async (req, reply) => {
    const { username } = req.query;
    const user = await usersCollection.findOne({ username });
    reply.send(user?.achievements || []);
  });

  // Nhận thưởng thành tựu
  fastify.post('/achievements/:id/claim', {
    schema: {
      ...claimAchievementSchema,
      tags: ['Thành tựu'],
      description: 'API này dùng để nhận thưởng thành tựu cho user.',
      operationId: 'claimAchievement',
      summary: 'Nhận thưởng thành tựu'
    }
  }, async (req, reply) => {
    // Xử lý nhận thưởng thành tựu ở đây
    reply.send({ msg: 'Đã nhận thưởng (demo)' });
  });

  
  // Lấy danh sách nhiệm vụ hàng ngày
  fastify.get('/daily-missions', {
    schema: {
      ...getDailyMissionsSchema,
      tags: ['Nhiệm vụ hàng ngày'],
      description: 'API này trả về danh sách tất cả nhiệm vụ hàng ngày.',
      operationId: 'getAllDailyMissions',
      summary: 'Lấy danh sách tất cả nhiệm vụ hàng ngày'
    }
  }, async (req, reply) => {
    const missions = await dailyMissionsCollection.find().toArray();
    reply.send(missions);
  });

  // Đánh dấu hoàn thành nhiệm vụ
  fastify.post('/daily-missions/:id/complete', {
    schema: {
      ...completeMissionSchema,
      operationId: 'completeMission',
      tags: ['Nhiệm vụ hàng ngày'],
      description: 'API này dùng để đánh dấu hoàn thành nhiệm vụ cho user.',
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      },
      summary: 'Đánh dấu hoàn thành nhiệm vụ'
    }
  }, async (req, reply) => {
    // Xử lý hoàn thành nhiệm vụ ở đây
    reply.send({ msg: 'Đã hoàn thành nhiệm vụ (demo)' });
  });

  // Nhận thưởng nhiệm vụ
  fastify.post('/daily-missions/:id/claim', {
    schema: {
      ...claimMissionSchema,
      tags: ['Nhiệm vụ hàng ngày'],
      description: 'API này dùng để nhận thưởng nhiệm vụ cho user.',
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      },
      operationId: 'claimMission',
      summary: 'Nhận thưởng nhiệm vụ'
    }
  }, async (req, reply) => {
    // Xử lý nhận thưởng nhiệm vụ ở đây
    reply.send({ msg: 'Đã nhận thưởng nhiệm vụ (demo)' });
  });

  // Lấy danh sách thông báo
  fastify.get('/notifications', {
    schema: {
      ...getNotificationsSchema,
      tags: ['Thông báo'],
      description: 'API này trả về danh sách thông báo của user theo username.',
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

  // Lấy danh sách từ vựng
  fastify.get('/vocabulary', {
    schema: {
      ...getVocabularySchema,
      operationId: 'getAllVocabulary',
      summary: 'Lấy danh sách từ vựng',
      tags: ['Từ vựng'],
      description: 'API này trả về danh sách tất cả từ vựng.',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              word: { type: 'string' },
              meaning: { type: 'string' },
              example: { type: 'string' },
              category: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (req, reply) => {
    const vocabulary = await vocabularyCollection.find().toArray();
    reply.send(vocabulary);
  });

  // Lấy từ vựng theo category
  fastify.get('/vocabulary/category/:category', {
    schema: {
      ...getVocabularyByCategorySchema,
      operationId: 'getVocabularyByCategory',
      summary: 'Lấy từ vựng theo category',
      tags: ['Từ vựng'],
      description: 'API này trả về danh sách từ vựng theo category.',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              word: { type: 'string' },
              meaning: { type: 'string' },
              example: { type: 'string' },
              category: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { category } = req.params;
    const vocabulary = await vocabularyCollection.find({ category }).toArray();
    reply.send(vocabulary);
  });

  // Tìm kiếm từ vựng
  fastify.get('/vocabulary/search', {
    schema: {
      ...searchVocabularySchema,
      operationId: 'searchVocabulary',
      tags: ['Từ vựng'],
      summary: 'Tìm kiếm từ vựng',
      description: 'API này cho phép tìm kiếm từ vựng theo từ khóa.',
      querystring: {
        type: 'object',
        properties: { q: { type: 'string' } },
        required: ['q']
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              word: { type: 'string' },
              meaning: { type: 'string' },
              example: { type: 'string' },
              category: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { q } = req.query;
    const vocabulary = await vocabularyCollection.find({ word: { $regex: q, $options: 'i' } }).toArray();
    reply.send(vocabulary);
  });

  // Lấy thông tin khóa học
  fastify.get('/courses', {
    schema: {
      operationId: 'getAllCourses',
      summary: 'Lấy danh sách khóa học'
    }
  }, async (req, reply) => {
    const courses = await coursesCollection.find().toArray();
    reply.send(courses);
  });

  // Lấy danh sách khóa học miễn phí
  fastify.get('/free-courses', {
    schema: {
      tags: ['Khóa học miễn phí'],
      summary: 'Lấy danh sách tất cả khóa học miễn phí',
      description: 'Trả về danh sách tất cả các khóa học miễn phí, không cần thông tin user.',
      response: { 200: { type: 'array', items: freeCourseSchema } }
    }
  }, async (req, reply) => {
    const courses = await freeCoursesCollection.find().toArray();
    reply.send(courses);
  });

  // Tạo khóa học miễn phí mới
  fastify.post('/free-courses', {
    schema: {
      summary: 'Tạo khóa học miễn phí mới',
      body: freeCourseSchema,
      tags: ['Khóa học miễn phí'],
      description: 'API này cho phép tạo một khóa học miễn phí mới.',
      response: { 200: freeCourseSchema }
    }
  }, async (req, reply) => {
    await freeCoursesCollection.insertOne(req.body);
    reply.send(req.body);
  });

  // Lấy danh sách khóa học miễn phí và điểm từng bài của user
  fastify.get('/free-courses/:username', {
    schema: {
      tags: ['Khóa học miễn phí'],
      summary: 'Lấy danh sách khóa học miễn phí và điểm từng bài của user',
      description: 'Trả về danh sách khóa học miễn phí, mỗi bài học có điểm số của user.',
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: { 200: { type: 'array', items: freeCourseSchema } }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const user = await usersCollection.findOne({ username });
    const courses = await freeCoursesCollection.find().toArray();

    const populated = courses.map(course => ({
      ...course,
      lessons: course.lessons.map(lesson => {
        const userLesson = (user.lessons || []).find(l => l.lessonId === lesson.id);
        return {
          ...lesson,
          progress: userLesson ? userLesson.point || 0 : 0
        };
      })
    }));

    reply.send(populated);
  });

  // Lấy khóa học miễn phí theo ID
  fastify.get('/free-courses/id/:id', {
    schema: {
      summary: 'Lấy khóa học miễn phí theo ID',
      description: 'API này trả về thông tin chi tiết của khóa học miễn phí theo ID.',
      tags: ['Khóa học miễn phí'],
      operationId: 'getFreeCourseById',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      response: { 200: freeCourseSchema }
    }
  }, async (req, reply) => {
    const course = await freeCoursesCollection.findOne({ _id: req.params.id });
    reply.send(course);
  });

  // Cập nhật khóa học miễn phí
  fastify.put('/free-courses/:id', {
    schema: {
      summary: 'Cập nhật khóa học miễn phí',
      description: 'API này dùng để cập nhật thông tin khóa học miễn phí theo ID.',
      tags: ['Khóa học miễn phí'],
      operationId: 'updateFreeCourse',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      body: freeCourseSchema,
      response: { 200: freeCourseSchema }
    }
  }, async (req, reply) => {
    await freeCoursesCollection.updateOne({ _id: req.params.id }, { $set: req.body });
    const updated = await freeCoursesCollection.findOne({ _id: req.params.id });
    reply.send(updated);
  });

  // Xóa khóa học miễn phí
  fastify.delete('/free-courses/:id', {
    schema: {
      summary: 'Xóa khóa học miễn phí',
      description: 'API này dùng để xóa khóa học miễn phí theo ID.',
      tags: ['Khóa học miễn phí'],
      operationId: 'deleteFreeCourse',
      response: { 200: { type: 'object', properties: { msg: { type: 'string' } } } },
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] }
    }
  }, async (req, reply) => {
    await freeCoursesCollection.deleteOne({ _id: req.params.id });
    reply.send({ msg: 'Đã xóa khóa học miễn phí' });
  });

  // Lấy danh sách khóa học trả phí
  fastify.get('/paid-courses', {
    schema: {
      summary: 'Lấy danh sách tất cả khóa học trả phí',
      description: 'Trả về danh sách tất cả các khóa học trả phí, không cần thông tin user.',
      tags: ['Khóa học trả phí'],
      operationId: 'getAllPaidCourses',
      response: {
        200: {
          type: 'array',
          items: paidCourseSchema
        }
      }
    }
  }, async (req, reply) => {
    const courses = await paidCoursesCollection.find().toArray();
    reply.send(courses);
  });

  // Tạo khóa học trả phí mới
  fastify.post('/paid-courses', {
    schema: {
      tags: ['Khóa học trả phí'],
      summary: 'Tạo khóa học trả phí mới',
      operationId: 'createPaidCourse',
      description: 'Tạo mới một khóa học trả phí với đầy đủ thông tin.',
      body: paidCourseSchema,
      response: { 200: paidCourseSchema }
    }
  }, async (req, reply) => {
    await paidCoursesCollection.insertOne(req.body);
    reply.send(req.body);
  });

  // Lấy danh sách khóa học trả phí, populate trạng thái đã mua
  fastify.get('/paid-courses/:username', {
    schema: {
      tags: ['Khóa học trả phí'],
      operationId: 'getPaidCoursesByUsername',
      summary: 'Lấy danh sách khóa học trả phí, trạng thái đã mua và tổng vàng/kim cương của user',
      description: 'Trả về danh sách khóa học trả phí, trạng thái đã mua và tổng vàng/kim cương của user.',
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            courses: { type: 'array', items: paidCourseSchema },
            gold: { type: 'number' },
            diamond: { type: 'number' }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const user = await usersCollection.findOne({ username });
    const courses = await paidCoursesCollection.find().toArray();
    const populated = courses.map(course => ({
      ...course,
      isPurchased: (user.purchasedCourses || []).includes(course.id)
    }));

    reply.send({
      courses: populated,
      gold: user.gold || 0,
      diamond: user.diamond || 0
    });
  });

  // Lấy khóa học trả phí theo ID
  fastify.get('/paid-courses/id/:id', {
    schema: {
      summary: 'Lấy khóa học trả phí theo ID',
      tags: ['Khóa học trả phí'],
      description: 'API này trả về thông tin chi tiết của khóa học trả phí theo ID.',
      operationId: 'getPaidCourseById',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      response: { 200: paidCourseSchema }
    }
  }, async (req, reply) => {
    const course = await paidCoursesCollection.findOne({ _id: req.params.id });
    reply.send(course);
  });

  // Cập nhật khóa học trả phí
  fastify.put('/paid-courses/:id', {
    schema: {
      summary: 'Cập nhật khóa học trả phí',
      description: 'API này dùng để cập nhật thông tin khóa học trả phí theo ID.',
      tags: ['Khóa học trả phí'],
      operationId: 'updatePaidCourse',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      body: paidCourseSchema,
      response: { 200: paidCourseSchema }
    }
  }, async (req, reply) => {
    await paidCoursesCollection.updateOne({ _id: req.params.id }, { $set: req.body });
    const updated = await paidCoursesCollection.findOne({ _id: req.params.id });
    reply.send(updated);
  });

  // Xóa khóa học trả phí
  fastify.delete('/paid-courses/:id', {
    schema: {
      summary: 'Xóa khóa học trả phí',
      description: 'API này dùng để xóa khóa học trả phí theo ID.',
      tags: ['Khóa học trả phí'],
      operationId: 'deletePaidCourse',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] }
    }
  }, async (req, reply) => {
    await paidCoursesCollection.deleteOne({ _id: req.params.id });
    reply.send({ msg: 'Đã xóa khóa học trả phí' });
  });
});