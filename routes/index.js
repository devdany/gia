var express = require('express');
var router = express.Router();
var notice = require('../db/model/Notice');
var dateformat = require('../lib/DateFormatConverter');
var contents = require('../lib/contents');
var teacher = require('../db/model/Teachers');
const classModel = require('../db/model/Class');
const schedule = require('../db/model/Schedule');
const gallery = require('../db/model/Gallery');
const message = require('../db/model/Message');
const path = require('path');
const fs = require('fs');
const uploadDir = path.join(__dirname, '../public/img');
var paginate = require('express-paginate');
const refdir = path.join(__dirname, '../public/ref');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/* GET home page. */


router.get('/', (req, res) => {
    classModel.findAll({order:[['no','ASC']]}).then(classes => {
        teacher.findAll().then(teachers => {
            Promise.all(teachers.map(async val => {
                const exList = val.dataValues.experience.split('/');
                val.exList = exList;
            })).then(() => {
                gallery.aggregate('category', 'DISTINCT', {plain: false}).then(categories => {
                    gallery.findAll({
                        limit: 12,
                        order: [['no', 'DESC']]
                    }).then(async galleryList => {
                        let totals = 0;
                        await Promise.all(classes.map(value => {
                            totals += parseInt(value.total);
                        })).then(() => {
                            let isPopup;
                            fs.stat(uploadDir + '/' + 'popup.png', (error, stat) => {
                                //파일이 있는경우
                                if(error === null){
                                    isPopup = true;
                                    //없는 경우
                                }else{
                                    isPopup = false;
                                }

                                res.render('index', {
                                    loginUser: req.session.loginUser,
                                    contents: contents,
                                    classes: classes,
                                    teachers: teachers,
                                    galleryList: galleryList,
                                    totals: totals,
                                    categories: categories,
                                    isPopup : isPopup
                                });
                            })
                        })
                    })
                })
            })
        })
    })
});

router.get('/greeting', (req, res) => {
    classModel.findAll({order:[['no','ASC']]}).then(classes => {
        teacher.findAll().then(teachers => {
            res.render('about/greeting', {
                loginUser: req.session.loginUser,
                contents: contents,
                classes: classes,
                teachers: teachers
            });
        })
    })
})

router.get('/vm', (req, res) => {
    classModel.findAll({order:[['no','ASC']]}).then(classes => {
        res.render('about/vm', {loginUser: req.session.loginUser, classes: classes});
    })

})

router.get('/faculty', (req, res) => {
    classModel.findAll({order:[['no','ASC']]}).then(classes => {
        teacher.findAll().then(teachers => {
            res.render('about/faculty', {loginUser: req.session.loginUser, teachers: teachers, classes: classes});
        })
    })

})

router.get('/teacherInfo/:id', (req, res) => {
    classModel.findAll({order:[['no','ASC']]}).then(classes => {
        teacher.findOne({
            where: {
                no: req.params.id
            }
        }).then(result => {
            classModel.findAll({
                where: {
                    [Op.or]: [{mainTeacher: result.no}, {subTeacher: result.no}]
                }
            }).then(myClasses => {
                const exList = result.dataValues.experience.split('/');

                res.render('about/teacherInfo', {
                    loginUser: req.session.loginUser,
                    teacher: result,
                    classes: classes,
                    myClasses: myClasses,
                    exList: exList
                })
            })
        })
    })
})

router.get('/classInfo/:id', (req, res) => {
    classModel.findAll({order:[['no','ASC']]}).then(classes => {
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
                    schedule.findAll({
                        where: {
                            classname: classInfo.name
                        }
                    }).then(schedules => {
                        res.render('curriculum/classInfo', {
                            loginUser: req.session.loginUser,
                            classInfo: classInfo,
                            outcomes: classInfo.outcomes.split(','),
                            mainTeacher: mainTeacher,
                            subTeacher: subTeacher,
                            classes: classes,
                            schedules: schedules
                        })
                    })
                })
            })

        })
    })
})

router.get('/fee', (req, res) => {
    classModel.findAll({order:[['no','ASC']]}).then(classes => {
        res.render('admissions/fee', {loginUser: req.session.loginUser, classes: classes});
    })

})

router.get('/application', (req, res) => {
    classModel.findAll({order:[['no','ASC']]}).then(classes => {
        res.render('admissions/application', {loginUser: req.session.loginUser, classes: classes});
    })
})

router.get('/downloadApplication', (req, res) => {
    const applicationFile = refdir + '/application.pdf';
    res.download(applicationFile);
})

router.get('/test', (req, res) => {
    classModel.findAll({order:[['no','ASC']]}).then(classes => {
        res.render('admissions/test', {loginUser: req.session.loginUser, classes: classes});
    })
})

var pageInfo = {
    limit: 10,
    pageNum: 5
}

router.get('/notice', paginate.middleware(pageInfo.limit, 50), (req, res) => {
    classModel.findAll({order:[['no','ASC']]}).then(async classes => {
        var start = ((req.query.page - 1) * pageInfo.limit);

        const [result, noticeCount] = await Promise.all([
            notice.findAll({
                limit: req.query.limit,
                offset: start,
                order: [['no', 'DESC']]
            }),
            notice.count()
        ]);

        const pageCount = Math.ceil(noticeCount / req.query.limit);
        const pages = paginate.getArrayPages(req)(pageInfo.pageNum, pageCount, req.query.page);

        if (req.query.page > pageCount && pageCount !== 0) {
            res.redirect('/notice?page=' + pageCount + '&limit=' + pageInfo.limit)
        }

        await Promise.all(result.map(value => {
            value.dataValues.date = dateformat('yyyy-mm-dd', value.dataValues.date);
        })).then(() => {
            res.render('notices/notice', {
                loginUser: req.session.loginUser,
                noticeList: result,
                pages: pages,
                pageCount: pageCount,
                classes: classes,
                noticeCount: noticeCount
            });
        })
    })

})

var galleryPageInfo = {
    limit: 12,
    pageNum: 5
}


router.get('/gallery', /*paginate.middleware(galleryPageInfo.limit, 50),*/ (req, res) => {
    classModel.findAll({order:[['no','ASC']]}).then(async classes => {
        var start = ((req.query.page - 1) * galleryPageInfo.limit);

        /*const [result, galleryCount] = await Promise.all([
            gallery.findAll({
                order: [['no', 'DESC']],
                limit: req.query.limit,
                offset: start
            }),
            gallery.count()
        ]);*/

        gallery.aggregate('category', 'DISTINCT', {plain: false},{order:[['no','ASC']]}).then(categories => {
            /*const pageCount = Math.ceil(galleryCount / req.query.limit);
            const pages = paginate.getArrayPages(req)(galleryPageInfo.pageNum, pageCount, req.query.page);

            if (req.query.page > pageCount && pageCount !== 0) {
                res.redirect('/gallery?page=' + pageCount + '&limit=' + galleryPageInfo.limit)
            }*/
            gallery.findAll({
                order: [['no', 'DESC']]
            }).then(result => {
                res.render('photos/gallery', {
                    loginUser: req.session.loginUser,
                    galleryList: result,
                    /*pages: pages,
                    pageCount: pageCount,*/
                    classes: classes,
                    categories: categories
                });
            })

        })
    })
})

router.get('/contact', (req, res) => {
    classModel.findAll({order:[['no','ASC']]}).then(classes => {

        res.render('inquiry/contact', {loginUser: req.session.loginUser, classes: classes});
    })
})

router.get('/employment', (req, res) => {
    classModel.findAll({order:[['no','ASC']]}).then(classes => {

        res.render('inquiry/employment', {loginUser: req.session.loginUser, classes: classes});
    })
})

router.get('/notice/detail/:id', (req, res) => {
    classModel.findAll({order:[['no','ASC']]}).then(classes => {
        var id = req.params.id;

        notice.findOne({
            where: {
                no: id
            }
        }).then(result => {
            result.dataValues.date = dateformat('yyyy-mm-dd', result.dataValues.date);
            res.render('notices/notice_detail', {loginUser: req.session.loginUser, notice: result, classes: classes});
        })

    })
})

router.post('/sendMessage', (req, res) => {
    message.create({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message
    }).then(() => {
        res.send('success')
    }).catch(err => {
        res.send(err);
    })
})


module.exports = router;
