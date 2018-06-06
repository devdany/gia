var express = require('express');
var router = express.Router();
var notice = require('../db/model/Notice');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {loginUser : req.session.loginUser});
});

router.get('/greeting', (req, res) => {
  res.render('about/greeting', {loginUser : req.session.loginUser});
})

router.get('/vm', (req, res) => {
    res.render('about/vm', {loginUser : req.session.loginUser});
})

router.get('/faculty', (req, res) => {
    res.render('about/faculty', {loginUser : req.session.loginUser});
})

router.get('/location', (req, res) => {
    res.render('about/location', {loginUser : req.session.loginUser});
})

router.get('/class/:id', (req, res) => {
  console.log(req.params.id);
    res.render('curriculum/classInfo', {loginUser : req.session.loginUser});
})

router.get('/fee', (req, res) => {
    res.render('admissions/fee', {loginUser : req.session.loginUser});
})

router.get('/application', (req, res) => {
    res.render('admissions/application', {loginUser : req.session.loginUser});
})

router.get('/test', (req, res) => {
    res.render('admissions/test', {loginUser : req.session.loginUser});
})

router.get('/notice', (req, res) => {
    notice.findAll().then(result => {
        res.render('notices/notice', {loginUser : req.session.loginUser, noticeList: result});
    })

})

router.get('/gallery', (req, res) => {
    res.render('photos/gallery', {loginUser : req.session.loginUser});
})

router.get('/contact', (req, res) => {
    res.render('inquiry/contact', {loginUser : req.session.loginUser});
})

router.get('/employment', (req, res) => {
    res.render('inquiry/employment', {loginUser : req.session.loginUser});
})


module.exports = router;
