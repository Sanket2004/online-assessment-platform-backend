const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    answer: { type: String, required: true }
});

const TestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: [QuestionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who created the test
    createdAt: { type: Date, default: Date.now }, // Timestamp for when the test was created
    duration: {type:  Number, required: true},

});

const Test = mongoose.model('Test', TestSchema);
module.exports = Test;
