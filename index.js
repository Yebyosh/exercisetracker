const mongoose = require('mongoose');
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
let bodyParser = require('body-parser');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const subSchema = new mongoose.Schema({
  description: { type: String },
  duration: { type: Number, min: 0 },
  date: { type: Date, default: Date.now }
});
const exerTrkSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  count: { type: Number, min: 0 },
  log: [subSchema]
});
let exercise = mongoose.model('Exercise', subSchema);
let exerciser = mongoose.model('Exerciser', exerTrkSchema);

app.use(cors())
app.use(express.static('public'))

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


/*
POST to /api/users with form data username to create new user.
Returned response from POST /api/users with form data username will be object with username and _id properties.
*/
app.post("/api/users", (req, res) => {
//  console.log(req.body);
  const {username} = req.body;
  console.log(username);
});

/*
GET request to /api/users to get list of all users.
GET request to /api/users returns an array.
Each element in array is an object literal containing user's username and _id.
*/
app.get("/api/users", (req, res) => {
  console.log(req)
});

/*
POST to /api/users/:_id/exercises with form data description, duration, and optionally date. If no date supplied, current date used.
Response returned from POST /api/users/:_id/exercises will be the user object with exercise fields added.
*/
app.post("/api/users/:_id/exercises", (req, res) => {
  console.log(req.body);
  const {description, duration, date} = req.body;
  console.log(req.body.id, description, duration, date);

});

/*
GET request to /api/users/:_id/logs retrieve full exercise log of any user.
GET request to /api/users/:_id/logs return user object with log array of all exercises added.
Request to user's log GET /api/users/:_id/logs returns a user object with count property representing number of exercises to that user.
Each item in log array returned from GET /api/users/:_id/logs is object that has description, duration, and date properties.
Description property of any object in log array returned should be a string.
Duration property of any object in log array returned should be a number.
Date property of any object in log array returned should be a string. Use dateString format of Date API.
Can add from, to and limit parameters to GET /api/users/:_id/logs request to retrieve part of log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.
*/
app.get("/api/users/:_id/logs", (req, res) => {
  console.log(req);
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
