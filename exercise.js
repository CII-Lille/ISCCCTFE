const answers = require('./answers.json').answers
const files = [
    'exe1.hbs',
    'exe2.hbs',
    'exe3.hbs',
    'exe4.hbs',
    'exe5.hbs',
    'exe6.hbs',
    'exe7.hbs',
    'exe8.hbs',
    'exe9.hbs'
]

function validate(exercise, values) {
    if (exercise < 0 || exercise >= answers.length) return false

    const expected = answers[exercise]

    for (const [key, value] of Object.entries(expected)) {
        if (values[key].toUpperCase() !== value.toUpperCase()) return false
    }

    return true
}

module.exports = {
    answers,
    files,
    validate
}