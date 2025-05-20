// --- Vocabulary Schemas ---
const getVocabularySchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          word: { type: 'string' },
          pronunciation: { type: 'string' },
          meaning: { type: 'string' },
          example: { type: 'string' },
          category: { type: 'string' },
          level: { type: 'number' },
        },
      },
    },
  },
};

const getVocabularyByCategorySchema = {
  params: {
    type: 'object',
    properties: {
      category: { type: 'string' },
    },
    required: ['category']
  },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          word: { type: 'string' },
          pronunciation: { type: 'string' },
          meaning: { type: 'string' },
          example: { type: 'string' },
          category: { type: 'string' },
          level: { type: 'number' },
        },
      },
    },
  },
};

const searchVocabularySchema = {
  querystring: {
    type: 'object',
    properties: {
      q: { type: 'string' },
    },
    required: ['q']
  },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          word: { type: 'string' },
          pronunciation: { type: 'string' },
          meaning: { type: 'string' },
          example: { type: 'string' },
          category: { type: 'string' },
          level: { type: 'number' },
        },
      },
    },
  },
};

// Thêm schema cho thêm, sửa, xóa từ vựng

const createVocabularySchema = {
  body: {
    type: 'object',
    properties: {
      word: { type: 'string' },
      pronunciation: { type: 'string' },
      meaning: { type: 'string' },
      example: { type: 'string' },
      category: { type: 'string' },
      level: { type: 'number' },
    },
    required: ['word', 'meaning', 'category']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
        vocabulary: { type: 'object' }
      }
    }
  }
};

const updateVocabularySchema = {
  params: {
    type: 'object',
    properties: { word: { type: 'string' } },
    required: ['word']
  },
  body: {
    type: 'object',
    properties: {
      pronunciation: { type: 'string' },
      meaning: { type: 'string' },
      example: { type: 'string' },
      category: { type: 'string' },
      level: { type: 'number' },
    }
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

const deleteVocabularySchema = {
  params: {
    type: 'object',
    properties: { word: { type: 'string' } },
    required: ['word']
  },
  response: {
    200: {
      type: 'object',
      properties: { msg: { type: 'string' } }
    }
  }
};

module.exports = {
  getVocabularySchema,
  getVocabularyByCategorySchema,
  searchVocabularySchema,
  createVocabularySchema,
  updateVocabularySchema,
  deleteVocabularySchema,
};