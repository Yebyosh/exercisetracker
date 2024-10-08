const mongoose = require('mongoose');
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
let bodyParser = require('body-parser');

const regexDate = /\d\d\d\d-\d\d-\d\d/;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const subSchema = new mongoose.Schema({
  description: { type: String },
  duration: { type: Number, min: 0 },
  date: { type: String },
}, { _id: false });
const exerTrkSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  count: { type: Number, default: 0 },
  log: [subSchema]
});
let Exerciser = mongoose.model('Exerciser', exerTrkSchema);

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
if (username==="DeleteALL") {
  Exerciser
  .deleteMany({})
  .then((doc) =>
  {
    console.log("Delete Success!");
    res.status(301).send('dB cleared');
  })
  .catch((err) =>
  {
    console.error(err);
  })
}
else
{
  let newUser = new Exerciser({
    username: username
  });

  newUser
  .save()
  .then((doc) =>
  {
    console.log(`POSTing: ${doc}`);
    res.json({username: doc.username, _id: doc.id});
  })
  .catch((err) =>
  {
    console.error(err);
    if (err.code == 11000) {
      res.status(400).send('User already exists');
    }
  })
}
});

/*
GET request to /api/users to get list of all users.
GET request to /api/users returns an array.
Each element in array is an object literal containing user's username and _id.
*/
app.get("/api/users", (req, res) => {
  console.log(req.params); // params should be empty
  Exerciser
  .find({})
  .select("username _id")
  .then ((results) => {
    res.json(results);
  })
  .catch ((err) => {
    console.error(err);
  })
});

/*
POST to /api/users/:_id/exercises with form data description, duration, and optionally date. If no date supplied, current date used.
Response returned from POST /api/users/:_id/exercises will be the user object with exercise fields added.
*/
app.post("/api/users/:_id/exercises", (req, res) => {
  console.log(req.body, req.params, req.query);
  const {description, duration, date} = req.body;
  const {_id} = req.params;
  console.log(_id, description, duration, date);

  const adjDate = regexDate.test(date) ? new Date(date).toDateString(): new Date().toDateString();
  console.log(adjDate);

  Exerciser
  .findOne({_id: _id})
  .then ((result) => {
    let record = {
      description: description,
      duration: duration,
      date: adjDate
    };
    result.log.push(record);
    result.count++;
    result
    .save()
    .then ((doc) =>
    {
      res.json({
        username: doc.username,
        description: description,
        duration: Number(duration),
        date: adjDate,
        _id: doc.id
      });
    })
    .catch ((err) =>
    {
      console.error(err);
    })
  })
  .catch ((err) =>
  {
    console.error(err);
  })
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
  console.log(req.params); // params only _id...
  console.log(req.body);
  console.log(req.query);
  const {_id} = req.params;
  const {from, to, limit} = req.query;

  Exerciser
  .findById({_id: _id})
  .then ((doc) =>
    {
      console.log(doc);

      let wrkLog = doc.log;

      if (from)
      {
        if (regexDate.test(from))
        {
          wrkLog = wrkLog.filter(item => new Date(item.date) >= new Date(from));
        }
      }

      if (to)
      {
        if (regexDate.test(to))
          {
            wrkLog = wrkLog.filter(item => new Date(item.date) <= new Date(to));
          }
        }
  
      if (limit)
      {
        wrkLog.splice(limit);
      }

      res.json({
        username: doc.username,
        count: doc.count,
        _id: doc.id,
        log: wrkLog
      });
    })
  .catch ((err) =>
  {
    console.error(err);
  })
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
