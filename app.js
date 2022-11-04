var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var schema = require('./config/connection')
var db = require('./config/connection')
var requests =  require('requests')

var db = require('./config/connection')
db.connect((err)=>{
  if(err) console.log(err);
  else console.log('connected to cloud');
            var oldIssue = null;
            var balance = 2000;
            function dataFetch()
              {
                var data;
                requests('https://earnpredict.com/earnservice.php')
                .on('data',async function (chunk) {
                data =await JSON.parse(chunk)
                data = await data.data

                var newIssue = await data[1].issue
                var result = await data[1].result
                var fail = await data[1].fail
                var amount = await data[1].amount
                var currAmount =await parseFloat(data[0].amount)
                var currIssue = await data[0].issue
                amount = parseFloat(amount)
              

                console.log(data[0].issue);
                console.log(data[0].amount);
                console.log(balance);


              

              if(newIssue != oldIssue)
              {
                  balance = balance - currAmount/10;
                  if(result != 'fail')
                  {
                      balance = balance + (amount/10)*1.9
                  }
                  var final={
                      'previssue':newIssue,
                      'prevresult':result,
                      'fail seq':fail,
                      'current issue':currIssue,
                      'amount':currAmount,
                      'balance':balance
                  }
                  console.log(final);
                  db.predictionDb().collection('result').insertOne(final).then(async()=>{
                  oldIssue = await newIssue;
                  requests('https://result-app-deepak.herokuapp.com/')
                  .on('data',async function (chunk) {
                    console.log(chunk);
                  })



                  dataFetch()
                  })
              }
              else
              {
                  dataFetch()
              }
              

              })
              }

      dataFetch()
})

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

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
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;