const fp = require('fastify-plugin');
const {
  getAchievementsSchema,
  getUserAchievementsSchema,
  claimAchievementSchema,
  createAchievementSchema,
  updateAchievementSchema,
  deleteAchievementSchema,
} = require('../Schema/Achievement');

module.exports = fp(async function (fastify, opts) {
  const achievementsCollection = fastify.mongo.db.collection('achievements');
  const usersCollection = fastify.mongo.db.collection('users');

  // Lấy danh sách tất cả thành tựu
  fastify.get('/achievements', {
    schema: {
      ...getAchievementsSchema,
      tags: ['Thành tựu'],
      summary: 'Lấy danh sách tất cả thành tựu',
      description: 'API này trả về danh sách tất cả thành tựu.',
      operationId: 'getAllAchievements'
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
      summary: 'Lấy thành tựu của user',
      description: 'API này trả về danh sách thành tựu của user theo username.',
      operationId: 'getUserAchievements',
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



  // Thêm thành tựu mới
  fastify.post('/achievements', {
    schema: {
      ...createAchievementSchema,
      tags: ['Thành tựu'],
      summary: 'Thêm thành tựu mới',
      description: 'API này cho phép thêm một thành tựu mới.',
      operationId: 'createAchievement'
    }
  }, async (req, reply) => {
    const data = req.body;
    await achievementsCollection.insertOne(data);
    reply.send({ msg: 'Achievement created', achievement: data });
  });

  // Cập nhật thành tựu
  fastify.put('/achievements/:id', {
    schema: {
      ...updateAchievementSchema,
      tags: ['Thành tựu'],
      summary: 'Cập nhật thành tựu',
      description: 'API này cho phép cập nhật thông tin thành tựu.',
      operationId: 'updateAchievement'
    }
  }, async (req, reply) => {
    const { id } = req.params;
    const updates = req.body;
    await achievementsCollection.updateOne({ achievementId: id }, { $set: updates });
    reply.send({ msg: 'Achievement updated' });
  });

  // Xóa thành tựu
  fastify.delete('/achievements/:id', {
    schema: {
      ...deleteAchievementSchema,
      tags: ['Thành tựu'],
      summary: 'Xóa thành tựu',
      description: 'API này cho phép xóa một thành tựu.',
      operationId: 'deleteAchievement'
    }
  }, async (req, reply) => {
    const { id } = req.params;
    await achievementsCollection.deleteOne({ achievementId: id });
    reply.send({ msg: 'Achievement deleted' });
  });
  // Nhận thưởng thành tựu
  fastify.post('/achievements/:id/claim', {
    schema: {
      ...claimAchievementSchema,
      tags: ['Thành tựu'],
      summary: 'Nhận thưởng thành tựu',
      description: 'API này dùng để nhận thưởng thành tựu cho user.',
      operationId: 'claimAchievement',
      body: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      }
    }
  }, async (req, reply) => {
    const { id } = req.params;
    const { username } = req.body;

    const achievement = await achievementsCollection.findOne({ achievementId: id });
    if (!achievement) return reply.code(404).send({ msg: 'Achievement not found' });

    const goldReward = achievement.reward?.gold || 0;
    const user = await usersCollection.findOne({ username });
    if (!user) return reply.code(404).send({ msg: 'User not found' });

    const userAchievement = (user.achievements || []).find(a => a.achievementId === id);

    if (!userAchievement) {
      // Nếu chưa có, thêm vào mảng achievements
      await usersCollection.updateOne(
        { username },
        { $push: { achievements: { achievementId: id, isClaimed: true } }, $inc: { gold: goldReward } }
      );
      return reply.send({ msg: 'Achievement added, claimed and gold rewarded', gold: (user.gold || 0) + goldReward });
    } else if (!userAchievement.isClaimed) {
      // Nếu đã có, chỉ update trạng thái và cộng vàng nếu chưa claim
      await usersCollection.updateOne(
        { username, 'achievements.achievementId': id },
        {
          $set: { 'achievements.$.isClaimed': true },
          $inc: { gold: goldReward }
        }
      );
      const updatedUser = await usersCollection.findOne({ username });
      return reply.send({ msg: 'Achievement claimed and gold rewarded', gold: updatedUser.gold });
    } else {
      return reply.send({ msg: 'Achievement already claimed', gold: user.gold });
    }
  });
});