const feedbackSchema = {
  bsonType: "object",
  required: ["name", "rating", "comment", "role", "createdAt"],
  properties: {
    name: { bsonType: "string" },
    rating: { bsonType: "int", minimum: 1, maximum: 5 },
    comment: { bsonType: "string" },
    role: { bsonType: "string", enum: ["vote", "admin"] },
    createdAt: { bsonType: "date" }
  }
};
module.exports = feedbackSchema;