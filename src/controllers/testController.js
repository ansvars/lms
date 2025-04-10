const Test = require('../models/Test'); // Assuming you have a Test model

exports.getTests = async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTestDetails = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Keep other existing controller methods