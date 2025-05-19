const bcrypt = require('bcrypt');
const fp = require('fastify-plugin');
const path = require('path');
const multer = require('fastify-multer');
const {
  registerSchema,
  loginSchema,
  getProfileSchema,
} = require('../Schema/User');


module.exports = fp(async function (fastify, opts) {
  const usersCollection = fastify.mongo.db.collection('users');
  
  const achievementsCollection = fastify.mongo.db.collection('achievements');
  const dailyMissionsCollection = fastify.mongo.db.collection('dailyMissions');


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
      response: {
        200: {
          type: 'object',
          properties: {
            msg: { type: 'string' }
          }
        }
      },
      body: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
          email: { type: 'string' },
          avatarUrl: { type: 'string' }
        },
        required: ['username', 'password']
      }
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
      },
  
      summary: 'Đăng nhập tài khoản',

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

 

  // Cập nhật avatar bằng link
  fastify.put('/users/:username/avatar', {
    schema: {
      tags: ['Người dùng'],
      operationId: 'updateUserAvatar',
      body: {
        type: 'object',
        properties: { avatar: { type: 'string' } },
        required: ['avatar']
      },
      summary: 'Cập nhật avatar cho user bằng link',
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },

      description: `API này dùng để cập nhật avatar cho user bằng link.`,

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

  

  // Lấy thông tin profile user
  fastify.get('/profile', {
    schema: {
      tags: ['Người dùng'],
      summary: `Lấy thông tin profile user`,
      description: `API này trả về thông tin chi tiết của user theo username.`,
      querystring: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: {
        200: {
          description: `Thông tin profile user`,
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
      description: `API này dùng để đăng xuất user.`,
      summary: `Đăng xuất`
    }
  }, async (req, reply) => {
    reply.send({ msg: 'Logged out' });
  });

  // Cập nhật profile user (dùng updateProfileSchema)
  fastify.put('/users/:username', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Cập nhật profile user',
      description: `API này dùng để cập nhật thông tin profile của user.`,
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
      description: `API này trả về danh sách tất cả người dùng trong hệ thống, bao gồm thông tin chi tiết như username, email, avatar, lessons, achievements và dailyMissions.`,
     
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
      description: `API này trả về thông tin chi tiết của user theo username.`,
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

});