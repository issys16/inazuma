var redis = require('redis').createClient();

var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs');
app.listen(1337);

function handler(req, res) {
  var url = req.url;
  var tmp = url.split('.');
  var ext = tmp[tmp.length - 1];

  switch(ext){
    case 'css':
      fs.readFile(__dirname + '/' + url, function(err, data){
        if (err) {
          res.writeHead(500);
          return res.end('Error');
        }
        res.writeHead(200);
        res.write(data);
        res.end();
      });
      break;
    case 'png':
    case 'webmanifest':
    case 'svg':
      fs.readFile(__dirname + '/' + url, function(err, data){
        if (err) {
          res.writeHead(500);
          return res.end('Error');
        }
        res.writeHead(200);
        res.write(data);
        res.end();
      });
      break;
    default:
      fs.readFile(__dirname + '/index.html', function(err, data){
        if (err) {
          res.writeHead(500);
          return res.end('Error');
        }
        res.writeHead(200);
        res.write(data);
        res.end();
      });
  }
}

io.sockets.on('connection', function(socket){
  socket.on('connect_room_from_client', function(data){
    socket.join(data.room);

    redis.get(data.room + "_left", function(err, val){
      io.to(socket.id).emit('init_left_from_server', val ? val : "");
    });

    redis.get(data.room + "_right", function(err, val){
      io.to(socket.id).emit('init_right_from_server', val ? val : "");
    });
  });

  socket.on('emit_left_from_client', function(data){
    socket.join(data.room);
    socket.broadcast.to(data.room).emit('emit_left_from_server', data);
    redis.set(data.room + "_left", data.body, function(){});
  });

  socket.on('emit_right_from_client', function(data){
    socket.join(data.room);
    socket.broadcast.to(data.room).emit('emit_right_from_server', data);
    redis.set(data.room + "_right", data.body, function(){});
  });
});
