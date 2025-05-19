const fp = require('fastify-plugin');
const { freeCourseSchema } = require('../Schema/User');

module.exports = fp(async function (fastify, opts) {
  const freeCoursesCollection = fastify.mongo.db.collection('freeCourses');
  const usersCollection = fastify.mongo.db.collection('users');
  // Lấy danh sách khóa học miễn phí
  fastify.get('/free-courses', {
    schema: {
      tags: ['Khóa học miễn phí'],
      summary: 'Lấy danh sách tất cả khóa học miễn phí',
      description: `Trả về danh sách tất cả các khóa học miễn phí, không cần thông tin user.`,
      response: { 200: { type: 'array', items: freeCourseSchema } }
    }
  }, async (req, reply) => {
    const courses = await freeCoursesCollection.find().toArray();
    reply.send(courses);
  });

  // Tạo khóa học miễn phí mới
  fastify.post('/free-courses', {
    schema: {
      summary: 'Tạo khóa học miễn phí mới',
      body: freeCourseSchema,
      tags: ['Khóa học miễn phí'],
      description: 'API này cho phép tạo một khóa học miễn phí mới.',
      response: { 200: freeCourseSchema }
    }
  }, async (req, reply) => {
    await freeCoursesCollection.insertOne(req.body);
    reply.send(req.body);
  });

  // Lấy danh sách khóa học miễn phí và điểm từng bài của user
  fastify.get('/free-courses/:username', {
    schema: {
      tags: ['Khóa học miễn phí'],
      summary: 'Lấy danh sách khóa học miễn phí và điểm từng bài của user',
      description: 'Trả về danh sách khóa học miễn phí, mỗi bài học có điểm số của user.',
      params: {
        type: 'object',
        properties: { username: { type: 'string' } },
        required: ['username']
      },
      response: { 200: { type: 'array', items: freeCourseSchema } }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const user = await usersCollection.findOne({ username });
    const courses = await freeCoursesCollection.find().toArray();

    const populated = courses.map(course => ({
      ...course,
      lessons: course.lessons.map(lesson => {
        const userLesson = (user.lessons || []).find(l => l.lessonId === lesson.id);
        return {
          ...lesson,
          progress: userLesson ? userLesson.point || 0 : 0
        };
      })
    }));

    reply.send(populated);
  });

  // Lấy khóa học miễn phí theo ID
  fastify.get('/free-courses/id/:id', {
    schema: {
      summary: 'Lấy khóa học miễn phí theo ID',
      description: 'API này trả về thông tin chi tiết của khóa học miễn phí theo ID.',
      tags: ['Khóa học miễn phí'],
      operationId: 'getFreeCourseById',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      response: { 200: freeCourseSchema }
    }
  }, async (req, reply) => {
    const course = await freeCoursesCollection.findOne({ _id: req.params.id });
    reply.send(course);
  });

  // Cập nhật khóa học miễn phí
  fastify.put('/free-courses/:id', {
    schema: {
      summary: 'Cập nhật khóa học miễn phí',
      description: 'API này dùng để cập nhật thông tin khóa học miễn phí theo ID.',
      tags: ['Khóa học miễn phí'],
      operationId: 'updateFreeCourse',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      body: freeCourseSchema,
      response: { 200: freeCourseSchema }
    }
  }, async (req, reply) => {
    await freeCoursesCollection.updateOne({ _id: req.params.id }, { $set: req.body });
    const updated = await freeCoursesCollection.findOne({ _id: req.params.id });
    reply.send(updated);
  });

  // Xóa khóa học miễn phí
  fastify.delete('/free-courses/:id', {
    schema: {
      summary: 'Xóa khóa học miễn phí',
      description: 'API này dùng để xóa khóa học miễn phí theo ID.',
      tags: ['Khóa học miễn phí'],
      operationId: 'deleteFreeCourse',
      response: { 200: { type: 'object', properties: { msg: { type: 'string' } } } },
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] }
    }
  }, async (req, reply) => {
    await freeCoursesCollection.deleteOne({ _id: req.params.id });
    reply.send({ msg: 'Đã xóa khóa học miễn phí' });
  });

  // Xóa toàn bộ khóa học miễn phí theo unit
  fastify.delete('/free-courses/unit/:unit', {
    schema: {
      summary: 'Xóa toàn bộ khóa học miễn phí theo unit',
      description: 'Xóa toàn bộ khóa học miễn phí (và các lesson) theo unit.',
      tags: ['Khóa học miễn phí'],
      params: {
        type: 'object',
        properties: { unit: { type: 'number' } },
        required: ['unit']
      },
      response: { 200: { type: 'object', properties: { msg: { type: 'string' } } } }
    }
  }, async (req, reply) => {
    const { unit } = req.params;
    await freeCoursesCollection.deleteOne({ unit: Number(unit) });
    reply.send({ msg: `Đã xóa khóa học unit ${unit}` });
  });

  // Xóa 1 lesson trong unit
  fastify.delete('/free-courses/unit/:unit/lesson/:lessonId', {
    schema: {
      summary: 'Xóa 1 lesson trong unit',
      description: 'Xóa 1 lesson khỏi mảng lessons của khóa học miễn phí theo unit.',
      tags: ['Khóa học miễn phí'],
      params: {
        type: 'object',
        properties: {
          unit: { type: 'number' },
          lessonId: { type: 'string' }
        },
        required: ['unit', 'lessonId']
      },
      response: { 200: { type: 'object', properties: { msg: { type: 'string' } } } }
    }
  }, async (req, reply) => {
    const { unit, lessonId } = req.params;
    await freeCoursesCollection.updateOne(
      { unit: Number(unit) },
      { $pull: { lessons: { id: lessonId } } }
    );
    reply.send({ msg: `Đã xóa lesson ${lessonId} khỏi unit ${unit}` });
  });

});