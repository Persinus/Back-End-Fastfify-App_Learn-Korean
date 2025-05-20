const bcrypt = require('bcrypt');
const fp = require('fastify-plugin');
const path = require('path');
const multer = require('fastify-multer');
const {
  registerSchema,
  loginSchema,
  getProfileSchema,
  claimAchievementSchema 
} = require('../Schema/User');

module.exports = fp(async function (fastify, opts) {
  const usersCollection = fastify.mongo.db.collection('users');

  const achievementsCollection = fastify.mongo.db.collection('achievements');
  const dailyMissionsCollection = fastify.mongo.db.collection('dailyMissions');
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
      avatar: avatarUrl || 'https://i.pinimg.com/736x/a4/11/f9/a411f94f4622cfa7c1a87f4f79328064.jpg',
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
      fullName: '',
      birthday: '',
      gender: '',
      notifications: [],
      freeCourses: [],
      paidCourses: [],
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

  // Đổi mật khẩu
  fastify.put('/users/:username/password', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Đổi mật khẩu',
      body: {
        type: 'object',
        properties: {
          oldPassword: { type: 'string' },
          newPassword: { type: 'string' }
        },
        required: ['oldPassword', 'newPassword']
      },
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: {
        200: { type: 'object', properties: { msg: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const { oldPassword, newPassword } = req.body;
    const user = await usersCollection.findOne({ username });
    if (!user) return reply.code(404).send({ msg: 'User not found' });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return reply.code(400).send({ msg: 'Old password incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await usersCollection.updateOne({ username }, { $set: { password: hashed } });
    reply.send({ msg: 'Password updated' });
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

  // Cập nhật thông tin cá nhân nâng cao
  fastify.put('/users/:username/personal', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Cập nhật thông tin cá nhân nâng cao',
      body: {
        type: 'object',
        properties: {
          fullName: { type: 'string' },
          birthday: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] }
        }
      },
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: {
        200: { type: 'object', properties: { msg: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const updates = req.body;
    await usersCollection.updateOne({ username }, { $set: updates });
    reply.send({ msg: 'Personal info updated' });
  });

  // Cập nhật điểm số, vàng, kim cương
  fastify.put('/users/:username/stats', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Cập nhật điểm số, vàng, kim cương',
      body: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          gold: { type: 'number' },
          diamond: { type: 'number' }
        }
      },
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: {
        200: { type: 'object', properties: { msg: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const updates = req.body;
    await usersCollection.updateOne({ username }, { $set: updates });
    reply.send({ msg: 'Stats updated' });
  });

  // Đánh dấu thông báo đã đọc
  fastify.put('/users/:username/notifications/read', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Đánh dấu thông báo đã đọc',
      body: {
        type: 'object',
        properties: { notificationId: { type: 'string' } },
        required: ['notificationId']
      },
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: {
        200: { type: 'object', properties: { msg: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const { notificationId } = req.body;
    await usersCollection.updateOne(
      { username },
      { $pull: { notifications: notificationId } }
    );
    reply.send({ msg: 'Notification marked as read' });
  });

  fastify.put('/users/:username/notifications/:notificationId/read', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Đánh dấu thông báo đã đọc',
      params: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          notificationId: { type: 'string' }
        },
        required: ['username', 'notificationId']
      },
      response: {
        200: { type: 'object', properties: { msg: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    const { username, notificationId } = req.params;
    await usersCollection.updateOne(
      { username, 'notifications.notificationId': notificationId },
      { $set: { 'notifications.$.isRead': true } }
    );
    reply.send({ msg: 'Notification marked as read' });
  });

  // Hoàn thành daily mission
  fastify.put('/users/:username/daily-missions/complete', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Hoàn thành daily mission',
      body: {
        type: 'object',
        properties: { missionId: { type: 'string' } },
        required: ['missionId']
      },
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: {
        200: { type: 'object', properties: { msg: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const { missionId } = req.body;
    await usersCollection.updateOne(
      { username, "dailyMissions.missionId": missionId },
      { $set: { "dailyMissions.$.isCompleted": true } }
    );
    reply.send({ msg: 'Daily mission completed' });
  });

  // Hoàn thành mission và nhận vàng
  fastify.put('/users/:username/daily-missions/:missionId/complete', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Hoàn thành mission và nhận vàng',
      params: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          missionId: { type: 'string' }
        },
        required: ['username', 'missionId']
      },
      response: {
        200: { type: 'object', properties: { msg: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    const { username, missionId } = req.params;
    await usersCollection.updateOne(
      { username, 'dailyMissions.missionId': missionId },
      {
        $set: { 'dailyMissions.$.isCompleted': true, 'dailyMissions.$.isClaimed': true },
        $inc: { gold: 50 }
      }
    );
    reply.send({ msg: 'Mission completed and gold rewarded' });
  });

  // Tăng daily streak
  fastify.put('/users/:username/daily-streak', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Tăng daily streak cho user',
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: {
        200: { type: 'object', properties: { msg: { type: 'string' }, dailyStreak: { type: 'number' } } }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const result = await usersCollection.findOneAndUpdate(
      { username },
      { $inc: { dailyStreak: 1 } },
      { returnDocument: 'after' }
    );
    reply.send({ msg: 'Daily streak increased', dailyStreak: result.value.dailyStreak });
  });

  // Lấy thông tin profile user
  fastify.get('/users/profile', {
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
          properties: { user: getProfileSchema }
        }
      }
    }
  }, async (req, reply) => {
    const { username } = req.query;
    const user = await usersCollection.findOne({ username }, { projection: { password: 0 } });
    if (!user) return reply.code(404).send({ msg: 'User not found' });

    // Lấy tất cả khóa học miễn phí
    const freeCourses = await freeCoursesCollection.find().toArray();

    // Lấy chi tiết các khóa học trả phí đã mua
    const paidCourses = await Promise.all(
      (user.paidCourses || []).map(async (id) => {
        return await paidCoursesCollection.findOne({ id });
      })
    );

    reply.send({
      user: {
        ...user,
        freeCourses, // luôn là tất cả free courses
        paidCourses: paidCourses.filter(Boolean),
      }
    });
  });

  // Cập nhật profile user
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
      body: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          avatar: { type: 'string' },
          fullName: { type: 'string' },
          birthday: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          // Thêm các trường khác nếu muốn cho phép cập nhật
        }
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

  // Lấy danh sách tất cả người dùng (thông tin cơ bản)
  fastify.get('/users', {
    schema: {
      operationId: 'getAllUsers',
      tags: ['Người dùng'],
      summary: 'Lấy danh sách tất cả user (thông tin cơ bản)',
      description: `API này trả về danh sách tất cả người dùng trong hệ thống với thông tin cơ bản.`,
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              username: { type: 'string' },
              email: { type: 'string' },
              avatar: { type: 'string' },
              fullName: { type: 'string' },
              birthday: { type: 'string', format: 'date' },
              gender: { type: 'string', enum: ['male', 'female', 'other'] },
              scorescore: { type: 'number' },
            }
          }
        }
      }
    }
  }, async (req, reply) => {
    const users = await usersCollection.find().toArray();
    // Chỉ lấy các trường cơ bản, không populate chi tiết
    const result = users.map(user => ({
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      fullName: user.fullName,
      birthday: user.birthday,
      gender: user.gender,

      score: user.score,
    }));
    reply.send(result);
  });

  
});