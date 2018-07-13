const express = require('express');
const router = express.Router();
const contents = require('../lib/contents');
const loginRequired = require('../lib/loginRequired');
const multer = require('multer');
const path = require('path');
const uploadDir = path.join(__dirname, '../public/img');
const deleteDir = path.join(__dirname, '../public');
const fs = require('fs');
const teacher = require('../db/model/Teachers');
const classModel = require('../db/model/Class');
const message = require('../db/model/Message');
const schedule = require('../db/model/Schedule');
const copyFile = require('fs-copy-file');
const Sequelize = require('sequelize');
const notice = require('../db/model/Notice');
const gallery = require('../db/model/Gallery');
var dateformat = require('../lib/DateFormatConverter');
var paginate = require('express-paginate');


var noticestorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDir);
    },
    filename: (req, file, callback) => {
        callback(null, 'notice-' + Date.now() + '.' + file.mimetype.split('/')[1]);
    }
});

var noticeupload = multer({storage: noticestorage});

const op = Sequelize.Op

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

function imgPathConverter(path) {
    var temp = path.split('public');

    return temp[1];
}


router.get('/index', loginRequired, function (req, res, next) {

    res.render('admin/index_admin', {loginUser: req.session.loginUser, contents: contents});
});

router.get('/greeting',loginRequired, (req, res) => {
    res.render('admin/greeting_admin', {loginUser: req.session.loginUser, contents: contents});
})

router.get('/vm', loginRequired,(req, res) => {
    res.render('admin/vm_admin', {loginUser: req.session.loginUser, contents: contents});
})

router.get('/registerClass',loginRequired, (req, res) => {
    teacher.findAll().then(teachers => {
        res.render('admin/register_class', {loginUser: req.session.loginUser, contents: contents, teachers: teachers});
    })
})

router.get('/registerTeacher',loginRequired, (req, res) => {
    res.render('admin/register_teacher', {loginUser: req.session.loginUser})
})

router.get('/classList',loginRequired, (req, res) => {
    classModel.findAll().then(classList => {
        res.render('admin/classList_admin', {loginUser: req.session.loginUser, classList: classList})
    })
})


router.get('/teacherList',loginRequired, (req, res) => {
    teacher.findAll().then(teachers => {
        console.log(teachers);
        res.render('admin/teacherList_admin', {loginUser: req.session.loginUser, teachers: teachers})
    })
})

router.get('/teacherInfo/:id', loginRequired,(req, res) => {
    teacher.findOne({
        where: {
            no: req.params.id
        }
    }).then(teacher => {
        classModel.findAll({
            where: {
                [op.or]: [{mainTeacher: req.params.id}, {subTeacher: req.params.id}]
            }
        }).then(myClass => {
            const exList = teacher.dataValues.experience.split('/');
            res.render('admin/teacherInfo_admin.ejs', {
                loginUser: req.session.loginUser,
                teacher: teacher,
                myClass: myClass,
                exList: exList
            })
        })
    })

})

router.get('/updateTeacher/:id',loginRequired, (req, res) => {
    teacher.findOne({
        where: {
            no: req.params.id
        }
    }).then(teacher => {
        const exList = teacher.dataValues.experience.split('/');
        console.log(exList);
        res.render('admin/update_teacher.ejs', {loginUser: req.session.loginUser, teacher: teacher, exList: exList});
    })
})

router.post('/updateTeacher', loginRequired, (req, res) => {
    if (req.body.isUpload === 'false') {
        teacher.update({
            name: req.body.name,
            degree: req.body.degree,
            experience: req.body.experience,
            tel: req.body.tel,
            email: req.body.email,
            intro: req.body.introduce,
            role: req.body.role
        }, {
            where: {
                no: req.body.no
            }
        }).then(() => {
            res.send('success');
        }).catch((err) => {
            res.send(err);
        })
    } else {
        const profileImg = uploadDir + '/teachers/' + req.body.name + '_' + new Date().dateformat() + '.png';

        teacher.findOne({
            where: {
                no: req.body.no
            }
        }).then(teacherInfo => {
            fs.rename(uploadDir + '/' + req.session.loginUser.id, profileImg, function (err) {
                if (err) {
                    throw err;
                } else {
                    teacher.update({
                        name: req.body.name,
                        picture: imgPathConverter(profileImg),
                        degree: req.body.degree,
                        experience: req.body.experience,
                        tel: req.body.tel,
                        email: req.body.email,
                        intro: req.body.introduce,
                        role: req.body.role
                    }, {
                        where: {
                            no: req.body.no
                        }
                    }).then(() => {
                        var temp = teacherInfo.picture.split("img/");
                        var filename = temp[1];

                        fs.unlink(uploadDir + '/' + filename, (error) => {
                            res.send('success');
                        })
                    }).catch(err => {
                        console.log(err);
                        res.send(err);
                    })
                }
            });
        })
    }
})

router.post('/deleteTeacher/', loginRequired ,(req, res) => {
    teacher.destroy({
        where: {
            no: req.body.no
        }
    }).then(() => {
        res.send('success');
    })
})

router.get('/classInfo/:id', loginRequired, (req, res) => {

    classModel.findOne({
        where: {
            no: req.params.id
        }
    }).then(classInfo => {
        teacher.findOne({
            where: {
                no: classInfo.mainTeacher
            }
        }).then(mainTeacher => {
            teacher.findOne({
                where: {
                    no: classInfo.subTeacher
                }
            }).then(subTeacher => {
                res.render('admin/classInfo_admin', {
                    loginUser: req.session.loginUser,
                    classInfo: classInfo,
                    outcomes: classInfo.outcomes.split(','),
                    mainTeacher: mainTeacher,
                    subTeacher: subTeacher
                })
            })
        })

    })
})

router.get('/updateClass/:id', loginRequired, (req, res) => {
    classModel.findOne({
        where: {
            no: req.params.id
        }
    }).then(classInfo => {
        teacher.findAll().then(teachers => {
            res.render('admin/update_class', {
                loginUser: req.session.loginUser,
                classInfo: classInfo,
                outcomes: classInfo.outcomes.split(','),
                teachers: teachers
            })
        })
    })
})

router.get('/fee', loginRequired, (req, res) => {
    res.render('admin/fee_admin')
})

router.get('/application', loginRequired, (req, res) => {
    res.render('admin/application_admin')
})

router.get('/employment', loginRequired, (req, res) => {
    res.render('admin/employment_admin')
})

router.post('/updateClass', loginRequired, (req, res) => {
    if (req.body.isUpload === 'false') {
        classModel.update({
            name: req.body.title,
            target: req.body.target,
            fee: req.body.fee,
            mainTeacher: req.body.mainTeacher,
            description: req.body.description,
            total: req.body.total,
            startDate: req.body.startDate,
            outcomes: req.body.outcomes,
            subTeacher: req.body.subTeacher
        }, {
            where: {
                no: req.body.no
            }
        }).then(() => {
            res.send('success');
        }).catch((err) => {
            res.send(err);
        })
        //이미지가 수정된 경우
    } else {
        const profileImg = uploadDir + '/classes/' + req.body.title + '_' + new Date().dateformat() + '.png';

        classModel.findOne({
            where: {
                no: req.body.no
            }
        }).then(classInfo => {
            fs.rename(uploadDir + '/' + req.session.loginUser.id, profileImg, function (err) {
                if (err) {
                    throw err;
                } else {
                    classModel.update({
                        name: req.body.title,
                        target: req.body.target,
                        fee: req.body.fee,
                        mainTeacher: req.body.mainTeacher,
                        description: req.body.description,
                        total: req.body.total,
                        startDate: req.body.startDate,
                        outcomes: req.body.outcomes,
                        picture: imgPathConverter(profileImg),
                        subTeacher: req.body.subTeacher
                    }, {
                        where: {
                            no: req.body.no
                        }
                    }).then(() => {
                        var temp = classInfo.picture.split("img/");
                        var filename = temp[1];
                        fs.unlink(uploadDir + '/' + filename, (error) => {
                            res.send('success');
                        })
                    }).catch(err => {
                        console.log(err);
                        res.send(err);
                    })
                }
            });
        })
    }
})

router.post('/deleteClass', loginRequired, (req, res) => {
    classModel.destroy({
        where: {
            no: req.body.no
        }
    }).then(() => {
        res.send('success');
    })
})

router.post('/registerTeacher', loginRequired, (req, res) => {

    const profileImg = uploadDir + '/teachers/' + req.body.name + '_' + new Date().dateformat() + '.png';

    fs.stat(uploadDir + '/' + req.session.loginUser.id, function (error, stat) {
        if (error === null) {
            fs.rename(uploadDir + '/' + req.session.loginUser.id, profileImg, function (err) {
                if (err) {
                    throw err;
                } else {
                    teacher.create({
                        name: req.body.name,
                        picture: imgPathConverter(profileImg),
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
        } else {
            copyFile(uploadDir + '/teachers/init.png', profileImg, (err) => {
                if (err) {
                    throw err;
                } else {
                    teacher.create({
                        name: req.body.name,
                        picture: imgPathConverter(profileImg),
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

router.post('/registerClass', loginRequired, (req, res) => {
    const profileImg = uploadDir + '/classes/' + req.body.title + '_' + new Date().dateformat() + '.png';
    fs.stat(uploadDir + '/' + req.session.loginUser.id, function (error, stat) {
        if (error === null) {
            fs.rename(uploadDir + '/' + req.session.loginUser.id, profileImg, function (err) {
                if (err) {
                    throw err;
                } else {
                    classModel.create({
                        name: req.body.title,
                        target: req.body.target,
                        fee: req.body.fee,
                        mainTeacher: req.body.mainTeacher,
                        description: req.body.description,
                        total: req.body.total,
                        startDate: req.body.startDate,
                        outcomes: req.body.outcomes,
                        picture: imgPathConverter(profileImg),
                        subTeacher: req.body.subTeacher
                    }).then(() => {
                        res.send('success');
                    })
                }
            });
        } else {
            copyFile(uploadDir + '/classes/init.png', profileImg, (err) => {
                if (err) {
                    throw err;
                } else {
                    classModel.create({
                        name: req.body.title,
                        target: req.body.target,
                        fee: req.body.fee,
                        mainTeacher: req.body.mainTeacher,
                        description: req.body.description,
                        total: req.body.total,
                        startDate: req.body.startDate,
                        outcomes: req.body.outcomes,
                        picture: imgPathConverter(profileImg),
                        subTeacher: req.body.subTeacher
                    }).then(() => {
                        res.send('success');
                    })
                }
            })
        }
    })
})

router.post('/update', loginRequired, (req, res) => {

    contents[req.body.target].title = req.body.title;
    contents[req.body.target].text = req.body.content;

    if (contents[req.body.target].skill) {
        contents[req.body.target].skill.skill1 = req.body.skill1 + '%';
        contents[req.body.target].skill.skill2 = req.body.skill2 + '%';
        contents[req.body.target].skill.skill3 = req.body.skill3 + '%';
        contents[req.body.target].skill.skill4 = req.body.skill4 + '%';
        contents[req.body.target].skill.skill5 = req.body.skill5 + '%';
        contents[req.body.target].skill.skill6 = req.body.skill6 + '%';
        contents[req.body.target].skill.skill7 = req.body.skill7 + '%';
        contents[req.body.target].skill.skill8 = req.body.skill8 + '%';
    }

    res.send('success');
})

router.get('/schedule', loginRequired, (req, res) => {
    classModel.findAll().then(classes => {
        teacher.findAll().then(teacher => {
            schedule.findAll().then(schedules => {
                console.log('?');
                res.render('admin/register_schedule.ejs', {
                    loginUser: req.session.loginUser,
                    contents: contents,
                    classes: classes,
                    teachers: teacher,
                    schedules: schedules
                })

            })
        })
    })

})

router.post('/addSchedule', loginRequired, (req, res) => {
    if (req.body.teacher === '' || req.body.classname === '') {
        res.send('select teacher & class')
    } else {
        schedule.create({
            code: req.body.code,
            teacher: req.body.teacher,
            classname: req.body.classname,
            teacher2: req.body.teacher2
        }).then(result => {
            res.send({message: 'success', no: result.no});
        }).catch(err => {
            res.send(err);
        })
    }
})

router.post('/deleteSchedule', loginRequired, (req, res) => {
    schedule.destroy({
        where: {
            no: req.body.no
        }
    }).then(() => {
        res.send('success');
    }).catch(err => {
        res.send(err);
    })

})

var pageInfo = {
    limit : 10,
    pageNum : 5
}

router.get('/notice',paginate.middleware(pageInfo.limit, 50),loginRequired, async (req, res) => {

    var start = ((req.query.page-1) * pageInfo.limit);


    const [result, noticeCount] = await Promise.all([
        notice.findAll({
            limit:req.query.limit,
            offset: start,
            order: [['no', 'DESC']]
        }),
        notice.count()
    ]);

    const pageCount = Math.ceil(noticeCount / req.query.limit);
    const pages = paginate.getArrayPages(req)(pageInfo.pageNum, pageCount, req.query.page);

    if(req.query.page > pageCount  && pageCount !==0 ){
        res.redirect('/admin/notice?page='+pageCount+'&limit='+pageInfo.limit)
    }

    await Promise.all(result.map(value => {
        value.dataValues.date = dateformat('yyyy-mm-dd', value.dataValues.date);
    })).then(() => {
        res.render('admin/notice_admin', {loginUser: req.session.loginUser, noticeList: result, pages:pages, pageCount:pageCount, noticeCount:noticeCount});
    })

})

router.get('/writeNotice', loginRequired, (req, res) => {

    res.render('admin/write_admin', {loginUser: req.session.loginUser});

})

router.get('/notice/detail/:id', loginRequired, (req, res) => {
    var id = req.params.id;

    notice.findOne({
        where: {
            no: id
        }
    }).then(result => {
        res.render('admin/notice_detail_admin', {
            loginUser: req.session.loginUser,
            notice: result
        })
    })

})

router.get('/notice/edit/:id', loginRequired, (req, res) => {
    var id = req.params.id;

    notice.findOne({
        where: {
            no: id
        }
    }).then(result => {
        res.render('admin/edit_admin', {
            loginUser: req.session.loginUser,
            notice: result
        })
    })
})

router.get('/notice/delete/:id', loginRequired, (req, res) => {
    var id = req.params.id;

    notice.destroy({
        where:{
            no: id
        }
    }).then(() => {
        res.redirect('/admin/notice');
    })
})



var galleryPageInfo = {
    limit : 12,
    pageNum : 5
}

router.get('/gallery',paginate.middleware(galleryPageInfo.limit, 50), loginRequired, async (req, res) => {
    var start = ((req.query.page-1) * pageInfo.limit);

    const [result, galleryCount] = await Promise.all([
        gallery.findAll({
            order: [['no', 'DESC']],
            limit:req.query.limit,
            offset: start
        }),
        gallery.count()
    ]);

    const pageCount = Math.ceil(galleryCount / req.query.limit);
    const pages = paginate.getArrayPages(req)(galleryPageInfo.pageNum, pageCount, req.query.page);

    if(req.query.page > pageCount  && pageCount !==0 ){
        res.redirect('/admin/gallery?page='+pageCount+'&limit='+galleryPageInfo.limit)
    }

    res.render('admin/gallery_admin', {loginUser: req.session.loginUser, galleryList: result, pages:pages, pageCount:pageCount});
})

router.get('/popup', loginRequired, (req, res) => {

    res.render('admin/popup_admin');
})

router.post('/deletePopup', loginRequired, (req, res) => {
    fs.stat(uploadDir + '/' + 'popup.png', (error, stat) => {
        //파일이 없는경우
        if (error !== null) {
            return 'No pop-up to delete!';
        }else{
            fs.unlink(uploadDir + '/' + 'popup.png', (error) => {
                if(error){
                    throw error;
                }else{
                    return 'success';
                }
            })
        }
    })
})

router.post('/editNotice/:id', loginRequired, (req, res) => {
    notice.update({
        title: req.body.title,
        writer: req.session.loginUser.id,
        content: req.body.content,
        date: new Date().dateformat()
    },{
        where:{
            no: req.params.id
        }
    }).then(result => {
        res.send({message: 'success', no: result.no})
    })
})

router.post('/writeNotice', loginRequired, (req, res) => {
    notice.create({
        title: req.body.title,
        writer: req.session.loginUser.id,
        content: req.body.content,
        date: new Date().dateformat()
    }).then(result => {
        res.send({message: 'success', no: result.no})
    })
})

router.post('/notice/ajax_summernote', noticeupload.single('noticeImg'), function (req, res) {
    res.send('/img/' + req.file.filename);
});

//갤러리 파일 임시보관 초기화
router.post('/initGalleryTemp', (req, res) => {
    const gallerytemps = fs.readdirSync(uploadDir+'/gallerytemp');

    for(let i = 0; i<gallerytemps.length; i++){
        fs.unlink(uploadDir + '/gallerytemp/' + gallerytemps[i], (error) => {
            if(error){
                throw error
            }
        })
    }

    res.send('success');

})

router.post('/addGallery', loginRequired ,(req, res) => {
    const gallerytemps = fs.readdirSync(uploadDir+'/gallerytemp');

    for(let i = 0; i<gallerytemps.length; i++){
        fs.rename(uploadDir + '/gallerytemp/' + gallerytemps[i], uploadDir + '/gallery/' + gallerytemps[i], function (err) {
            if(err){
                throw err;
            }else{
                gallery.create({
                    img: imgPathConverter(uploadDir + '/gallery/' + gallerytemps[i]),
                    date: new Date().dateformat(),
                    category:req.body.category,
                    comment:req.body.comment
                })
            }
        })
    }

    res.send('success');
})

router.post('/deleteGallery', loginRequired, (req, res) => {
    var no = req.body.no;

    gallery.findOne({
        where:{
            no:no
        }
    }).then(result => {
        fs.unlink(deleteDir+result.img, (error) => {
            if(error){
                res.send(error);
            } else{
                gallery.destroy({
                    where:{
                        no:no
                    }
                }).then(() => {
                    res.send('success');
                }).catch(err => {
                    res.send(err);
                })
            }
        })
    })
})

router.get('/message',paginate.middleware(pageInfo.limit, 50), loginRequired, async (req, res) => {
    var start = ((req.query.page-1) * pageInfo.limit);

    const [result, messageCount] = await Promise.all([
        message.findAll({
            limit:req.query.limit,
            offset: start,
            order: [['no', 'DESC']]
        }),
        message.count()
    ]);


    const pageCount = Math.ceil(messageCount / req.query.limit);
    const pages = paginate.getArrayPages(req)(pageInfo.pageNum, pageCount, req.query.page);

    if(req.query.page > pageCount  && pageCount !==0){
        res.redirect('/admin/message?page='+pageCount+'&limit='+pageInfo.limit)
    }

    res.render('admin/message_admin', {loginUser: req.session.loginUser, messageList: result, pages:pages, pageCount:pageCount, messageCount:messageCount});

})

router.get('/message/detail/:id', loginRequired, (req, res) => {
    message.findOne({
        where: {
            no: req.params.id
        }
    }).then(message => {
        res.render('admin/message_detail_admin', {loginUser: req.session.loginUser, messagede: message});
    })
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
        if (err) {
            res.end('fail');
        } else {
            const filename = contents[req.body.target].img;
            fs.stat(uploadDir + '/' + filename, function (error, stat) {
                if (error === null) {
                    //파일이 있는 경우 타겟파일 삭제후
                    fs.unlink(uploadDir + '/' + filename, (error) => {
                        if (error) {
                            throw error;
                        } else {
                           //임시저장의 경우
                            if (filename.includes('register.png')) {
                                res.end(req.body.target + ',' + tempFileName);

                            //갤러리의 경우
                            } else if(filename === 'gallerys_img'){
                                fs.rename(uploadDir + '/' + tempFileName, uploadDir + '/gallerytemp/' + 'gallery-' + new Date().dateformat()+'-'+ Math.random()*10)
                                res.end('success');
                            //콘텐츠의 경우
                            } else {
                                //저장한 파일 타겟파일명으로 수정
                                fs.rename(uploadDir + '/' + tempFileName, uploadDir + '/' + filename, function (err) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        res.end(req.body.target + ',' + filename);
                                    }
                                });
                            }
                        }
                    })
                } else {
                    //파일이 없는 경우 그냥 수정

                    if (filename.includes('register.png')) {
                        //임시저장인 경우
                        res.end(req.body.target + ',' + tempFileName);

                        //gallery의 경우
                    } else if(filename === 'gallerys_img'){
                        fs.rename(uploadDir + '/' + tempFileName, uploadDir + '/gallerytemp/' + 'gallery-' + new Date().dateformat()+'-'+ Math.random()*10)
                        res.end('success');
                        //콘텐츠 이미지인경우
                    } else {
                        //저장한 파일 타겟파일명으로 수정
                        fs.rename(uploadDir + '/' + tempFileName, uploadDir + '/' + filename, function (err) {
                            if (err) {
                                throw err;
                            } else {
                                res.end(req.body.target + ',' + filename);
                            }
                        });
                    }
                }
            })
        }

    });
})


module.exports = router;