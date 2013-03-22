var redis    = require('socket.io/node_modules/redis').createClient()
  , memcache = require('memcache')
  , express  = require('express')
  , server   = require('http').createServer(app)
  , io       = require('socket.io').listen(server)
  , cookie   = require('cookie')
  , app      = express()
  , sockets  = {};

// connect to memcache on default host/port
mcClient = new memcache.Client()
mcClient.connect();

// run HTTP server on this port
server.listen(3000);

io.set('authorization', function(data, callback)
{
  var cookies = cookie.parse(data.headers.cookie);
  console.log(cookies);
  mcClient.get('sessions/' + cookies.PHPSESSID, function(error, result)
  {
    if (error)
    {
      console.log('error');
      callback(error, false);
    }
    else if (result)
    {
      data.session = JSON.parse(result);
      callback(null, true);
    }
    else
    {
      callback('Could not find session ID ' + cookies.PHPSESSID + ' in memcached', false);
    }
  });
});

io.sockets.on('connection', function(socket) 
{
  var session = socket.handshake.session;
  console.log('Received connection from user:', session.user);
  // store user's socket
  sockets[session.user.username] = socket;
});

getNews();

function getNews()
{
  redis.blpop('news', 0, function(err, data)
  {
    news = JSON.parse(data[1]);

    if (typeof news.to !== 'undefined')
    {
      if (typeof sockets[news.to] !== 'undefined')
      {
        // send just the given user the news
        sockets[news.to].emit('news', news.content);
      }
    }
    else
    {
      // send everyone the news
      io.sockets.emit('news', news.content);
    }

    // check for more data in next run of the event loop
    process.nextTick(getNews);
  });
}