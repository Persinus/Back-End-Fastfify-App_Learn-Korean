const createGiftcodeSchema = {
  body: {
    type: 'object',
    properties: {
      code: { type: 'string' },
      gold: { type: 'number', default: 0 },
      diamond: { type: 'number', default: 0 },
      score: { type: 'number', default: 0 },
      expiresAt: { type: 'string', format: 'date-time' }
    },
    required: ['code']
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' }, giftcode: { type: 'object' } }
    }
  }
};

const redeemGiftcodeSchema = {
  body: {
    type: 'object',
    properties: {
      code: { type: 'string' },
      username: { type: 'string' }
    },
    required: ['code', 'username']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
        gold: { type: 'number' },
        diamond: { type: 'number' },
        score: { type: 'number' }
      }
    }
  }
};

module.exports = { createGiftcodeSchema, redeemGiftcodeSchema };