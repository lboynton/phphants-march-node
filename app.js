// get rid of RedisStore. Make as simple as possible by subscribing to redis ourself.
// compare pubsub and blocking pop.

var RedisStore = require('socket.io/lib/stores/redis')
  , redis  = require('socket.io/node_modules/redis')
  , pub    = redis.createClient()
  , sub    = redis.createClient()
  , client = redis.createClient()
  , app    = require('express')()
  , server = require('http').createServer(app)
  , io     = require('socket.io').listen(server);

server.listen(3000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

store = new RedisStore({
  redisPub : pub
, redisSub : sub
, redisClient : client
});

io.set('store', store);

io.sockets.on('connection', function(socket) {
  console.log('Client connected');
  sub.subscribe('news', function(a,b,c)
  {
    console.log(a,b,c);
//    socket.emit('news', news);
  });
});
