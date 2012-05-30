var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function validatePresenceOf(value) {
    return value && value.length;
}

var UserSchema = new Schema({
    name: {type: String, index: true},
    hashed_password: {type: String},
    salt: {type: String},
    email: {type: String},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
});

UserSchema.virtual('password').set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
}).get(function(){
    return this._password;
});

UserSchema.method('authenticate', function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
});

UserSchema.method('makeSalt', function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
});

UserSchema.method('encryptPassword', function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
});

UserSchema.pre('save', function(next){
    if (!validatePresenceOf(this.password)){
        next(new Error('Invalid password'));
    }else{
        next();
    }
});

mongoose.model('User', UserSchema);
