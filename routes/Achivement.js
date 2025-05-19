const fp = require('fastify-plugin');
const {
  getAchievementsSchema,
  getUserAchievementsSchema,
  claimAchievementSchema,
} = require('../Schema/AchievementsSchema'); // Import schema

module.exports = fp(async function (fastify, opts) {
  const achievementsCollection = fastify.mongo.db.collection('achievements');
  const usersCollection = fastify.mongo.db.collection('users');

  // Lấy danh sách tất cả thành tựu
  fastify.get('/achievements', { schema: getAchievementsSchema }, async (req, reply) => {
    const achievements = await achievementsCollection.find().toArray();
    reply.send(achievements);
  });

  // Lấy thành tựu của người dùng hiện tại
  fastify.get('/achievements/user', {
    preValidation: [fastify.authenticate],
    schema: getUserAchievementsSchema,
  }, async (req, reply) => {
    const user = await usersCollection.findOne(
      { username: req.user.username },
      { projection: { achievements: 1 } }
    );

    if (!user || !user.achievements) {
      return reply.send([]);
    }

    const userAchievements = await achievementsCollection
      .find({ achievementId: { $in: user.achievements.map(a => a.achievementId) } })
      .toArray();

    const achievementsWithStatus = userAchievements.map(achievement => {
      const userAchievement = user.achievements.find(a => a.achievementId === achievement.achievementId);
      return {
        ...achievement,
        isClaimed: userAchievement?.isClaimed || false,
      };
    });

    reply.send(achievementsWithStatus);
  });
  // Thêm Route POST để Tạo Thành Tựu
fastify.post('/achievements', {
  schema: {
    body: {
      type: 'object',
      required: ['title', 'description', 'icon', 'reward', 'requirement'],
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        icon: { type: 'string' },
        reward: { 
          type: 'object', 
          properties: {
            gold: { type: 'number' },
            coin: { type: 'number' },
          },
          required: ['gold', 'coin']
        },
        requirement: { type: 'object', additionalProperties: true },
      },
    },
    response: {
      201: {
        type: 'object',
        properties: {
          msg: { type: 'string' },
          achievementId: { type: 'string' },
        },
      },
    },
  },
}, async (req, reply) => {
  const { title, description, icon, reward, requirement } = req.body;

  const newAchievement = {
    achievementId: new Date().getTime().toString(), // hoặc sử dụng UUID
    title,
    description,
    icon,
    reward,
    requirement,
  };

  await achievementsCollection.insertOne(newAchievement);
  
  reply.code(201).send({ msg: 'Achievement created successfully', achievementId: newAchievement.achievementId });
});
  // Nhận phần thưởng từ thành tựu
  fastify.post('/achievements/:id/claim', {
    preValidation: [fastify.authenticate],
    schema: claimAchievementSchema,
  }, async (req, reply) => {
    const { id } = req.params;

    const user = await usersCollection.findOne({ username: req.user.username });
    if (!user) return reply.code(404).send({ msg: 'User not found' });

    const achievement = await achievementsCollection.findOne({ achievementId: id });
    if (!achievement) return reply.code(404).send({ msg: 'Achievement not found' });

    const userAchievement = user.achievements.find(a => a.achievementId === id);
    if (!userAchievement || userAchievement.isClaimed) {
      return reply.code(400).send({ msg: 'Achievement already claimed or not completed' });
    }

    // Đánh dấu thành tựu là đã nhận
    await usersCollection.updateOne(
      { username: req.user.username, 'achievements.achievementId': id },
      { $set: { 'achievements.$.isClaimed': true } }
    );

    reply.send({ msg: 'Reward claimed successfully', reward: achievement.reward });
  });
});