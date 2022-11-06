
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var schema = require('./config/connection')
var db = require('./config/connection')
var requests = require('requests')

var db = require('./config/connection')
db.connect((err) => {
  if (err) console.log(err);
  else console.log('connected to cloud');

  var oldIssue = null;
  var fwBalance = 1588;
  var maxLevel = 0;
  var winStreak=0;
  var maxWinStreak=0;
  var flBalance = 1588;
  var flBetAmount = 0.1;

  function dataFetch() {
    var data;
    var date= new Date()
    requests('https://earnpredict.com/earnservice.php')
      .on('data', async function (chunk) {
        data = await JSON.parse(chunk)
        data = await data.data

        var prevIssue = await data[1].issue
        var result = await data[1].result
        var failSequence = await parseInt(data[1].fail)
        var prevAmount = await ((parseFloat(data[1].amount)) / 10).toFixed(2);
        var currAmount = await ((parseFloat(data[0].amount)) / 10).toFixed(2);
        var currIssue = await data[0].issue
        var currentPredict = await data[0].predict
        var previousPredict = await data[1].predict
        var previousResult 
        prevAmount = parseFloat(prevAmount)

        if (prevIssue != oldIssue) {

          flBalance = flBalance - flBetAmount
          if(result == 'fail')
          {
            flBalance = flBalance + flBetAmount*1.9;
            flBetAmount = 0.1;
          }
          else{
            flBetAmount = flBetAmount * 2.5
          }

          fwBalance = fwBalance - currAmount
          fwBalance = (result != 'fail' ? (fwBalance + prevAmount * 1.9) : fwBalance)
          failSequence = (failSequence > maxLevel ? maxLevel = failSequence : failSequence)

          previousResult = ((result == 'fail' && previousPredict == '0') ? 'Odd' :  (result == 'fail' && previousPredict == '1') ? 'Even' : (result != 'fail' && previousPredict == '0') ? 'Even' : 'Odd')

          // winStreak = (result != 'fail' ? winStreak+1 : 0 )
          if(result != 'fail')
          {
            winStreak++
          }else{winStreak=0}

          // maxWinStreak = (winStreak > maxWinStreak ? winStreak : maxWinStreak)

          if(winStreak > maxWinStreak){ maxWinStreak = winStreak }
          console.log(maxWinStreak+" "+winStreak)

          var final = {
            'Previous Issue ': prevIssue,
            'Previuos Bet   ': (previousPredict == '0' ? 'Even' : 'Odd'),
            'Pevious Result ': result,
            'Previous Win   ': previousResult,
            'Fail Sequence  ': failSequence,
            'Current Issue  ': currIssue,
            'Current Bet Amt': currAmount,
            'Current Bet    ': (currentPredict == '0' ? 'Even' : 'Odd'),
            'F Win Balance  ': fwBalance,
            'F Loss Balance ': flBalance,
            'Max Level -loss': parseInt(maxLevel) + 1,
            'Max Win Streak ': maxWinStreak,
          }
          var mlData = {
            "Issue" : prevIssue,
            "Win  " : previousResult
          }
          
          //var ISToffSet = 330; //IST is 5:30; i.e. 60*5+30 = 330 in minutes 
          offset= 330*60*1000;
          var ISTTime = new Date(date.getTime()+offset);
          var fullDate = ISTTime.getDate()+"-"+ISTTime.getMonth()+"-"+ISTTime.getFullYear()

          console.log(ISTTime.getDate())

          db.predictionDb().collection(fullDate+"_ML_DATA_follow_won_loc").insertOne(mlData)
          db.predictionDb().collection(fullDate+"_RW_DATA_follow_won_loc").insertOne(final).then(async () => {
            oldIssue = await prevIssue;
            requests('https://result-app-deepak.herokuapp.com/')
              .on('data', async function (chunk) {
              })
            dataFetch()
          })
        }
        else {
          dataFetch()
        }
      })
  }
  dataFetch()
})

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { fail } = require('assert');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app

