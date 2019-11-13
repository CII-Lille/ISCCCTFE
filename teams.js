const TeamModel = require('./team')
const moment = require('moment')

function exists(name) {
    return TeamModel.findOne({
        name
    })
}

function create(name) {
    const exercise = 0
    const history = []

    let team = new TeamModel({
        name,
        exercise,
        history
    })

    return team.save()
}

function getExercise(name) {
    return TeamModel.findOne({
        name
    }).then(team => {
        return team.get('exercise')
    })
}

function setExercise(name, value) {
    return TeamModel.findOne({
        name
    }).then(team => {
        return team.set('exercise', value).save()
    })
}

function pass(name) {
    return TeamModel.findOne({
        name
    }).then(team => {
        const date = moment().format('DD/MM/YYYY, hh:mm:ss')
        let exercise = team.exercise
        let history = team.history

        history.push(`[${date}] Exercise ${exercise} validated.`)
        exercise++

        return team.set({
            exercise,
            history
        }).save()
    })
}

module.exports = {
    exists,
    create,
    getExercise,
    setExercise,
    pass
}