
/*
 * GET home page.
 */
var sanitize = require('validator').sanitize;
var check = require('validator').check;
var ghm = require("github-flavored-markdown");
var async = require('async');
var models = require('../models');
var Topic = models.Topic;
var Comment = models.Comment;



// 发表评论
exports.create = function(req, res, next){
    async.waterfall(
        [
            function(callback){ // find topic
                var tid = req.body.topic_id;
                Topic.findOne({'_id': tid}, function(err, topic){
                        if(err) {
                            return next(err);
                        }
                        if (!topic) {
                            return res.redirect('back');
                        }
                        callback(null, topic);
                });
            },
            function(topic, callback){ // create comment
                var nickname = sanitize(sanitize(req.body.nickname).trim()).xss();
                var email = sanitize(sanitize(req.body.email.toLowerCase()).trim()).xss();
                var website = sanitize(sanitize(req.body.website).trim()).xss();
                var content = req.body.content;
                if(!nickname || !email || !content){
                    req.flash('error', 'Please input all required fields.');
                    req.flash('nickname', nickname);
                    req.flash('email', email);
                    req.flash('website', website);
                    req.flash('content', content);
                    return res.redirect('/topic/' + topic._id + '#new-comment');
                }
                try{
                    check(email, 'Please input a valid email.').isEmail();
                }catch(e){
                    req.flash('error', e.message);
                    req.flash('nickname', nickname);
                    req.flash('email', email);
                    req.flash('website', website);
                    req.flash('content', content);
                    return res.redirect('/topic/' + topic._id + '#new-comment');
                }
                if(website){
                    if(website.indexOf('http://') < 0){
                        website = 'http://' + website;
                    }
                    try{
                        check(website, 'Please input a valid website url.').isUrl();
                    }catch(e){
                        req.flash('error', e.message);
                        req.flash('nickname', nickname);
                        req.flash('email', email);
                        req.flash('website', website);
                        req.flash('content', content);
                        return res.redirect('/topic/' + topic._id + '#new-comment');
                    }
                }
                var comment = new Comment();
                comment.topic_id = topic._id;
                comment.author = nickname;
                comment.email = email;
                comment.website = website || '';
                comment.marked_content = ghm.parse(content);
                comment.save(function(err){
                    if(err) {
                        return next(err);
                    }
                    callback(null, topic);
                });
            },
            function(topic, callback){ // update topic comment_count
                topic.comment_count += 1;
                topic.save(function(err){
                    if(err) {
                        return next(err);
                    }
                    callback(null, topic);
                });
            }
        ],

        function(err, topic){ // final
            if(err) {
                return next(err);
            }
           res.redirect('/topic/' + topic._id + '#comments');
        }
    );
};

// 删除评论
exports.delete = function(req, res, next){
     if(!req.session.user){
        return res.redirect('home');
    }
    async.waterfall(
        [
            function(callback){ // find comment
                var cid = req.params.cid;
                Comment.findOne({'_id': cid}, function(err, comment){
                        if(err) {
                            return next(err);
                        }
                        if (!comment) {
                            return res.redirect('back');
                        }
                        callback(null, comment);
                });
            },
            function(comment, callback){ // remove comment
                var tid = comment.topic_id;
                comment.remove(function(err){
                    if(err) {
                        return next(err);
                    }
                    callback(null, tid);
                });
            },
            function(tid, callback){ // find topic
                Topic.findOne({'_id': tid}, function(err, topic){
                        if(err) {
                            return next(err);
                        }
                        if (!topic) {
                            return res.redirect('back');
                        }
                        callback(null, topic);
                });
            },
            function(topic, callback){ // update topic comment count
                topic.comment_count -= 1;
                topic.save(function(err){
                    if(err) {
                        return next(err);
                    }
                    callback(null, topic);
                });
            }
        ],

        function(err, topic){
            if(err) {
                return next(err);
            }
           res.redirect('/topic/' + topic._id + '#comments');
        }
    );
};

