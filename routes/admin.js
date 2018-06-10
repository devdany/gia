var express = require('express');
var router = express.Router();
const contents = require('../lib/contents');
const loginRequired = require('../lib/loginRequired');
const multer = require('multer');
var path = require('path');
var uploadDir = path.join(__dirname, '../public/img');
var fs = require('fs');


router.get('/index', loginRequired, function(req, res, next) {
    res.render('admin/index_admin', {loginUser : req.session.loginUser, contents: contents});
});

router.post('/update', loginRequired, (req, res) => {

    contents[req.body.target].title = req.body.title;
    contents[req.body.target].text = req.body.content;

    res.send('success');
})

router.post('/uploadImg', loginRequired, (req, res) => {

    //중복되지 않게 세션자 아이디로 파일명 저장 후
    var tempFileName = req.session.loginUser.id;
    var storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, uploadDir);
        },
        filename: (req, file, callback) => {
            callback(null, tempFileName);
        }
    });

    var upload = multer({storage: storage}).array('photo', 5);


    upload(req, res, (err) => {
        if(err){
            res.end('fail');
        }else{
            const filename = contents[req.body.target].img;

            fs.stat(uploadDir+'/'+filename, function(error, stat){
                if(error === null) {
                    //파일이 있는 경우 타겟파일 삭제후
                    fs.unlink(uploadDir+'/'+filename, (error) => {
                        if (error) {
                            throw error;
                        }else{
                            //저장한 파일 타겟파일명으로 수정
                            fs.rename(uploadDir+'/'+tempFileName, uploadDir+'/'+filename, function (err) {
                                if (err) {
                                    throw err;
                                } else{
                                    res.end('success');
                                }
                            });
                        }
                    })
                }else {
                    //파일이 없는 경우 그냥 수정
                    fs.rename(uploadDir+'/'+tempFileName, uploadDir+'/'+filename,  (err) => {
                        if (err) {
                            throw err;
                        } else{
                            res.end('success');
                        }
                    });
                }
            })
        }

    });
})


module.exports = router;