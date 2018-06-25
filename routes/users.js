var express = require('express');
var router = express.Router();
var admin = require('../db/model/Admin');
var classModel  =require('../db/model/Class');
var teacher = require('../db/model/Teachers');
var gallery = require('../db/model/Gallery');

/* GET users listing. */
router.post('/login', (req, res) => {

    classModel.findAll().then(classes => {
        teacher.findAll().then(teachers => {
            gallery.findAll({
                limit: 12,
                order: [['no', 'DESC']]
            }).then(galleryList => {
                const userId = req.body.userId;
                const passwd = req.body.password;

                admin.findOne({
                    where: {
                        id: userId,
                    }
                }).then(result => {
                    if(result === null){
                        res.render('index', {loginUser : req.session.loginUser, contents: contents, classes: classes, teachers: teachers, galleryList: galleryList, message: 'This admin ID failed verification.'});
                    }
                    else if(passwd !== result.dataValues.password){
                        res.render('index', {loginUser : req.session.loginUser, contents: contents, classes: classes, teachers: teachers, galleryList: galleryList, message: 'Password is incorrect.'});
                    }
                    else{
                        req.session.loginUser = result.dataValues;
                        res.redirect('/');
                    }
                })
            })
        })
    })



})

router.get('/logout', (req, res) => {
    req.session.loginUser = undefined;
    res.redirect('/');
})

module.exports = router;
