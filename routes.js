
var home = require('./controllers/home');
var topic = require('./controllers/topic');
var comment = require('./controllers/comment');
var user = require('./controllers/user');

exports = module.exports = function(app) {
    app.get('/', home.index);
    app.get('/tags', home.tags);
    app.get('/ajaxTags', home.ajaxTags);
    app.get('/about', home.about);
    app.get('/signup', home.signup);
    app.post('/signup', home.signup);
    app.get('/signin', home.signin);
    app.post('/signin', home.signin);
    app.get('/signout', home.signout);

    app.get('/reset', user.reset);
    app.post('/reset', user.reset);

    app.get('/topic/create', topic.create);
    app.post('/topic/create', topic.create);
    // app.get('/topics', topic.index);
    app.get('/topic/:tid', topic.show);
    app.get('/topic/:tid/edit', topic.edit);
    app.post('/topic/:tid/edit', topic.edit);
    app.get('/topic/:tid/delete', topic.delete);

    app.post('/comment/create', comment.create);
    app.get('/comment/:cid/delete', comment.delete);

    app.get('/tag/:tag', topic.tag);
};
