var sanitize = require('validator').sanitize;
var check = require('validator').check;
var models = require('../models');
var User = models.User;

// reset password email
exports.reset = function(req, res, next) {
    if(!req.session.user){
        return res.redirect('/signin');
    }
    var method = req.method.toLowerCase();
    if(method == 'get'){
        User.findOne({'_id': req.session.user.id}, function(err, user){
            if (err) return next(err);
            if (user) {
                return res.render('reset', {title: 'Reset', email: user.email}); 
            }
            res.redirect('home');
        });
    }else if(method == 'post'){
        var oldpass = sanitize(req.body.oldpass).trim();
        oldpass = sanitize(oldpass).xss();
        var pass = sanitize(req.body.pass).trim();
        pass = sanitize(pass).xss();
        var confirm_pass = sanitize(req.body.confirm_pass).trim();
        confirm_pass = sanitize(confirm_pass).xss();
        var email = sanitize(req.body.email).trim();
        email = sanitize(email.toLowerCase()).xss();
        if(!oldpass || !pass || !confirm_pass || !email){
            return res.render('reset', {title: 'Reset', error:'信息不完整。', email: email});
        }
        if(pass != confirm_pass){
            return res.render('reset', {title: 'Reset', error:'两次新密码输入不一致。', email: email});
        }
        try{
            check(email, '不正确的电子邮箱。').isEmail();
        }catch(e){
            return res.render('reset', {title: 'Reset', error: e.message, email: email});
        }
        User.findOne({'_id': req.session.user.id}, function(err, user){
            if (err) return next(err);
            if (user && !user.authenticate(oldpass)) {
                return res.render('reset', {title: 'Reset', error:'原密码不正确。', email: email});
            }else if(user && user.authenticate(oldpass)){
                user.password = pass;
                user.email = email;
                user.save(function(err){
                    if(err) {
                        return next(err);
                    }
                    return res.render('reset', {success: '重设资料成功！'});
                });
            }else{
                return res.redirect('home');
            }
        });
    }

};
