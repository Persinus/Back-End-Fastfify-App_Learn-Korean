// --- Free Course Schema ---
const freeCourseSchema = {
  type: 'object',
  properties: {
    unit: { type: 'number' },
    lessons: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          image: { type: 'string' },
          score: { type: 'number' }, // điểm tối đa của bài học
          progress: { type: 'number' } // điểm user đạt được với bài này
        },
        required: ['id', 'title', 'description', 'image', 'score', 'progress']
      }
    }
  },
  required: ['unit', 'lessons']
};

// --- Paid Course Schema ---
const paidCourseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    price: { type: 'string' },
    teacher: { type: 'string' },
    rating: { type: 'number' },
    description: { type: 'string' },
    image: { type: 'string' },
    cover: { type: 'string' },
    lessons: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'object' }, // { vn: '...', en: '...' }
          duration: { type: 'object' }, // { vn: '...', en: '...' }
          isLocked: { type: 'boolean' },
          type: { type: 'string' }
        },
        required: ['id', 'title', 'duration', 'isLocked', 'type']
      }
    }
  },
  required: ['id', 'name', 'price', 'teacher', 'rating', 'description', 'image', 'cover', 'lessons']
};

// --- API Schemas for Free Course ---
const getFreeCoursesSchema = {
  response: {
    200: {
      type: 'array',
      items: freeCourseSchema
    }
  }
};

const getFreeCourseByUnitSchema = {
  params: {
    type: 'object',
    properties: { unit: { type: 'number' } },
    required: ['unit']
  },
  response: {
    200: freeCourseSchema
  }
};

const createFreeCourseSchema = {
  body: freeCourseSchema,
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
        course: freeCourseSchema
      }
    }
  }
};

const updateFreeCourseSchema = {
  params: {
    type: 'object',
    properties: { unit: { type: 'number' } },
    required: ['unit']
  },
  body: freeCourseSchema,
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

const deleteFreeCourseSchema = {
  params: {
    type: 'object',
    properties: { unit: { type: 'number' } },
    required: ['unit']
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

// --- API Schemas for Paid Course ---
const getPaidCoursesSchema = {
  response: {
    200: {
      type: 'array',
      items: paidCourseSchema
    }
  }
};

const getPaidCourseByIdSchema = {
  params: {
    type: 'object',
    properties: { id: { type: 'string' } },
    required: ['id']
  },
  response: {
    200: paidCourseSchema
  }
};

const createPaidCourseSchema = {
  body: paidCourseSchema,
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
        course: paidCourseSchema
      }
    }
  }
};

const updatePaidCourseSchema = {
  params: {
    type: 'object',
    properties: { id: { type: 'string' } },
    required: ['id']
  },
  body: paidCourseSchema,
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

const deletePaidCourseSchema = {
  params: {
    type: 'object',
    properties: { id: { type: 'string' } },
    required: ['id']
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

module.exports = {
  freeCourseSchema,
  paidCourseSchema,
  getFreeCoursesSchema,
  getFreeCourseByUnitSchema,
  createFreeCourseSchema,
  updateFreeCourseSchema,
  deleteFreeCourseSchema,
  getPaidCoursesSchema,
  getPaidCourseByIdSchema,
  createPaidCourseSchema,
  updatePaidCourseSchema,
  deletePaidCourseSchema,
};