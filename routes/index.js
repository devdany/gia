var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ziaaa' });
});

router.get('/greeting', (req, res) => {
  res.render('about/greeting');
})

router.get('/vm', (req, res) => {
    res.render('about/vm');
})

router.get('/faculty', (req, res) => {
    res.render('about/faculty');
})

router.get('/location', (req, res) => {
    res.render('about/location');
})

router.get('/class/:id', (req, res) => {
  console.log(req.params.id);
    res.render('curriculum/classInfo');
})

router.get('/fee', (req, res) => {
    res.render('admissions/fee');
})

router.get('/application', (req, res) => {
    res.render('admissions/application');
})

router.get('/test', (req, res) => {
    res.render('admissions/test');
})

router.get('/notice', (req, res) => {
    res.render('notices/notice');
})

router.get('/gallery', (req, res) => {
    res.render('photos/gallery');
})

router.get('/contact', (req, res) => {
    res.render('inquiry/contact');
})

router.get('/employment', (req, res) => {
    res.render('inquiry/employment');
})


module.exports = router;
