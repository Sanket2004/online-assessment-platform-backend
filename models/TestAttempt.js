const mongoose = require("mongoose");

const TestAttemptSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // You can change this to reference a User model
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  answers: [{ questionId: String, selectedOption: String }],
  score: { type: Number, required: true },
  timeStamp: { type: Date, default: Date.now },
});

const TestAttempt = mongoose.model("TestAttempt", TestAttemptSchema);
module.exports = TestAttempt;
