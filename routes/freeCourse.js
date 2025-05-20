const fp = require('fastify-plugin');
const {
  freeCourseSchema,
  getFreeCoursesSchema,
  getFreeCourseByIdSchema,
  getFreeCourseByUsernameSchema,
  createFreeCourseSchema,
  updateFreeCourseSchema,
  deleteFreeCourseSchema,
  deleteFreeCourseByUnitSchema,
  deleteLessonInUnitSchema,
} = require('../Schema/Course');

module.exports = fp(async function (fastify, opts) {
  const freeCoursesCollection = fastify.mongo.db.collection('freeCourses');
  const usersCollection = fastify.mongo.db.collection('users');

  // Lấy danh sách khóa học miễn phí
  fastify.get('/free-courses', {
    schema: {
      ...getFreeCoursesSchema,
      tags: ['Khóa học miễn phí'],
      summary: 'Lấy danh sách khóa học miễn phí',
      description: 'API này trả về danh sách tất cả các khóa học miễn phí.',
      operationId: 'getAllFreeCourses'
    }
  }, async (req, reply) => {
    const courses = await freeCoursesCollection.find().toArray();
    reply.send(courses);
  });

  // Tạo khóa học miễn phí mới
  fastify.post('/free-courses', {
    schema: {
      ...createFreeCourseSchema,
      tags: ['Khóa học miễn phí'],
      summary: 'Tạo khóa học miễn phí mới',
      description: 'API này cho phép tạo mới một khóa học miễn phí.',
      operationId: 'createFreeCourse'
    }
  }, async (req, reply) => {
    await freeCoursesCollection.insertOne(req.body);
    reply.send(req.body);
  });

  // Lấy danh sách khóa học miễn phí và điểm từng bài của user
  fastify.get('/free-courses/:username', {
    schema: {
      ...getFreeCourseByUsernameSchema,
      tags: ['Khóa học miễn phí'],
      summary: 'Lấy khóa học miễn phí và điểm từng bài của user',
      description: 'API này trả về danh sách khóa học miễn phí và điểm từng bài học của user.',
      operationId: 'getFreeCoursesByUsername'
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
          progress: userLesson ? userLesson.point || 0 : 0 // Đổi score thành point
        };
      })
    }));

    reply.send(populated);
  });

  // Lấy khóa học miễn phí theo ID
  fastify.get('/free-courses/id/:id', {
    schema: {
      ...getFreeCourseByIdSchema,
      tags: ['Khóa học miễn phí'],
      summary: 'Lấy khóa học miễn phí theo ID',
      description: 'API này trả về thông tin chi tiết của một khóa học miễn phí theo ID.',
      operationId: 'getFreeCourseById'
    }
  }, async (req, reply) => {
    const course = await freeCoursesCollection.findOne({ _id: req.params.id });
    reply.send(course);
  });

  // Cập nhật khóa học miễn phí
  fastify.put('/free-courses/:id', {
    schema: {
      ...updateFreeCourseSchema,
      tags: ['Khóa học miễn phí'],
      summary: 'Cập nhật khóa học miễn phí',
      description: 'API này cho phép cập nhật thông tin một khóa học miễn phí.',
      operationId: 'updateFreeCourse'
    }
  }, async (req, reply) => {
    await freeCoursesCollection.updateOne({ _id: req.params.id }, { $set: req.body });
    const updated = await freeCoursesCollection.findOne({ _id: req.params.id });
    reply.send(updated);
  });

  // Xóa khóa học miễn phí
  fastify.delete('/free-courses/:id', {
    schema: {
      ...deleteFreeCourseSchema,
      tags: ['Khóa học miễn phí'],
      summary: 'Xóa khóa học miễn phí',
      description: 'API này cho phép xóa một khóa học miễn phí theo ID.',
      operationId: 'deleteFreeCourse'
    }
  }, async (req, reply) => {
    await freeCoursesCollection.deleteOne({ _id: req.params.id });
    reply.send({ msg: 'Đã xóa khóa học miễn phí' });
  });

  // Xóa toàn bộ khóa học miễn phí theo unit
  fastify.delete('/free-courses/unit/:unit', {
    schema: {
      ...deleteFreeCourseByUnitSchema,
      tags: ['Khóa học miễn phí'],
      summary: 'Xóa khóa học miễn phí theo unit',
      description: 'API này cho phép xóa toàn bộ khóa học miễn phí theo unit.',
      operationId: 'deleteFreeCourseByUnit'
    }
  }, async (req, reply) => {
    const { unit } = req.params;
    await freeCoursesCollection.deleteOne({ unit: Number(unit) });
    reply.send({ msg: `Đã xóa khóa học unit ${unit}` });
  });

  // Xóa 1 lesson trong unit
  fastify.delete('/free-courses/unit/:unit/lesson/:lessonId', {
    schema: {
      ...deleteLessonInUnitSchema,
      tags: ['Khóa học miễn phí'],
      summary: 'Xóa bài học trong unit',
      description: 'API này cho phép xóa một bài học khỏi unit của khóa học miễn phí.',
      operationId: 'deleteLessonInUnit'
    }
  }, async (req, reply) => {
    const { unit, lessonId } = req.params;
    await freeCoursesCollection.updateOne(
      { unit: Number(unit) },
      { $pull: { lessons: { id: lessonId } } }
    );
    reply.send({ msg: `Đã xóa lesson ${lessonId} khỏi unit ${unit}` });
  });

  // Hoàn thành bài học miễn phí và cộng điểm cho user
  fastify.post('/free-courses/:unit/lesson/:lessonId/complete', {
    schema: {
      tags: ['Khóa học miễn phí'],
      summary: 'Hoàn thành bài học miễn phí và cộng điểm cho user',
      params: {
        type: 'object',
        properties: {
          unit: { type: 'string' },
          lessonId: { type: 'string' }
        },
        required: ['unit', 'lessonId']
      },
      body: {
        type: 'object',
        properties: {
          username: { type: 'string' }
        },
        required: ['username']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            msg: { type: 'string' },
            totalPoint: { type: 'number' }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { unit, lessonId } = req.params;
    const { username } = req.body;

    // Lấy điểm của bài học từ DB
    const course = await freeCoursesCollection.findOne({ unit: Number(unit) });
    if (!course) return reply.code(404).send({ msg: 'Không tìm thấy khóa học' });
    const lesson = (course.lessons || []).find(l => l.id === lessonId);
    if (!lesson) return reply.code(404).send({ msg: 'Không tìm thấy bài học' });

    const point = lesson.point || 0;

    // Cập nhật điểm cho user
    await usersCollection.updateOne(
      { username },
      {
        $addToSet: { lessons: { lessonId, unit: Number(unit), point } },
        $inc: { point }
      }
    );
    // Nếu đã có thì cập nhật lại point
    await usersCollection.updateOne(
      { username, "lessons.lessonId": lessonId },
      { $set: { "lessons.$.point": point, "lessons.$.unit": Number(unit) } }
    );

    const user = await usersCollection.findOne({ username });
    reply.send({
      msg: 'Đã hoàn thành bài học và cộng điểm thành công',
      totalPoint: user.point
    });
  });
});