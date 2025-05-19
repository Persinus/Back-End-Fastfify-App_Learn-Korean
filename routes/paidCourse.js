const fp = require('fastify-plugin');
const { paidCourseSchema } = require('../Schema/User');

module.exports = fp(async function (fastify, opts) {
  const paidCoursesCollection = fastify.mongo.db.collection('paidCourses');
  const usersCollection = fastify.mongo.db.collection('users');
  // Lấy danh sách khóa học trả phí
  fastify.get('/paid-courses', {
    schema: {
      summary: 'Lấy danh sách tất cả khóa học trả phí',
      description: 'Trả về danh sách tất cả các khóa học trả phí, không cần thông tin user.',
      tags: ['Khóa học trả phí'],
      operationId: 'getAllPaidCourses',
      response: {
        200: {
          type: 'array',
          items: paidCourseSchema
        }
      }
    }
  }, async (req, reply) => {
    const courses = await paidCoursesCollection.find().toArray();
    reply.send(courses);
  });

  // Tạo khóa học trả phí mới
  fastify.post('/paid-courses', {
    schema: {
      tags: ['Khóa học trả phí'],
      summary: 'Tạo khóa học trả phí mới',
      operationId: 'createPaidCourse',
      description: 'Tạo mới một khóa học trả phí với đầy đủ thông tin.',
      body: paidCourseSchema,
      response: { 200: paidCourseSchema }
    }
  }, async (req, reply) => {
    await paidCoursesCollection.insertOne(req.body);
    reply.send(req.body);
  });

  // Lấy danh sách khóa học trả phí, populate trạng thái đã mua
  fastify.get('/paid-courses/:username', {
    schema: {
      tags: ['Khóa học trả phí'],
      operationId: 'getPaidCoursesByUsername',
      summary: 'Lấy danh sách khóa học trả phí, trạng thái đã mua và tổng vàng/kim cương của user',
      description: 'Trả về danh sách khóa học trả phí, trạng thái đã mua và tổng vàng/kim cương của user.',
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            courses: { type: 'array', items: paidCourseSchema },
            gold: { type: 'number' },
            diamond: { type: 'number' }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const user = await usersCollection.findOne({ username });
    const courses = await paidCoursesCollection.find().toArray();
    const populated = courses.map(course => ({
      ...course,
      isPurchased: (user.purchasedCourses || []).includes(course.id)
    }));

    reply.send({
      courses: populated,
      gold: user.gold || 0,
      diamond: user.diamond || 0
    });
  });

  // Lấy khóa học trả phí theo ID
  fastify.get('/paid-courses/id/:id', {
    schema: {
      summary: 'Lấy khóa học trả phí theo ID',
      tags: ['Khóa học trả phí'],
      description: 'API này trả về thông tin chi tiết của khóa học trả phí theo ID.',
      operationId: 'getPaidCourseById',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      response: { 200: paidCourseSchema }
    }
  }, async (req, reply) => {
    const course = await paidCoursesCollection.findOne({ _id: req.params.id });
    reply.send(course);
  });

  // Cập nhật khóa học trả phí
  fastify.put('/paid-courses/:id', {
    schema: {
      summary: 'Cập nhật khóa học trả phí',
      description: 'API này dùng để cập nhật thông tin khóa học trả phí theo ID.',
      tags: ['Khóa học trả phí'],
      operationId: 'updatePaidCourse',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      body: paidCourseSchema,
      response: { 200: paidCourseSchema }
    }
  }, async (req, reply) => {
    await paidCoursesCollection.updateOne({ _id: req.params.id }, { $set: req.body });
    const updated = await paidCoursesCollection.findOne({ _id: req.params.id });
    reply.send(updated);
  });

  // Xóa khóa học trả phí
  fastify.delete('/paid-courses/:id', {
    schema: {
      summary: 'Xóa khóa học trả phí',
      description: 'API này dùng để xóa khóa học trả phí theo ID.',
      tags: ['Khóa học trả phí'],
      operationId: 'deletePaidCourse',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] }
    }
  }, async (req, reply) => {
    await paidCoursesCollection.deleteOne({ _id: req.params.id });
    reply.send({ msg: 'Đã xóa khóa học trả phí' });
  });

  // Xóa 1 lesson trong khóa học trả phí
  fastify.delete('/paid-courses/:courseId/lesson/:lessonId', {
    schema: {
      summary: 'Xóa 1 lesson trong khóa học trả phí',
      description: 'Xóa 1 lesson khỏi mảng lessons của khóa học trả phí theo id.',
      tags: ['Khóa học trả phí'],
      params: {
        type: 'object',
        properties: {
          courseId: { type: 'string' },
          lessonId: { type: 'string' }
        },
        required: ['courseId', 'lessonId']
      },
      response: { 200: { type: 'object', properties: { msg: { type: 'string' } } } }
    }
  }, async (req, reply) => {
    const { courseId, lessonId } = req.params;
    await paidCoursesCollection.updateOne(
      { _id: courseId },
      { $pull: { lessons: { id: lessonId } } }
    );
    reply.send({ msg: `Đã xóa lesson ${lessonId} khỏi khóa học ${courseId}` });
  });
});