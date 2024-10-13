const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const certificateRoutes = require('./routes/certificate');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Authentication routes
app.use('/api/auth', authRoutes);

// Test routes
app.use('/api/tests', testRoutes);

//Certificate Route
app.use('/api', certificateRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
