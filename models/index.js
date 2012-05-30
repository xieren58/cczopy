var mongoose = require('mongoose');
var config = require('../config').config;
    
mongoose.connect(config.dbUrl, function(err){
    if(err){
        console.log('connect to db error: ' + err.message);
        process.exit(1);
    }
});

require('../lib/paginate');

require('./user');
require('./topic');
require('./comment');

exports.User = mongoose.model('User');
exports.Topic = mongoose.model('Topic');
exports.Comment = mongoose.model('Comment');