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


  const freeCoursesCollection = fastify.mongo.db.collection('freeCourses');
  const paidCoursesCollection = fastify.mongo.db.collection('paidCourses');

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
      
      level: 1,
      experience: 0,
      dailyStreak: 0,
      lastLogin: new Date(),
      achievements: [],
      dailyMissions: [],
      fullName: '',
      birthday: '',
      gender: '',
 
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
    const user = await usersCollection.findOne({ username });
    if (!user) return reply.code(404).send({ msg: 'User not found' });

    const now = new Date();
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;

    let newStreak = user.dailyStreak || 0;
    let msg = '';

    if (lastLogin) {
      // So sánh ngày (không tính giờ phút)
      const last = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
        msg = 'Daily streak increased!';
      } else if (diffDays > 1) {
        newStreak = 1;
        msg = 'Streak reset. New streak started!';
      } else {
        msg = 'Already checked in today!';
      }
    } else {
      newStreak = 1;
      msg = 'Streak started!';
    }

    await usersCollection.updateOne(
      { username },
      { $set: { dailyStreak: newStreak, lastLogin: now } }
    );

    reply.send({ msg, dailyStreak: newStreak });
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
              score: { type: 'number' },
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

  // Gửi lời mời kết bạn
  fastify.post('/users/:username/friend-request', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Gửi lời mời kết bạn',
      description: 'API này cho phép user gửi lời mời kết bạn tới user khác theo username.',
      params: {
        type: 'object',
        properties: { username: { type: 'string' } }, // người nhận
        required: ['username']
      },
      body: {
        type: 'object',
        properties: { from: { type: 'string' } }, // người gửi
        required: ['from']
      },
      response: {
        200: { type: 'object', properties: { msg: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params; // người nhận
    const { from } = req.body;       // người gửi

    if (username === from) return reply.code(400).send({ msg: 'Cannot send friend request to yourself' });

    // Kiểm tra đã là bạn bè chưa
    const user = await usersCollection.findOne({ username });
    if (user.friends && user.friends.includes(from)) {
      return reply.code(400).send({ msg: 'Already friends' });
    }
    // Kiểm tra đã có lời mời chưa
    if (user.friendRequests && user.friendRequests.find(r => r.from === from && r.status === 'pending')) {
      return reply.code(400).send({ msg: 'Friend request already sent' });
    }

    await usersCollection.updateOne(
      { username },
      { $push: { friendRequests: { from, status: 'pending' } } }
    );
    reply.send({ msg: 'Friend request sent' });
  });

  // Duyệt lời mời kết bạn
  fastify.post('/users/:username/friend-request/respond', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Duyệt lời mời kết bạn',
      description: 'API này cho phép user chấp nhận hoặc từ chối lời mời kết bạn.',
      params: {
        type: 'object',
        properties: { username: { type: 'string' } }, // người nhận
        required: ['username']
      },
      body: {
        type: 'object',
        properties: {
          from: { type: 'string' }, // người gửi lời mời
          accept: { type: 'boolean' }
        },
        required: ['from', 'accept']
      },
      response: {
        200: { type: 'object', properties: { msg: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params; // người nhận
    const { from, accept } = req.body;

    // Cập nhật trạng thái lời mời
    await usersCollection.updateOne(
      { username, "friendRequests.from": from, "friendRequests.status": "pending" },
      { $set: { "friendRequests.$.status": accept ? "accepted" : "rejected" } }
    );

    if (accept) {
      // Thêm bạn bè cho cả hai user
      await usersCollection.updateOne(
        { username },
        { $addToSet: { friends: from } }
      );
      await usersCollection.updateOne(
        { username: from },
        { $addToSet: { friends: username } }
      );
    }

    reply.send({ msg: accept ? 'Friend request accepted' : 'Friend request rejected' });
  });

  // Lấy danh sách bạn bè
  fastify.get('/users/:username/friends', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Lấy danh sách bạn bè',
      description: 'API này trả về danh sách username bạn bè của user.',
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            friends: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const user = await usersCollection.findOne({ username });
    reply.send({ friends: user.friends || [] });
  });

  // Lấy danh sách lời mời kết bạn chờ duyệt
  fastify.get('/users/:username/friend-requests', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Lấy danh sách lời mời kết bạn chờ duyệt',
      description: 'API này trả về danh sách user đã gửi lời mời kết bạn cho user này và đang chờ duyệt.',
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            requests: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  from: { type: 'string' },
                  status: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const user = await usersCollection.findOne({ username });
    if (!user) return reply.code(404).send({ msg: 'User not found' });

    // Lấy các lời mời kết bạn đang chờ duyệt
    const requests = (user.friendRequests || []).filter(r => r.status === 'pending');
    reply.send({ requests });
  });

  // Tăng gold cho user
  fastify.post('/users/:username/add-gold', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Tăng gold cho user',
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      body: {
        type: 'object',
        properties: { amount: { type: 'number', minimum: 1 } },
        required: ['amount']
      },
      response: {
        200: { type: 'object', properties: { msg: { type: 'string' }, gold: { type: 'number' } } }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const { amount } = req.body;
    const user = await usersCollection.findOneAndUpdate(
      { username },
      { $inc: { gold: amount } },
      { returnDocument: 'after' }
    );
    if (!user.value) return reply.code(404).send({ msg: 'User not found' });
    reply.send({ msg: 'Gold added', gold: user.value.gold });
  });

  // Tăng diamond cho user
  fastify.post('/users/:username/add-diamond', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Tăng diamond cho user',
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      body: {
        type: 'object',
        properties: { amount: { type: 'number', minimum: 1 } },
        required: ['amount']
      },
      response: {
        200: { type: 'object', properties: { msg: { type: 'string' }, diamond: { type: 'number' } } }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const { amount } = req.body;
    const user = await usersCollection.findOneAndUpdate(
      { username },
      { $inc: { diamond: amount } },
      { returnDocument: 'after' }
    );
    if (!user.value) return reply.code(404).send({ msg: 'User not found' });
    reply.send({ msg: 'Diamond added', diamond: user.value.diamond });
  });

  // Tăng score cho user
  fastify.post('/users/:username/add-score', {
    schema: {
      tags: ['Người dùng'],
      summary: 'Tăng score cho user',
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      body: {
        type: 'object',
        properties: { amount: { type: 'number', minimum: 1 } },
        required: ['amount']
      },
      response: {
        200: { type: 'object', properties: { msg: { type: 'string' }, score: { type: 'number' } } }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const { amount } = req.body;
    const user = await usersCollection.findOneAndUpdate(
      { username },
      { $inc: { score: amount } },
      { returnDocument: 'after' }
    );
    if (!user.value) return reply.code(404).send({ msg: 'User not found' });
    reply.send({ msg: 'Score added', score: user.value.score });
  });
  
});