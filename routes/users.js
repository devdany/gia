var express = require('express');
var router = express.Router();
var admin = require('../db/model/Admin');

/* GET users listing. */
router.post('/login', (req, res) => {
    const userId = req.body.userId;
    const passwd = req.body.password;

    admin.findOne({
        where: {
            id: userId,
        }
    }).then(result => {
        if(result === null){
            res.render('index', {message : 'This admin ID failed verification.'})
        }
        else if(passwd !== result.dataValues.password){
            res.render('index', {message : 'Password is incorrect.'})
        }

        else{
            req.session.loginUser = result.dataValues;
            res.redirect('/');
        }
    })

})

router.get('/logout', (req, res) => {
    req.session.loginUser = undefined;
    res.redirect('/');
})

module.exports = router;
