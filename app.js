
/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var config = require('./config').config;

process.env.TZ = config.timezone;

var MongoStore = require('connect-mongo')(express);
var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.register('.html', require('ejs'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  // app.use(express.session({ secret: config.sessionSecret }));
  app.use(express.session({
    secret: config.sessionSecret,
    store: new MongoStore({
      url: config.dbUrl + '/sessions'
    })
  }));

  app.use(express.csrf());
  app.use(app.router);
});


app.dynamicHelpers({
  csrf: function(req, res){
    return req.session ? req.session._csrf : '';
  },
  current_user: function(req, res){
    return req.session.user;
  },
  flash: function(req, res){
    return req.flash();
  }
});

app.configure('development', function(){
  if(process.env.VCAP_SERVICES ||
    process.env.VMC_APP_PORT ||
    process.env.VCAP_APP_HOST ||
    config.NAE){
    var maxAge = 3600000 * 24 * 30;
    app.use(express.static(__dirname + '/public', {maxAge: maxAge}));
    app.use(express.errorHandler());
    app.set('view cache', true);
  }else{
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  }
});

app.configure('production', function(){
  var maxAge = 3600000 * 24 * 30;
  app.use(express.static(__dirname + '/public', {maxAge: maxAge}));
  app.use(express.errorHandler());
  // app.use(express.errorHandler({ dumpExceptions: false, showStack: false }));
  app.set('view cache', true);
});


// Routes
routes(app);
// app.get('/', routes.index);

app.listen(config.port, config.host, function(){
  // console.log(process.env);
  console.log("Express server listening on http://%s:%d in %s mode", config.host, app.address().port, app.settings.env);
});

