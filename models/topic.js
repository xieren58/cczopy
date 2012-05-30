var mongoose = require('mongoose');
var moment = require('moment');
var ghm = require("github-flavored-markdown");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
    
var TopicSchema = new Schema({
    title: {type: String},
    content: {type: String},
    tags: [String],
    comment_count: {type: Number, default: 0},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
});

TopicSchema.virtual('readableCreated').get(function(){
    return moment(this.created).format('dddd, YYYY-MM-DD, HH:mm:ss');
});

TopicSchema.virtual('readableUpdated').get(function(){
    return moment(this.updated).format('YYYY-MM-DD HH:mm:ss');
});

TopicSchema.virtual('markedContent').get(function(){
    return ghm.parse(this.content);
});

mongoose.model('Topic', TopicSchema);