var express = require('express');
var router = express.Router();
var notice = require('../db/model/Notice');
var dateformat = require('../lib/DateFormatConverter');
var contents = require('../lib/contents');
var teacher = require('../db/model/Teachers');
const classModel = require('../db/model/Class');
const schedule = require('../db/model/Schedule');
const gallery = require('../db/model/Gallery');
const message = require('../db/model/Message')
var paginate = require('express-paginate');
const path = require('path');
const refdir = path.join(__dirname, '../public/ref');

/* GET home page. */


router.get('/', function(req, res) {
    classModel.findAll().then(classes => {
        teacher.findAll().then(teachers => {
            gallery.findAll({
                limit: 12,
                order: [['no', 'DESC']]
            }).then(async galleryList => {
                let totals = 0;
                await Promise.all(classes.map(value => {
                    totals += value.total;
                })).then(() => {
                    res.render('index', {loginUser : req.session.loginUser, contents: contents, classes: classes, teachers: teachers, galleryList: galleryList, totals: totals});
                })

            })
        })
    })
});

router.get('/greeting', (req, res) => {
    classModel.findAll().then(classes => {
        teacher.findAll({
            limit:4,
            order:[['no', 'DESC']]
        }).then(teachers => {
            res.render('about/greeting', {loginUser : req.session.loginUser, contents:contents, classes: classes, teachers: teachers});
        })
    })
})

router.get('/vm', (req, res) => {
    classModel.findAll().then(classes => {
        res.render('about/vm', {loginUser : req.session.loginUser, classes: classes});
    })

})

router.get('/faculty', (req, res) => {
    classModel.findAll().then(classes => {
        teacher.findAll().then(teachers => {
            res.render('about/faculty', {loginUser : req.session.loginUser, teachers : teachers, classes: classes});
        })
    })

})

router.get('/location', (req, res) => {
    classModel.findAll().then(classes => {
        res.render('about/location', {loginUser : req.session.loginUser, classes:classes});
    })

})
router.get('/classInfo/:id', (req, res) => {
    classModel.findAll().then(classes => {
        classModel.findOne({
            where:{
                no: req.params.id
            }
        }).then(classInfo => {
            teacher.findOne({
                where:{
                    no: classInfo.mainTeacher
                }
            }).then(mainTeacher => {
                teacher.findOne({
                    where:{
                        no:classInfo.subTeacher
                    }
                }).then(subTeacher => {
                    schedule.findAll({
                        where:{
                            classname: classInfo.name
                        }
                    }).then(schedules => {
                        res.render('curriculum/classInfo', {loginUser: req.session.loginUser, classInfo: classInfo, outcomes:classInfo.outcomes.split(','), mainTeacher: mainTeacher, subTeacher:subTeacher, classes:classes, schedules:schedules})
                    })
                })
            })

        })
    })
})

router.get('/fee', (req, res) => {
    classModel.findAll().then(classes => {
        res.render('admissions/fee', {loginUser : req.session.loginUser, classes: classes});
    })

})

router.get('/application', (req, res) => {
    classModel.findAll().then(classes => {
        res.render('admissions/application', {loginUser: req.session.loginUser, classes: classes});
    })
})

router.get('/downloadApplication', (req, res) => {
    const applicationFile = refdir+'/application.pdf';
    res.download(applicationFile);
})

router.get('/test', (req, res) => {
    classModel.findAll().then(classes => {
        res.render('admissions/test', {loginUser: req.session.loginUser, classes: classes});
    })
})

var pageInfo = {
    limit : 10,
    pageNum : 5
}

router.get('/notice',paginate.middleware(pageInfo.limit, 50), (req, res) => {
    classModel.findAll().then(async classes => {
        var start = ((req.query.page-1) * pageInfo.limit);
        console.log(start);
        console.log(req.query.limit);

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

        if(req.query.page > pageCount  && pageCount !==0){
            res.redirect('/admin/notice?page='+pageCount+'&limit='+pageInfo.limit)
        }

        await Promise.all(result.map(value => {
            value.dataValues.date = dateformat('yyyy-mm-dd', value.dataValues.date);
        })).then(() => {
            res.render('notices/notice', {loginUser: req.session.loginUser, noticeList: result, pages:pages, pageCount:pageCount, classes: classes, noticeCount: noticeCount});
        })
    })

})

var galleryPageInfo = {
    limit : 12,
    pageNum : 5
}


router.get('/gallery',paginate.middleware(galleryPageInfo.limit, 50), (req, res) => {
    classModel.findAll().then(async classes => {
        var start = ((req.query.page-1) * pageInfo.limit);

        const [result, galleryCount] = await Promise.all([
            gallery.findAll({
                order: [['no', 'DESC']],
                limit:req.query.limit,
                offset: start
            }),
            gallery.count()
        ]);

        gallery.aggregate('category', 'DISTINCT', {plain:false}).then(categories => {
            const pageCount = Math.ceil(galleryCount / req.query.limit);
            const pages = paginate.getArrayPages(req)(galleryPageInfo.pageNum, pageCount, req.query.page);

            if(req.query.page > pageCount && pageCount !==0){
                res.redirect('/admin/gallery?page='+pageCount+'&limit='+galleryPageInfo.limit)
            }

            res.render('photos/gallery', {loginUser: req.session.loginUser, galleryList: result, pages:pages, pageCount:pageCount, classes: classes, categories:categories});

        })
    })
})

router.get('/contact', (req, res) => {
    classModel.findAll().then(classes => {

        res.render('inquiry/contact', {loginUser: req.session.loginUser, classes: classes});
    })
})

router.get('/employment', (req, res) => {
    classModel.findAll().then(classes => {

        res.render('inquiry/employment', {loginUser: req.session.loginUser, classes: classes});
    })
})

router.get('/notice/detail/:id', (req, res) => {
    classModel.findAll().then(classes => {
        var id = req.params.id;

        notice.findOne({
            where: {
                no: id
            }
        }).then(result => {
            res.render('notices/notice_detail', {
                loginUser: req.session.loginUser,
                notice: result,
                classes: classes
            })
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
