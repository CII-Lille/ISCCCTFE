require("dotenv").config();
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const basicAuth = require("express-basic-auth");
const session = require("express-session");
const passwordProtected = require("express-password-protect");
const team = require("../team");

const app = express();

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:12345/ctf";
app.set("port", process.env.PORT || 5000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "../", "public")));

app.use(
    passwordProtected({
        username: "cii",
        password: "hello",
        maxAge: 60000
    })
);

const dbName = "cii-ctf";

function getLast(history) {
    if (history.length === 0) return "none";
    let last = history[history.length - 1];
    let splitted = last.split(" ");

    return (parseInt(splitted[3]) + 1) + " " + splitted[0] + " " + splitted[1];
}

function getPoints(team) {
    let exercise = team.exercise

    return exercise * (exercise + 1) / 2
}

app.use((req, res) => {
    MongoClient.connect(mongoUrl, (err, client) => {
        if (err) throw err;

        const db = client.db(dbName);
        const collection = db.collection("teams");

        collection.find({}).toArray((err, docs) => {
            const e = docs.map(team => {
                return {
                    name: team.name,
                    exercise: team.exercise + 1,
                    last: getLast(team.history),
                    points: getPoints(team),
                    bonus: false
                };
            });

            res.render('list', {
                data: e
            })
            // res.end(JSON.stringify(e));
        });
    });
})

/*const server = new mongodb.Server("127.0.0.1", 27018, {});

app.use((req, res) => {
  new mongodb.Db("cii-ctf", server, {}).open(function(error, client) {
    if (error) throw error;
    var collection = new mongodb.Collection(client, "teams");
    collection.find({}, { limit: 10 }).toArray(function(err, docs) {
      console.dir(docs);
    });
  });
});*/

app.listen(app.get("port"), () => {
    console.log(`Listening on ${app.get("port")}`);
    console.log(`Local: http://localhost:${app.get("port")}`);
});