const fp = require('fastify-plugin');
const {
  paidCourseSchema,
  getPaidCoursesSchema,
  getPaidCourseByIdSchema,
  createPaidCourseSchema,
  updatePaidCourseSchema,
  deletePaidCourseSchema,
} = require('../Schema/Course');

module.exports = fp(async function (fastify, opts) {
  const paidCoursesCollection = fastify.mongo.db.collection('paidCourses');
  const usersCollection = fastify.mongo.db.collection('users');

  // Lấy danh sách khóa học trả phí
  fastify.get('/paid-courses', {
    schema: {
      ...getPaidCoursesSchema,
      tags: ['Khóa học trả phí'],
      summary: 'Lấy danh sách khóa học trả phí',
      description: 'API này trả về danh sách tất cả các khóa học trả phí.',
      operationId: 'getAllPaidCourses'
    }
  }, async (req, reply) => {
    const courses = await paidCoursesCollection.find().toArray();
    reply.send(courses);
  });

  // Tạo khóa học trả phí mới
  fastify.post('/paid-courses', {
    schema: {
      ...createPaidCourseSchema,
      tags: ['Khóa học trả phí'],
      summary: 'Tạo khóa học trả phí mới',
      description: 'API này cho phép tạo mới một khóa học trả phí.',
      operationId: 'createPaidCourse'
    }
  }, async (req, reply) => {
    await paidCoursesCollection.insertOne(req.body);
    reply.send(req.body);
  });

  // Lấy danh sách khóa học trả phí của user
  fastify.get('/paid-courses/user/:username', {
    schema: {
      tags: ['Khóa học trả phí'],
      summary: 'Lấy danh sách khóa học trả phí của user',
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
            diamond: { type: 'number' },
            msg: { type: 'string' }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const user = await usersCollection.findOne({ username });
    if (!user || !user.paidCourses || user.paidCourses.length === 0) {
      return reply.send({
        courses: [],
        gold: user ? user.gold : 0,
        diamond: user ? user.diamond : 0,
        msg: 'Người dùng này chưa đăng kí khóa học có phí nào'
      });
    }
    // Lấy chi tiết các khóa học đã mua
    const courseIds = user.paidCourses.map(c => c.id);
    const courses = await paidCoursesCollection.find({ id: { $in: courseIds } }).toArray();
    // Gắn trạng thái isLocked vào từng khóa học
    const result = courses.map(course => {
      const userCourse = user.paidCourses.find(c => c.id === course.id);
      return {
        ...course,
        isLocked: userCourse ? userCourse.isLocked : true
      };
    });
    reply.send({
      courses: result,
      gold: user.gold || 0,
      diamond: user.diamond || 0,
      msg: ''
    });
  });

  // Lấy khóa học trả phí theo ID
  fastify.get('/paid-courses/id/:id', {
    schema: {
      ...getPaidCourseByIdSchema,
      tags: ['Khóa học trả phí'],
      summary: 'Lấy thông tin chi tiết của một khóa học trả phí theo ID.',
      operationId: 'getPaidCourseById'
    }
  }, async (req, reply) => {
    const course = await paidCoursesCollection.findOne({ id: req.params.id });
    reply.send(course);
  });

  // Cập nhật thông tin khóa học trả phí
  fastify.put('/paid-courses/:id', {
    schema: {
      ...updatePaidCourseSchema,
      tags: ['Khóa học trả phí'],
      summary: 'Cập nhật thông tin một khóa học trả phí.',
      operationId: 'updatePaidCourse'
    }
  }, async (req, reply) => {
    await paidCoursesCollection.updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    const updated = await paidCoursesCollection.findOne({ id: req.params.id });
    reply.send(updated);
  });

  // Mở khóa (mua) khóa học trả phí cho user
  fastify.post('/paid-courses/:id/unlock', {
    schema: {
      tags: ['Khóa học trả phí'],
      summary: 'Mở khóa (mua) khóa học trả phí cho user',
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
      response: {
        200: {
          type: 'object',
          properties: {
            msg: { type: 'string' },
            gold: { type: 'number' },
            diamond: { type: 'number' }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { id } = req.params;
    const { username } = req.body;
    const course = await paidCoursesCollection.findOne({ id });
    if (!course) return reply.code(404).send({ msg: 'Không tìm thấy khóa học' });

    // Kiểm tra user đã có khóa học này chưa và trạng thái
    const user = await usersCollection.findOne({ username });
    const userCourse = (user.paidCourses || []).find(c => c.id === id);

    if (userCourse && userCourse.isLocked === false) {
      return reply.code(400).send({ msg: 'Khóa học đã được mở khóa trước đó' });
    }

    const goldReward = course.goldReward || 100;
    const diamondReward = course.diamondReward || 10;

    if (userCourse) {
      // Đã có khóa học, chỉ cập nhật trạng thái
      await usersCollection.updateOne(
        { username, "paidCourses.id": id, "paidCourses.isLocked": true },
        {
          $set: { "paidCourses.$.isLocked": false },
          $inc: { gold: goldReward, diamond: diamondReward }
        }
      );
    } else {
      // Chưa có, thêm mới vào mảng paidCourses
      await usersCollection.updateOne(
        { username },
        {
          $addToSet: { paidCourses: { id, isLocked: false } },
          $inc: { gold: goldReward, diamond: diamondReward }
        }
      );
    }

    const updatedUser = await usersCollection.findOne({ username });
    reply.send({
      msg: 'Đã mở khóa khóa học, cộng thưởng thành công',
      gold: updatedUser.gold,
      diamond: updatedUser.diamond
    });
  });

  // Đánh dấu hoàn thành khóa học trả phí và cộng điểm cho user
  fastify.post('/paid-courses/:id/complete', {
    schema: {
      tags: ['Khóa học trả phí'],
      summary: 'Đánh dấu hoàn thành khóa học trả phí và cộng điểm cho user',
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
      response: {
        200: {
          type: 'object',
          properties: {
            msg: { type: 'string' },
            score: { type: 'number' }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { id } = req.params;
    const { username } = req.body;
    const course = await paidCoursesCollection.findOne({ id });
    if (!course) return reply.code(404).send({ msg: 'Không tìm thấy khóa học' });

    const scoreReward = course.scoreReward || 100;

    await usersCollection.updateOne(
      { username },
      {
        $addToSet: { completedPaidCourses: id },
        $inc: { score: scoreReward }
      }
    );
    const user = await usersCollection.findOne({ username });
    reply.send({
      msg: 'Đã hoàn thành khóa học và cộng điểm thành công',
      score: user.score
    });
  });

  // Xóa khóa học trả phí
  fastify.delete('/paid-courses/:id', {
    schema: {
      ...deletePaidCourseSchema,
      tags: ['Khóa học trả phí'],
      summary: 'Xóa khóa học trả phí',
      description: 'API này cho phép xóa một khóa học trả phí theo ID.',
      operationId: 'deletePaidCourse'
    }
  }, async (req, reply) => {
    await paidCoursesCollection.deleteOne({ id: req.params.id });
    reply.send({ msg: 'Đã xóa khóa học trả phí' });
  });

  // Xóa 1 lesson trong khóa học trả phí
  fastify.delete('/paid-courses/:courseId/lesson/:lessonId', {
    schema: {
      tags: ['Khóa học trả phí'],
      summary: 'Xóa 1 lesson trong khóa học trả phí',
      description: 'Xóa 1 lesson khỏi mảng lessons của khóa học trả phí theo id.',
      operationId: 'deleteLessonInPaidCourse',
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
      { id: courseId },
      { $pull: { lessons: { id: lessonId } } }
    );
    reply.send({ msg: `Đã xóa lesson ${lessonId} khỏi khóa học ${courseId}` });
  });
});