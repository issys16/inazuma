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
  socket.on('emit_left_from_client', function(data){
    socket.broadcast.emit('emit_left_from_server', data);
  });
  socket.on('emit_right_from_client', function(data){
    socket.broadcast.emit('emit_right_from_server', data);
  });
});
