require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const http = require('http')
const bodyParser = require('body-parser')
const exercise = require('./exercise')
const teams = require('./teams')

const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server) // eslint-disable-line
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/ctf'

app.set('port', (process.env.PORT || 5000))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    return res.render('index', {
        layout: 'layouts/main'
    })
})

app.post('/start', (req, res) => {
    if (req.body.team) {
        const teamName = req.body.team

        return teams.exists(teamName).then(team => {
            if (team === null) return teams.create(teamName)
            return team
        }).then(() => {
            return res.redirect(`/run/${teamName}`)
        }).catch(() => {
            return res.redirect('/')
        })
    } else {
        return res.redirect('/')
    }
})

app.get('/run', (req, res) => res.redirect('/'))

app.get('/run/:team', (req, res) => {
    const teamName = req.params.team

    return teams.exists(teamName).then(result => {
        if (!result) return Promise.reject(Error("Team doesn't exists"))
    }).then(() => {
        teams.getExercise(teamName).then(exerciseId => {
            if (exercise < 0) return res.redirect('/')
            if (exerciseId >= exercise.files.length) {
                return res.render('done', {
                    team: teamName,
                    layout: 'layouts/main'
                })
            }

            return res.render(exercise.files[exerciseId] || 'index', {
                team: teamName,
                layout: 'layouts/main'
            })
        })
    }).catch(() => {
        return res.redirect('/')
    })
})

app.get('/recap/:team', (req, res) => {
    const teamName = req.params.team

    return teams.exists(teamName).then(result => {
        if (!result) return Promise.reject(Error("Team doesn't exists"))
    }).then(() => {
        teams.getRecap(teamName).then(recap => {
            return res.render('recap.hbs', {
                team: teamName,
                recap,
                layout: 'layouts/main'
            })
        })
    }).catch(() => {
        res.redirect('/')
    })
})

app.post('/run', (req, res) => {
    const teamName = req.body.team
    const answers = req.body

    return teams.exists(teamName).then(team => {
        if (team === null) return Promise.reject(Error("Team doesn't exists"))
        return team
    }).then(team => {
        if (exercise.validate(team.exercise, answers)) {
            teams.pass(teamName).then(() => {
                return res.redirect(`/run/${teamName}`)
            })
        } else {
            return res.render(exercise.files[team.exercise] || 'index', {
                team: teamName,
                failure: true,
                layout: 'layouts/main'
            })
        }
    }).catch(() => {
        return res.redirect('/')
    })
})

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 5000
}).then(() => {
    server.listen(app.get('port'), () => {
        console.log(`Listening on ${app.get('port')}`)
        console.log(`Local: http://localhost:${app.get('port')}`)
    })
}).catch((err) => {
    console.log(`Server didn't start due to the following error: ${err.name}`)
    console.log('\nPlease check that your database is up')
})