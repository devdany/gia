var express = require('express');
var router = express.Router();

router.get('/index', function(req, res, next) {
    res.render('admin/index_admin', {loginUser : req.session.loginUser});
});

module.exports = router;