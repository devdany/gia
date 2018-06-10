module.exports = (req, res, next) => {
    if(req.session.loginUser === undefined){
        res.redirect('/');
    } else {
        return next();
    }
}