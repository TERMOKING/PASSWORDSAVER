var express = require('express');
var requests =  require('requests')
var router = express.Router();
var schema = require('../config/connection')
var db = require('../config/connection')



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
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


              if(balance < 1)
              {
                  return;
              }

              if(newIssue != oldIssue)
              {
                  balance = balance - currAmount
                  if(result != 'fail')
                  {
                      balance = balance + amount*1.9
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
    console.log('hii');
});

module.exports = router;
