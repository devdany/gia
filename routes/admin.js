const express = require('express');
const router = express.Router();
const contents = require('../lib/contents');
const loginRequired = require('../lib/loginRequired');
const multer = require('multer');
const path = require('path');
const uploadDir = path.join(__dirname, '../public/img');
const fs = require('fs');
const teacher = require('../db/model/Teachers');
const classModel = require('../db/model/Class');
const copyFile = require('fs-copy-file');

Date.prototype.dateformat = function () {
    var yyyy = this.getFullYear().toString();
    var MM = pad(this.getMonth() + 1, 2);
    var dd = pad(this.getDate(), 2);
    var hh = pad(this.getHours(), 2);
    var mm = pad(this.getMinutes(), 2)
    var ss = pad(this.getSeconds(), 2)

    return yyyy + MM + dd + hh + mm + ss;
};

function pad(number, length) {

    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

}


router.get('/index', /*loginRequired,*/ function(req, res, next) {
    res.render('admin/index_admin', {loginUser : req.session.loginUser, contents: contents});
});

router.get('/greeting', (req, res) => {
    res.render('admin/greeting_admin', {loginUser : req.session.loginUser, contents: contents});
})

router.get('/vm', (req, res) => {
    res.render('admin/vm_admin', {loginUser : req.session.loginUser, contents: contents});
})

router.get('/registerClass', (req, res) => {
    teacher.findAll().then(teachers => {
        res.render('admin/classInfo_admin', {loginUser : req.session.loginUser, contents: contents, teachers:teachers});
    })
})

router.get('/registerTeacher', (req, res) => {
    res.render('admin/register_teacher')
})

router.post('/registerTeacher', (req, res) => {

    const profileImg = uploadDir+'/teachers/'+req.body.name+'_'+new Date().dateformat()+'.png';

    fs.stat(uploadDir+'/'+req.session.loginUser.id, function(error, stat){
        if(error === null) {
            fs.rename(uploadDir+'/'+req.session.loginUser.id, profileImg, function (err) {
                if (err) {
                    throw err;
                } else{
                    teacher.create({
                        name: req.body.name,
                        picture: profileImg,
                        degree: req.body.degree,
                        experience: req.body.experience,
                        tel: req.body.tel,
                        email: req.body.email,
                        intro: req.body.introduce,
                        role: req.body.role
                    }).then(() => {
                        res.send('success');
                    })
                }
            });
        }else{
            copyFile(uploadDir+'/teachers/init.png', profileImg, (err) => {
                if (err){
                    throw err;
                }else{
                    teacher.create({
                        name: req.body.name,
                        picture: profileImg,
                        degree: req.body.degree,
                        experience: req.body.experience,
                        tel: req.body.tel,
                        email: req.body.email,
                        intro: req.body.introduce,
                        role: req.body.role
                    }).then(() => {
                        res.send('success');
                    })
                }
            })
        }
    })
})

router.post('/registerClass', (req, res) => {
    const profileImg = uploadDir+'/classes/'+req.body.title+'_'+new Date().dateformat()+'.png';
    fs.stat(uploadDir+'/'+req.session.loginUser.id, function(error, stat){
        if(error === null) {
            fs.rename(uploadDir+'/'+req.session.loginUser.id, profileImg, function (err) {
                if (err) {
                    throw err;
                } else{
                    classModel.create({
                        name: req.body.title,
                        target: req.body.target,
                        fee: req.body.fee,
                        mainTeacher: req.body.mainTeacher,
                        description: req.body.description,
                        total: req.body.total,
                        startDate: req.body.startDate,
                        outcomes: req.body.outcomes,
                        picture: profileImg,
                        subTeacher: req.body.subTeacher
                    }).then(() => {
                        res.send('success');
                    })
                }
            });
        }else{
            copyFile(uploadDir+'/classes/init.png', profileImg, (err) => {
                if (err){
                    throw err;
                }else{
                    classModel.create({
                        name: req.body.title,
                        target: req.body.target,
                        fee: req.body.fee,
                        mainTeacher: req.body.mainTeacher,
                        description: req.body.description,
                        total: req.body.total,
                        startDate: req.body.startDate,
                        outcomes: req.body.outcomes,
                        picture: profileImg,
                        subTeacher: req.body.subTeacher
                    }).then(() => {
                        res.send('success');
                    })
                }
            })
        }
    })
})


router.post('/update', (req, res) => {

    contents[req.body.target].title = req.body.title;
    contents[req.body.target].text = req.body.content;

    if(contents[req.body.target].skill){
        contents[req.body.target].skill.skill1 = req.body.skill1+'%';
        contents[req.body.target].skill.skill2 = req.body.skill2+'%';
        contents[req.body.target].skill.skill3 = req.body.skill3+'%';
        contents[req.body.target].skill.skill4 = req.body.skill4+'%';
        contents[req.body.target].skill.skill5 = req.body.skill5+'%';
        contents[req.body.target].skill.skill6 = req.body.skill6+'%';
        contents[req.body.target].skill.skill7 = req.body.skill7+'%';
        contents[req.body.target].skill.skill8 = req.body.skill8+'%';
    }

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
                            //콘텐츠 이미지인 경우
                            if(!filename.includes('register.png')){
                                //저장한 파일 타겟파일명으로 수정
                                fs.rename(uploadDir+'/'+tempFileName, uploadDir+'/'+filename, function (err) {
                                    if (err) {
                                        throw err;
                                    } else{
                                        res.end(req.body.target+','+filename);
                                    }
                                });

                            }else{
                                //임시저장인 경우
                                res.end(req.body.target+','+tempFileName);
                            }


                        }
                    })
                }else {
                    //파일이 없는 경우 그냥 수정

                    //콘텐츠 이미지인경우
                    if(!filename.includes('register.png')){
                        //저장한 파일 타겟파일명으로 수정
                        fs.rename(uploadDir+'/'+tempFileName, uploadDir+'/'+filename, function (err) {
                            if (err) {
                                throw err;
                            } else{
                                res.end(req.body.target+','+filename);
                            }
                        });

                    }else{
                        //임시저장인 경우
                        res.end(req.body.target+','+tempFileName);
                    }
                }
            })
        }

    });
})


module.exports = router;