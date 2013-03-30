var net = require('net'),
	protocol = require("./protocol/proto"),
	Composer = require("stream-pkg");

var HOST = '127.0.0.1';
var PORT = 8000;

var client = new net.Socket(),
	composer = new Composer();

client.connect(PORT, HOST, function() {
	console.log('CONNECTED TO: ' + HOST + ':' + PORT);

	client.write(composer.compose(protocol.encode("__metadata__")));
});

client.on('data', function(data) {
	composer.feed(data);
});

composer.on("data", function(data) {
	console.log('DATA: ' + data);
});

client.on('close', function() {
	console.log('Connection closed');
});