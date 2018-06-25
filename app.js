var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');
const classModel = require('./db/model/Class');
const teachers = require('./db/model/Teachers');
const gallery = require('./db/model/Gallery');
const admin = require('./db/model/Admin');
const notice = require('./db/model/Notice');
const schedule = require('./db/model/Schedule');
const message = require('./db/model/Message');

const dbConnector = require('./db/Connector');
dbConnector.authenticate()
    .then(() => {
        console.log('Connection Success');
    })
    .catch(err => {
        console.log(err);
    })

var indexRouter = require('./routes/index');
var userRouter = require('./routes/users');
var adminRouter = require('./routes/admin');


classModel.sync({force: false});
teachers.sync({force: false});
gallery.sync({force: false});
admin.sync({force: false});
notice.sync({force: false});
schedule.sync({force: false});
message.sync({force: false});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'gia!636',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false}
}))


//router
app.use('/', indexRouter);
app.use('/user' , userRouter);
app.use('/admin', adminRouter);



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
