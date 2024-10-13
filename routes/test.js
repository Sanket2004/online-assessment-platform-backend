const express = require("express");
const Test = require("../models/Test");
const TestAttempt = require("../models/TestAttempt");
const router = express.Router();

// Create a new test
router.post("/", async (req, res) => {
  const { title, description, questions, createdBy, duration } = req.body;
  const newTest = new Test({
    title,
    description,
    questions,
    createdBy,
    duration,
  });

  try {
    await newTest.save();
    res.status(201).json(newTest);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating test", error: error.message });
  }
});

// In your routes/tests.js
router.get("/", async (req, res) => {
  try {
    const tests = await Test.find().populate("createdBy", "name email"); // Fetch all tests from the database
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tests" });
  }
});

// Get a test by ID
router.get("/:id", async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.json(test);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving test", error: error.message });
  }
});

// Submit answers for a test attempt
router.post("/attempt", async (req, res) => {
  const { userId, testId, answers } = req.body;

  // Check if the user has already attempted the test
  const existingAttempt = await TestAttempt.findOne({ userId, testId });
  if (existingAttempt) {
    return res
      .status(403)
      .json({ message: "You have already attempted this test." });
  }

  try {
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    // Calculate score
    let score = 0;
    answers.forEach((answer) => {
      const question = test.questions.find(
        (q) => q._id.toString() === answer.questionId
      );
      if (question && question.answer === answer.selectedOption) {
        score++;
      }
    });

    const newAttempt = new TestAttempt({ userId, testId, answers, score });
    await newAttempt.save();
    res.status(201).json({ score });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error submitting attempt", error: error.message });
  }
});

// Get a user's previous test attempt
router.get("/attempt/:userId/:testId", async (req, res) => {
  const { userId, testId } = req.params;

  try {
    const attempt = await TestAttempt.findOne({ userId, testId });
    if (!attempt) {
      return res.status(404).json({ message: "No previous attempt found." });
    }

    // Include the score in the response
    res.json({
      attemptId: attempt._id,
      userId: attempt.userId,
      testId: attempt.testId,
      answers: attempt.answers,
      score: attempt.score, // Include the score in the response
      timeStamp: attempt.timeStamp,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving attempt", error: error.message });
  }
});

// Get all attempts for a specific user
router.get("/attempts/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const attempts = await TestAttempt.find({ userId })
      .populate({
        path: "testId",
        select: "title questions", // Make sure to include questions
      })
      .exec();

    if (attempts.length === 0) {
      return res
        .status(404)
        .json({ message: "No attempts found for this user." });
    }

    res.json(attempts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving attempts", error: error.message });
  }
});

module.exports = router;
