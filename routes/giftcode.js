const fp = require('fastify-plugin');
const { createGiftcodeSchema, redeemGiftcodeSchema } = require('../Schema/Giftcode');

module.exports = fp(async function (fastify, opts) {
  const giftcodesCollection = fastify.mongo.db.collection('giftcodes');
  const usersCollection = fastify.mongo.db.collection('users');

  // Tạo giftcode mới
  fastify.post('/giftcodes', {
    schema: {
      ...createGiftcodeSchema,
      tags: ['Giftcode'],
      summary: 'Tạo giftcode mới',
      description: 'API này cho phép admin tạo một giftcode mới để phát tài nguyên cho user. Có thể cấu hình số lượng gold, diamond, score và ngày hết hạn.'
    }
  }, async (req, reply) => {
    const { code, gold = 0, diamond = 0, score = 0, expiresAt } = req.body;
    const existing = await giftcodesCollection.findOne({ code });
    if (existing) return reply.code(400).send({ msg: 'Giftcode already exists' });
    const giftcode = { code, gold, diamond, score, expiresAt: expiresAt ? new Date(expiresAt) : null, usedBy: [] };
    await giftcodesCollection.insertOne(giftcode);
    reply.send({ msg: 'Giftcode created', giftcode });
  });

  // Nhận thưởng giftcode
  fastify.post('/giftcodes/redeem', {
    schema: {
      ...redeemGiftcodeSchema,
      tags: ['Giftcode'],
      summary: 'Nhận thưởng giftcode',
      description: 'API này cho phép user nhập giftcode để nhận tài nguyên (gold, diamond, score). Mỗi user chỉ được nhận 1 lần mỗi 7 ngày cho mỗi code.'
    }
  }, async (req, reply) => {
    const { code, username } = req.body;
    const giftcode = await giftcodesCollection.findOne({ code });
    if (!giftcode) return reply.code(404).send({ msg: 'Giftcode not found' });
    if (giftcode.expiresAt && new Date() > new Date(giftcode.expiresAt)) {
      return reply.code(400).send({ msg: 'Giftcode expired' });
    }
    if (giftcode.usedBy && giftcode.usedBy.includes(username)) {
      return reply.code(400).send({ msg: 'You have already redeemed this giftcode' });
    }

    // Cộng tài nguyên cho user
    await usersCollection.updateOne(
      { username },
      { $inc: { gold: giftcode.gold, diamond: giftcode.diamond, score: giftcode.score } }
    );
    await giftcodesCollection.updateOne(
      { code },
      { $addToSet: { usedBy: username } }
    );
    reply.send({
      msg: 'Giftcode redeemed successfully',
      gold: giftcode.gold,
      diamond: giftcode.diamond,
      score: giftcode.score
    });
  });

  // Lấy danh sách giftcode
  fastify.get('/giftcodes', {
    schema: {
      tags: ['Giftcode'],
      summary: 'Lấy danh sách giftcode',
      description: 'API này trả về danh sách tất cả giftcode.',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              gold: { type: 'number' },
              diamond: { type: 'number' },
              score: { type: 'number' },
              expiresAt: { type: 'string', format: 'date-time' },
              usedBy: { type: 'array', items: { type: 'object' } }
            }
          }
        }
      }
    }
  }, async (req, reply) => {
    const codes = await giftcodesCollection.find().toArray();
    reply.send(codes);
  });

  // Xóa giftcode
  fastify.delete('/giftcodes/:code', {
    schema: {
      tags: ['Giftcode'],
      summary: 'Xóa giftcode',
      description: 'API này cho phép admin xóa một giftcode theo mã code.',
      params: {
        type: 'object',
        properties: { code: { type: 'string' } },
        required: ['code']
      },
      response: {
        200: { type: 'object', properties: { msg: { type: 'string' } } }
      }
    }
  }, async (req, reply) => {
    const { code } = req.params;
    const result = await giftcodesCollection.deleteOne({ code });
    if (result.deletedCount === 0) return reply.code(404).send({ msg: 'Giftcode not found' });
    reply.send({ msg: 'Giftcode deleted' });
  });

  // Sửa giftcode
  fastify.put('/giftcodes/:code', {
    schema: {
      tags: ['Giftcode'],
      summary: 'Sửa giftcode',
      description: 'API này cho phép admin sửa thông tin giftcode (gold, diamond, score, expiresAt).',
      params: {
        type: 'object',
        properties: { code: { type: 'string' } },
        required: ['code']
      },
      body: {
        type: 'object',
        properties: {
          gold: { type: 'number' },
          diamond: { type: 'number' },
          score: { type: 'number' },
          expiresAt: { type: 'string', format: 'date-time' }
        }
      },
      response: {
        200: { type: 'object', properties: { msg: { type: 'string' }, giftcode: { type: 'object' } } }
      }
    }
  }, async (req, reply) => {
    const { code } = req.params;
    const updates = req.body;
    if (updates.expiresAt) updates.expiresAt = new Date(updates.expiresAt);
    const result = await giftcodesCollection.findOneAndUpdate(
      { code },
      { $set: updates },
      { returnDocument: 'after' }
    );
    if (!result.value) return reply.code(404).send({ msg: 'Giftcode not found' });
    reply.send({ msg: 'Giftcode updated', giftcode: result.value });
  });
});