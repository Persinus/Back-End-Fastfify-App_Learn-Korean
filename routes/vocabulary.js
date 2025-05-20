const fp = require('fastify-plugin');
const {
  getVocabularySchema,
  getVocabularyByCategorySchema,
  searchVocabularySchema,
  createVocabularySchema,
  updateVocabularySchema,
  deleteVocabularySchema,
} = require('../Schema/Vocalbulary');

module.exports = fp(async function (fastify, opts) {
  const vocabularyCollection = fastify.mongo.db.collection('vocabulary');

  // Lấy danh sách từ vựng
  fastify.get('/vocabulary', {
    schema: {
      ...getVocabularySchema,
      tags: ['Từ vựng'],
      summary: 'Lấy danh sách tất cả từ vựng',
      description: 'API này trả về danh sách tất cả từ vựng trong hệ thống.',
      operationId: 'getAllVocabulary'
    }
  }, async (req, reply) => {
    const vocabularies = await vocabularyCollection.find().toArray();
    reply.send(vocabularies);
  });

  // Lấy từ vựng theo category
  fastify.get('/vocabulary/category/:category', {
    schema: {
      ...getVocabularyByCategorySchema,
      tags: ['Từ vựng'],
      summary: 'Lấy từ vựng theo category',
      description: 'API này trả về danh sách từ vựng theo category.',
      operationId: 'getVocabularyByCategory'
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
      tags: ['Từ vựng'],
      summary: 'Tìm kiếm từ vựng',
      description: 'API này cho phép tìm kiếm từ vựng theo từ khóa.',
      operationId: 'searchVocabulary'
    }
  }, async (req, reply) => {
    const { q } = req.query;
    const vocabularies = await vocabularyCollection.find({
      $or: [
        { word: { $regex: q, $options: 'i' } },
        { meaning: { $regex: q, $options: 'i' } }
      ]
    }).toArray();
    reply.send(vocabularies);
  });

  // Thêm từ vựng mới
  fastify.post('/vocabulary', {
    schema: {
      ...createVocabularySchema,
      tags: ['Từ vựng'],
      summary: 'Thêm từ vựng mới',
      description: 'API này cho phép thêm một từ vựng mới.',
      operationId: 'createVocabulary'
    }
  }, async (req, reply) => {
    const data = req.body;
    await vocabularyCollection.insertOne(data);
    reply.send({ msg: 'Vocabulary added', vocabulary: data });
  });

  // Cập nhật từ vựng
  fastify.put('/vocabulary/:word', {
    schema: {
      ...updateVocabularySchema,
      tags: ['Từ vựng'],
      summary: 'Cập nhật từ vựng',
      description: 'API này cho phép cập nhật thông tin một từ vựng.',
      operationId: 'updateVocabulary'
    }
  }, async (req, reply) => {
    const updates = req.body;
    const { word } = req.params;
    await vocabularyCollection.updateOne({ word }, { $set: updates });
    reply.send({ msg: 'Vocabulary updated' });
  });

  // Xóa từ vựng
  fastify.delete('/vocabulary/:word', {
    schema: {
      ...deleteVocabularySchema,
      tags: ['Từ vựng'],
      summary: 'Xóa từ vựng',
      description: 'API này cho phép xóa một từ vựng khỏi hệ thống.',
      operationId: 'deleteVocabulary'
    }
  }, async (req, reply) => {
    const { word } = req.params;
    await vocabularyCollection.deleteOne({ word });
    reply.send({ msg: 'Vocabulary deleted' });
  });
});


















