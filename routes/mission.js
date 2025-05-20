const fp = require('fastify-plugin');
const { getDailyMissionsSchema, createMissionSchema, claimAndCompleteMissionSchema } = require('../Schema/DailyMission');
module.exports = fp(async function (fastify, opts) {
  const dailyMissionsCollection = fastify.mongo.db.collection('dailyMissions');
  const usersCollection = fastify.mongo.db.collection('users');
   // Lấy danh sách nhiệm vụ hàng ngày
  fastify.get('/daily-missions', {
    schema: {
      ...getDailyMissionsSchema,
      tags: ['Nhiệm vụ hàng ngày'],
      description: `API này trả về danh sách tất cả nhiệm vụ hàng ngày.`,
      operationId: 'getAllDailyMissions',
      summary: 'Lấy danh sách tất cả nhiệm vụ hàng ngày'
    }
  }, async (req, reply) => {
    const missions = await dailyMissionsCollection.find().toArray();
    reply.send(missions);
  });

  // Thêm nhiệm vụ hàng ngày
  fastify.post('/daily-missions', {
    schema: {
      ...createMissionSchema,
      tags: ['Nhiệm vụ hàng ngày'],
      summary: 'Thêm nhiệm vụ hàng ngày',
      description: 'API này cho phép thêm một nhiệm vụ hàng ngày mới.',
      operationId: 'createDailyMission'
    }
  }, async (req, reply) => {
    const data = req.body;
    await dailyMissionsCollection.insertOne(data);
    reply.send({ msg: 'Daily mission created', mission: data });
  });

  // Đánh dấu hoàn thành nhiệm vụ và nhận thưởng
  fastify.post('/daily-missions/:id/complete', {
    schema: {
      ...claimAndCompleteMissionSchema,
      tags: ['Nhiệm vụ hàng ngày'],
      summary: 'Hoàn thành và nhận thưởng nhiệm vụ hàng ngày',
      description: 'API này đánh dấu hoàn thành và nhận thưởng nhiệm vụ cho user.',
      operationId: 'completeAndClaimMission'
    }
  }, async (req, reply) => {
    const { id } = req.params;
    const { username } = req.body;

    // Lấy thông tin nhiệm vụ
    const mission = await dailyMissionsCollection.findOne({ missionId: id });
    if (!mission) return reply.code(404).send({ msg: 'Mission not found' });

    const goldReward = mission.reward?.gold || 0;
    const user = await usersCollection.findOne({ username });
    if (!user) return reply.code(404).send({ msg: 'User not found' });

    // Kiểm tra user đã có mission này chưa
    const userMission = (user.dailyMissions || []).find(m => m.missionId === id);

    if (!userMission) {
      // Nếu chưa có, thêm vào mảng dailyMissions và cộng vàng
      await usersCollection.updateOne(
        { username },
        { $push: { dailyMissions: { missionId: id, isCompleted: true, isClaimed: true } }, $inc: { gold: goldReward } }
      );
      return reply.send({ msg: 'Mission completed, claimed and gold rewarded', gold: (user.gold || 0) + goldReward });
    } else if (!userMission.isClaimed) {
      // Nếu đã có, chỉ update trạng thái và cộng vàng nếu chưa claim
      await usersCollection.updateOne(
        { username, 'dailyMissions.missionId': id },
        {
          $set: { 'dailyMissions.$.isCompleted': true, 'dailyMissions.$.isClaimed': true },
          $inc: { gold: goldReward }
        }
      );
      const updatedUser = await usersCollection.findOne({ username });
      return reply.send({ msg: 'Mission completed, claimed and gold rewarded', gold: updatedUser.gold });
    } else {
      return reply.send({ msg: 'Mission already claimed', gold: user.gold });
    }
  });

  // Nhận thưởng nhiệm vụ
  fastify.post('/daily-missions/:id/claim', {
    schema: {
      ...claimAndCompleteMissionSchema,
      tags: ['Nhiệm vụ hàng ngày'],
      description: `API này dùng để nhận thưởng nhiệm vụ cho user.`,
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      operationId: 'claimMission',
      summary: 'Nhận thưởng nhiệm vụ'
    }
  }, async (req, reply) => {
    const { id } = req.params;
    const { username } = req.body;

    // Lấy thông tin nhiệm vụ
    const mission = await dailyMissionsCollection.findOne({ missionId: id });
    if (!mission) return reply.code(404).send({ msg: 'Mission not found' });

    const goldReward = mission.reward?.gold || 0;
    const user = await usersCollection.findOne({ username });
    if (!user) return reply.code(404).send({ msg: 'User not found' });

    // Kiểm tra user đã có mission này chưa
    const userMission = (user.dailyMissions || []).find(m => m.missionId === id);

    if (!userMission) {
      // Nếu chưa có, thêm vào mảng dailyMissions và cộng vàng
      await usersCollection.updateOne(
        { username },
        { $push: { dailyMissions: { missionId: id, isCompleted: true, isClaimed: true } }, $inc: { gold: goldReward } }
      );
      return reply.send({ msg: 'Mission added, claimed and gold rewarded', gold: (user.gold || 0) + goldReward });
    } else if (!userMission.isClaimed) {
      // Nếu đã có, chỉ update trạng thái và cộng vàng nếu chưa claim
      await usersCollection.updateOne(
        { username, 'dailyMissions.missionId': id },
        {
          $set: { 'dailyMissions.$.isCompleted': true, 'dailyMissions.$.isClaimed': true },
          $inc: { gold: goldReward }
        }
      );
      const updatedUser = await usersCollection.findOne({ username });
      return reply.send({ msg: 'Mission claimed and gold rewarded', gold: updatedUser.gold });
    } else {
      return reply.send({ msg: 'Mission already claimed', gold: user.gold });
    }
  });

  // Xóa nhiệm vụ hàng ngày
  fastify.delete('/daily-missions/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      },
      tags: ['Nhiệm vụ hàng ngày'],
      summary: 'Xóa nhiệm vụ hàng ngày',
      description: 'API này cho phép xóa một nhiệm vụ hàng ngày.',
      operationId: 'deleteDailyMission',
      response: {
        200: {
          type: 'object',
          properties: { msg: { type: 'string' } }
        }
      }
    }
  }, async (req, reply) => {
    const { id } = req.params;
    await dailyMissionsCollection.deleteOne({ missionId: id });
    reply.send({ msg: 'Daily mission deleted' });
  });

  
});