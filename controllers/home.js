
/*
 * GET home page.
 */
var sanitize = require('validator').sanitize;
var check = require('validator').check;
var models = require('../models');
var User = models.User;
var Topic = models.Topic;
var limit = require('../config').config.limit;
var tagMap = require('../lib/tagcloud').tagMap;
var tagReduce = require('../lib/tagcloud').tagReduce;

exports.index = function(req, res, next){
    // var options = {skip: (page-1)*limit, limit: limit, sort: [['created','desc']]};
    //  Topic.find({}, [], options, function(err, topics){
    //     if(err){
    //         return next(err);
    //     }
    //     res.render('index', {topics: topics, currentPage: page});
    // });
    Topic.find({}).desc("_id").paginate(req.query.page, limit, function(err, currentPage, pageCount, paginatedResults){
        if(err){
            return next(err);
        }
        var prevPage = false;
        var nextPage = false;
        if(currentPage > 1){
            prevPage = true;
        }
        if(currentPage + 1 <= pageCount){
            nextPage = true;
        }
        res.render('index', {baseurl:'/', topics: paginatedResults, currentPage: currentPage,
            prevPage: prevPage, nextPage: nextPage});
    });
};

// 注册
exports.signup = function(req, res, next){
    if(req.session.user){
        return res.redirect('home');
    }
    var method = req.method.toLowerCase();
    if(method == 'get'){
        res.render('signup');
    }else if(method == 'post'){
        var name = sanitize(req.body.name).trim();
        name = sanitize(name.toLowerCase()).xss();
        var pass = sanitize(req.body.pass).trim();
        pass = sanitize(pass).xss();
        var confirm_pass = sanitize(req.body.confirm_pass).trim();
        confirm_pass = sanitize(confirm_pass).xss();
        var email = sanitize(req.body.email).trim();
        email = sanitize(email.toLowerCase()).xss();
        if(!name || !pass || !confirm_pass || !email){
            return res.render('signup', {error:'信息不完整。', name: name, email: email});
        }
        if(pass != confirm_pass){
            return res.render('signup', {error:'两次密码输入不一致。', name: name, email: email});
        }
        try{
            check(email, '不正确的电子邮箱。').isEmail();
        }catch(e){
            return res.render('signup', {error: e.message, name: name, email: email});
        }
        User.find({}, function(err, users){ // 已经有用户，不让再注册
            if (err) return next(err);
            if (users.length < 1) {
                var user = new User();
                user.name = name;
                user.password = pass;
                user.email = email;
                user.save(function(err){
                    if(err) {
                        return next(err);
                    }
                    res.render('signup', {success: '注册成功！'});
                });
            }else{
                return res.redirect('home');
            }

        });
    }
};

// 登录
exports.signin = function(req, res, next){
    if(req.session.user){
        return res.redirect('home');
    }
    var method = req.method.toLowerCase();
    if(method == 'get'){
        res.render('signin');
    }else if(method == 'post'){
        var name = sanitize(req.body.name).trim().toLowerCase();
        var pass = sanitize(req.body.pass).trim();
        if (!name || !pass) {
            return res.render('signin', { error: '信息不完整。' });
        }
        User.findOne({ 'name': name }, function(err, user){
            if (err) return next(err);
            if (user && user.authenticate(pass)) {
                req.session.user = {id: user._id, name: user.name};
                return res.redirect('home');
            }
            res.render('signin');
        });
    }
};

// sign out
exports.signout = function(req, res, next) {
    req.session.destroy();
    res.redirect(req.headers.referer || 'home');
};

// about
exports.about = function(req, res, next) {
    res.render('about', {title: 'About'});
};

// tags
exports.tags = function(req, res, next) {
    Topic.collection.mapReduce(
        tagMap.toString(),
        tagReduce.toString(),
        { out: { inline: 1 } },
        function(err, tags) {
            if (err) return next(err);
            res.render('tags', {title:'Tags', tags: tags});
        }
    );
};

exports.ajaxTags = function(req, res, next) {
    Topic.collection.mapReduce(
        tagMap.toString(),
        tagReduce.toString(),
        { out: { inline: 1 } },
        function(err, tags) {
            if (err) return next(err);
            autoTags = [];
            for (var i=0; i < tags.length; i++) {
                autoTags.push(tags[i]._id);
            }
            res.send(autoTags.join("\n"));
        }
    );
};

