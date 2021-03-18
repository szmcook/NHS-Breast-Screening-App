const mongoose = require('mongoose')

const responseSchema = new mongoose.Schema({
    questionID: {
        type: String,
        required: [true, 'questionId is required']
    },
    content: {
        type: String,
        required: [true, 'response content is required']
    }
})

module.exports = responseSchema