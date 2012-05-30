// This snippet is inspired by edwardhotchkiss's mongoose-paginate (https://github.com/edwardhotchkiss/mongoose-paginate)
// and (https://gist.github.com/1525918)
// and works with any methods like where, desc, poulate, etc.
//
// paginate method must be called at the end of method chains.
//
// var paginate = require('paginate');
// model
//  .find()
//  .desc("_id")
//  .populate("some_field")
//  .paginate(1, 10, function(err, currentPage, pageCount, paginatedResults){
//
// })

var mongoose = require('mongoose');

mongoose.Query.prototype.paginate = function(page, limit, cb) {
  var model;
  var query;
  var skipFrom;
  page = Number(page) || 1;
  if(page < 1){
    page = 1;
  }
  if(!limit){
    limit = 10;
  }
  query = this;
  model = this.model;
  skipFrom = (page * limit) - limit;
  query = query.skip(skipFrom).limit(limit);
  if (cb) {
    return query.run(function(err, docs) {
      if (err) {
        return cb(err, null, null, null);
      } else {
        return model.count(query._conditions, function(err, total) {
          var pageCount = Math.ceil(total / limit);
          // page = page > pageCount ? pageCount: page;
          return cb(null, page, pageCount, docs);
        });
      }
    });
  } else {
    throw new Error("pagination needs a callback as the third argument.");
  }
};

