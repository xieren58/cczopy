var NAE = true;

if(process.env.VCAP_SERVICES){ // for cloud foundry
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var mongo = env['mongodb-1.8'][0]['credentials'];
}else if(NAE){
  var mongo = {
    "hostname": "127.0.0.1",
    "port": 20088,
    "username": "",
    "password": "",
    "db": ""
  };
  var naePort = 80;
}else{
  var mongo = {
    "hostname": "localhost",
    "port": 27017,
    "username": "",
    "password": "",
    "db": "cczopy"
  };
}

var generateMongoUrl = function(obj){
  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 27017);
  obj.db = (obj.db || 'test');

  if(obj.username && obj.password){
    return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
  else{
    return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
};

exports.config = {
    timezone: 'Asia/Shanghai',
    host: (process.env.VCAP_APP_HOST || '127.0.0.1' || 'localhost'),
    port: (process.env.VMC_APP_PORT || naePort || 3000),
    dbUrl: generateMongoUrl(mongo),
    sessionSecret: 'your secret here',
    limit: 5
};