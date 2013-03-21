var redis   = require('socket.io/node_modules/redis').createClient()
  , app     = require('express')()
  , server  = require('http').createServer(app)
  , io      = require('socket.io').listen(server)
  , sockets = [];

server.listen(3000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
  console.log('Client connected');
});

getNews();

function getNews()
{
  redis.blpop('news', 0, function(err, news)
  {
    console.log('news', news);
    io.sockets.emit('news', news);
    process.nextTick(getNews);
  });
}