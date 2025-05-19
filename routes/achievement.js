const fp = require('fastify-plugin');
const { getAchievementsSchema, getUserAchievementsSchema, claimAchievementSchema } = require('../Schema/User');

module.exports = fp(async function (fastify, opts) {
  const achievementsCollection = fastify.mongo.db.collection('achievements');
  const usersCollection = fastify.mongo.db.collection('users');
  // Lấy danh sách thành tựu
  fastify.get('/achievements', {
    schema: {
      ...getAchievementsSchema,
      tags: ['Thành tựu'],
      description: `API này trả về danh sách tất cả thành tựu.`,
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
      description: `API này trả về danh sách thành tựu của user theo username.`,
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
      description: `API này dùng để nhận thưởng thành tựu cho user.`,
      operationId: 'claimAchievement',
      summary: 'Nhận thưởng thành tựu'
    }
  }, async (req, reply) => {
    // Xử lý nhận thưởng thành tựu ở đây
    reply.send({ msg: 'Đã nhận thưởng (demo)' });
  });

});