const mongoose = require('mongoose')

const TeamModel = mongoose.model('team', {
    name: String,
    exercise: Number,
    history: Array
})

module.exports = TeamModel
