/*
 * Initialization
 */

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var portNumber = 3000;
http.listen(portNumber);
// static resources
app.use(express.static(__dirname + '/resources'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var buffer = [];
io.sockets.on('connection', function(client){
    console.log('Server started!!!! port - '+portNumber)

    var clientId = client.id;
    console.log('origin clientId = '+clientId)
    clientId = 'User'+clientId.substr(clientId.length-3,3);

    client.broadcast.emit('client_connect',clientId + ' connected');
    //client.send(JSON.stringify({'messages':buffer}));
    client.emit('message',{'messages':buffer});

    client.on('message', function(message){
    	console.log(message);
        var obj = JSON.parse(message)


        switch(obj.type){
            case 'registerUserName':{
                clientId = obj.message;
                break;
            }
            case 'message':{

                var msg = { user: clientId, message: obj.message};
                buffer.push(msg);
                while (buffer.length > 15)
                    buffer.shift(); //removes first item in array
                client.broadcast.emit('message',{'messages':[msg]});
                break;
            }
        }
        console.log(obj.type)
    });

    client.on('disconnect', function(){
        client.broadcast.emit('client_disconnect',clientId + ' disconnected');
    });
});