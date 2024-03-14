const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true,
    }
})

const weather = mongoose.model('weatherDetails', weatherSchema);

module.exports = weather;