const fp = require('fastify-plugin');
const { getVocabularySchema, getVocabularyByCategorySchema, searchVocabularySchema } = require('../Schema/User');

module.exports = fp(async function (fastify, opts) {
  const vocabularyCollection = fastify.mongo.db.collection('vocabulary');
  // Lấy danh sách từ vựng
  fastify.get('/vocabulary', {
    schema: {
      ...getVocabularySchema,
      operationId: 'getAllVocabulary',
      summary: 'Lấy danh sách từ vựng',
      tags: ['Từ vựng'],
      description: 'API này trả về danh sách tất cả từ vựng.',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              word: { type: 'string' },
              meaning: { type: 'string' },
              example: { type: 'string' },
              category: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (req, reply) => {
    const vocabulary = await vocabularyCollection.find().toArray();
    reply.send(vocabulary);
  });

  // Lấy từ vựng theo category
  fastify.get('/vocabulary/category/:category', {
    schema: {
      ...getVocabularyByCategorySchema,
      operationId: 'getVocabularyByCategory',
      summary: 'Lấy từ vựng theo category',
      tags: ['Từ vựng'],
      description: `API này trả về danh sách từ vựng theo category.`,
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              word: { type: 'string' },
              meaning: { type: 'string' },
              example: { type: 'string' },
              category: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { category } = req.params;
    const vocabulary = await vocabularyCollection.find({ category }).toArray();
    reply.send(vocabulary);
  });

  // Tìm kiếm từ vựng
  fastify.get('/vocabulary/search', {
    schema: {
      ...searchVocabularySchema,
      operationId: 'searchVocabulary',
      tags: ['Từ vựng'],
      summary: 'Tìm kiếm từ vựng',
      description: `API này cho phép tìm kiếm từ vựng theo từ khóa.`,
      querystring: {
        type: 'object',
        properties: { q: { type: 'string' } },
        required: ['q']
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              word: { type: 'string' },
              meaning: { type: 'string' },
              example: { type: 'string' },
              category: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { q } = req.query;
    const vocabulary = await vocabularyCollection.find({ word: { $regex: q, $options: 'i' } }).toArray();
    reply.send(vocabulary);
  });
});