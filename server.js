require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bot = require('./bot')

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.set('views', './public')
app.set('view engine', 'pug')

const difficulties = {
  'easy': [7, 5],
  'normal': [7, 5],
  'hard': [9, 6],
}

app.get('/', function (req, res) {
  const { mode } = req.query;
  const [height, width] = difficulties[mode] || difficulties.easy
  res.render('index', { height, width })
});

var server = app.listen(process.env.PORT, "0.0.0.0", () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Web server started at http://%s:%s', host, port);
});

app.post('/' + bot.token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});
