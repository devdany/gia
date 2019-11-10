var express = require('express');
var router = express.Router();
var dateformat = require('../lib/DateFormatConverter');
var contents = require('../lib/contents');
var teacher = require('../db/model/Teachers');
const classModel = require('../db/model/Class');
const schedule = require('../db/model/Schedule');
const gallery = require('../db/model/Gallery');
const message = require('../db/model/Message');
const videoPopup = require('../db/model/VideoPopup');
const notice = require('../db/model/Notice')
const path = require('path');
const fs = require('fs');
const uploadDir = path.join(__dirname, '../public/img');
var paginate = require('express-paginate');
const refdir = path.join(__dirname, '../public/ref');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/* GET home page. */


router.get('/', (req, res) => {
    classModel.findAll({order: [['no', 'ASC']]}).then(classes => {
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
                                if (error === null) {
                                    isPopup = true;
                                    //없는 경우
                                } else {
                                    isPopup = false;
                                }

                                videoPopup.findOne({
                                    where: {
                                        no: 1,
                                        notice_id: {
                                            $ne: 0
                                        }
                                    }
                                })
                                  .then(videoPopup => {

                                      if(videoPopup) {
                                          notice.findOne({
                                              where: {
                                                  no: videoPopup.dataValues.notice_id
                                              }
                                          })
                                            .then(videoPopupNotice => {
                                                res.render('index', {
                                                    loginUser: req.session.loginUser,
                                                    contents: contents,
                                                    classes: classes,
                                                    teachers: teachers,
                                                    galleryList: galleryList,
                                                    totals: totals,
                                                    categories: categories,
                                                    isPopup: isPopup,
                                                    videoPopup: videoPopupNotice,
                                                    isDoublePopup: isPopup && videoPopupNotice
                                                });
                                            })

                                      } else {
                                          res.render('index', {
                                              loginUser: req.session.loginUser,
                                              contents: contents,
                                              classes: classes,
                                              teachers: teachers,
                                              galleryList: galleryList,
                                              totals: totals,
                                              categories: categories,
                                              isPopup: isPopup,
                                              videoPopup: null,
                                              isDoublePopup: false
                                          });
                                      }

                                  })

                            })
                        })
                    })
                })
            })
        })
    })
});

router.get('/greeting', (req, res) => {
    classModel.findAll({order: [['no', 'ASC']]}).then(classes => {
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
    classModel.findAll({order: [['no', 'ASC']]}).then(classes => {
        res.render('about/vm', {loginUser: req.session.loginUser, classes: classes});
    })

})

router.get('/faculty', (req, res) => {
    classModel.findAll({order: [['no', 'ASC']]}).then(classes => {
        teacher.findAll().then(teachers => {
            const rows = []
            for (let i = 0; i<Math.ceil(teachers.length/4); i++) {
              const row = []
              for (let j = 0; j<4; j++) {
                if (teachers[(i*4) + j]) {
                  row.push(teachers[(i*4) + j])
                }
              }
              rows.push(row)
            }
            console.log(rows)
            res.render('about/faculty', {loginUser: req.session.loginUser, teacherRows: rows, classes: classes});
        })
    })

})

router.get('/teacherInfo/:id', (req, res) => {
    classModel.findAll({order: [['no', 'ASC']]}).then(classes => {
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
    classModel.findAll({order: [['no', 'ASC']]}).then(classes => {
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
    classModel.findAll({order: [['no', 'ASC']]}).then(classes => {
        res.render('admissions/fee', {loginUser: req.session.loginUser, classes: classes});
    })

})

router.get('/application', (req, res) => {
    classModel.findAll({order: [['no', 'ASC']]}).then(classes => {
        res.render('admissions/application', {loginUser: req.session.loginUser, classes: classes});
    })
})

router.get('/downloadApplication', (req, res) => {
    const applicationFile = refdir + '/application.pdf';
    res.download(applicationFile);
})

router.get('/test', (req, res) => {
    classModel.findAll({order: [['no', 'ASC']]}).then(classes => {
        res.render('admissions/test', {loginUser: req.session.loginUser, classes: classes});
    })
})

var pageInfo = {
    limit: 10,
    pageNum: 5
}

router.get('/notice', paginate.middleware(pageInfo.limit, 50), (req, res) => {
    classModel.findAll({order: [['no', 'ASC']]}).then(async classes => {
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


router.get('/gallery', (req, res) => {
    classModel.findAll({order: [['no', 'ASC']]}).then(async classes => {

        gallery.aggregate('category', 'DISTINCT', {plain: false}).then(async categories => {
            categories = await categories.sort((a, b) => {

                const x = a.DISTINCT.toLowerCase();
                const y = b.DISTINCT.toLowerCase();


                if(x === 'tinytigers'){
                    return -1;
                }else if(y === 'tinytigers'){
                    return 1;
                } else{
                    return x < y ? -1 : x > y ? 1 : 0;
                }
            })

            await gallery.findAll({
                order: [['no', 'DESC']]
            }).then(result => {
                res.render('photos/gallery', {
                    loginUser: req.session.loginUser,
                    galleryList: result,
                    classes: classes,
                    categories: categories
                });
            })

        })
    })
})

router.get('/contact', (req, res) => {
    classModel.findAll({order: [['no', 'ASC']]}).then(classes => {

        res.render('inquiry/contact', {loginUser: req.session.loginUser, classes: classes});
    })
})

router.get('/employment', (req, res) => {
    classModel.findAll({order: [['no', 'ASC']]}).then(classes => {

        res.render('inquiry/employment', {loginUser: req.session.loginUser, classes: classes});
    })
})

router.get('/notice/detail/:id', (req, res) => {
    classModel.findAll({order: [['no', 'ASC']]}).then(classes => {
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
