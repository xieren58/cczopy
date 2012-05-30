var mongoose = require('mongoose');
var moment = require('moment');
var crypto = require('crypto');
// var marked = require('marked');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
    
var CommentSchema = new Schema({
    topic_id: {type: ObjectId, index: true},
    author: {type: String},
    email: {type: String},
    website: {type: String},
    marked_content: {type: String},
    created: {type: Date, default: Date.now}
});

CommentSchema.virtual('readableCreated').get(function(){
    return moment(this.created).format('YYYY-MM-DD HH:mm:ss');
});

CommentSchema.virtual('gravatar').get(function (){
    var host = 'http://www.gravatar.com/avatar/';
    var query = '?s=32&d=identicon';
    return host + crypto.createHash('md5').update(this.email).digest('hex') + query;
});

mongoose.model('Comment', CommentSchema);