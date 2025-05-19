const fp = require('fastify-plugin');
const { getDailyMissionsSchema, completeMissionSchema, claimMissionSchema } = require('../Schema/User');

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

  // Đánh dấu hoàn thành nhiệm vụ
  fastify.post('/daily-missions/:id/complete', {
    schema: {
      ...completeMissionSchema,
      operationId: 'completeMission',
      tags: ['Nhiệm vụ hàng ngày'],
      description: `API này dùng để đánh dấu hoàn thành nhiệm vụ cho user.`,
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
      description: `API này dùng để nhận thưởng nhiệm vụ cho user.`,
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
});