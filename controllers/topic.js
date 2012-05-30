
/*
 * GET home page.
 */
var sanitize = require('validator').sanitize;
var _ = require("underscore");
var async = require('async');
var models = require('../models');
var User = models.User;
var Topic = models.Topic;
var Comment = models.Comment;
var limit = require('../config').config.limit;

// exports.index = function(req, res, next){
//     Topic.find({}, function(err, topics){
//         if (err) return next(err);
//         res.render('topic/index', {topics: topics});
//     });
// };

// 显示文章
exports.show = function(req, res, next){
    var topic_id = req.params.tid;
    Topic.findById(topic_id, function(err, topic){
        if(err) {
            return res.render('error/404', {title: '404 Not Found'});
        }
        if(!topic) {
            return res.redirect('back');
        }
        async.parallel({
            comments: function(callback){
                Comment.find({'topic_id': topic._id}, [], {sort:[['created','asc']]}, function(err, comments){
                    if(err){
                        callback(err);
                    }
                    callback(null, comments);
                });
            },
            prevTopic: function(callback){
                Topic.findOne({created: {$lt: topic.created}}, [], {sort:[['created','desc']]}, function(err, prevTopic){
                    if(err){
                        callback(err);
                    }
                    callback(null, prevTopic);
                });
            },
            nextTopic: function(callback){
                Topic.findOne({created: {$gt: topic.created}}, [], {sort:[['created','asc']]}, function(err, nextTopic){
                    if(err){
                        callback(err);
                    }
                    callback(null, nextTopic);
                });
            }
        },
        function(err, results){
            if(err){
                return res.redirect('back');
            }
            res.render('topic/show', {title: topic.title, topic: topic,
                comments: results.comments, prevTopic: results.prevTopic, nextTopic: results.nextTopic});
        }); // end async
    }); // end Topic
};
    



// 发表文章
exports.create = function(req, res, next){
    if(!req.session.user){
        return res.redirect('home');
    }
    var method = req.method.toLowerCase();
    if(method == 'get'){
        return req.session.user ? res.render('topic/create') : res.redirect('home');
    }else if(method == 'post'){
        var title = sanitize(req.body.title).trim();
        title = sanitize(title).xss();
        var tags = sanitize(req.body.tags).trim();
        tags = sanitize(tags).xss();
        var content = req.body.content;
        if(!title || !tags || !content){
            return res.render('topic/create', {error:'信息不完整。', title: title, tags: tags, content: content});
        }
        var topic = new Topic();
        topic.title = title;
        topic.tags = _.map(tags.split(','), function(tag){return sanitize(tag).trim();});
        topic.content = content;
        topic.save(function(err){
            if(err) {
                return next(err);
            }
            // res.render('topic/create', {success: '发表成功！'});
            res.redirect('/topic/' + topic._id);
        });
    }
};

// 删除文章
exports.delete = function(req, res, next){
    if(!req.session.user){
        return res.redirect('home');
    }
    var topic_id = req.params.tid;
    Topic.findOne({'_id': topic_id}, function(err, topic){
        if(err) {
            return next(err);
        }
        if (!topic) {
            return res.redirect('back');
        }
        topic.remove(function(err){
            if(err) {
                return next(err);
            }
            return res.redirect('home');
        });
    });
};

// 编辑文章
exports.edit = function(req, res, next){
    if(!req.session.user){
        return res.redirect('home');
    }
    var method = req.method.toLowerCase();
    var topic_id = req.params.tid;
    if(method == 'get'){
        Topic.findOne({'_id': topic_id}, function(err, topic){
            if(err) {
                return next(err);
            }
            if (!topic) {
                res.redirect('back');
                return;
            }
            res.render('topic/edit', {topic: topic});
        });
    }else if(method == 'post'){
        //  Topic.findOne({'_id': topic_id}, function(err, topic){
        //     if(err) {
        //         return next(err);
        //     }
        //     if (!topic) {
        //         res.redirect('back');
        //         return;
        //     }
        //     var title = sanitize(req.body.title).trim();
        //     title = sanitize(title).xss();
        //     var tags = sanitize(req.body.tags).trim();
        //     tags = sanitize(tags).xss();
        //     var content = req.body.content;
        //     if(!title || !tags || !content){
        //         return res.render('topic/edit', {error:'信息不完整。', topic: topic});
        //     }
        //     topic.title = title;
        //     topic.tags = _.map(tags.split(','), function(tag){return sanitize(tag).trim();});
        //     topic.content = content;
        //     topic.updated = new Date();
        //     topic.save(function(err){
        //         if(err) {
        //             return next(err);
        //         }
        //          return res.redirect('/topic/' + topic_id);
        //     });
        // });
        
        // using async waterfall
        async.waterfall(
            [
                function(callback){
                    Topic.findOne({'_id': topic_id}, function(err, topic){
                        if(err) {
                            return next(err);
                        }
                        if (!topic) {
                            return res.redirect('back');
                        }
                        callback(null, topic);
                    });
                },
                function(topic, callback){
                    var title = sanitize(req.body.title).trim();
                    title = sanitize(title).xss();
                    var tags = sanitize(req.body.tags).trim();
                    tags = sanitize(tags).xss();
                    var content = req.body.content;
                    if(!title || !tags || !content){
                        return res.render('topic/edit', {error:'信息不完整。', topic: topic});
                    }
                    topic.title = title;
                    topic.tags = _.map(tags.split(','), function(tag){return sanitize(tag).trim();});
                    topic.content = content;
                    topic.updated = new Date();
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
               return res.redirect('/topic/' + topic._id);
            }
        );
    }
  
};

// tag
exports.tag = function(req, res, next){
    var tag = req.params.tag;
    // Topic.find({tags: tag}, function(err, topics){
    //     if (err){
    //         return next(err);
    //     }
    //     res.render('topic/tag', {tag: tag, topics: topics});
    // });
    Topic.find({tags: tag}).desc("_id").paginate(req.query.page, limit, function(err, currentPage, pageCount, paginatedResults){
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
        res.render('topic/tag', {title: tag, tag: tag, baseurl:'/tag/'+encodeURI(tag), topics: paginatedResults,
            currentPage: currentPage, prevPage: prevPage, nextPage: nextPage});
    });
};

