
var tagMap = function() {
    if (!this.tags) {
        return;
    }
    for (var index in this.tags) {
        emit(this.tags[index], 1);
    }
};
var tagReduce = function(previous, current) {
    var count = 0;
    for (var index in current) {
        count += current[index];
    }
    return count;
};

exports.tagMap = tagMap;
exports.tagReduce = tagReduce;
