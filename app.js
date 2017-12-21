var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('logger').createLogger();

app.set('port', process.env.PORT || '3000');

// Create link to Angular build directory
app.use(express.static(__dirname + "/dist/"));

app.use('/', require('./routes/routes'));

//app.use(logger.info('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended': 'false'}));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

// render the error page
  res.status(err.status || 500);
  res.send('error ' + err.status);
});

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
