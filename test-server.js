var server = require("./server/RpcServer").create({
	add: function(a, b, callback) {
		callback(a + b);
	},
	minus: function(a, b, callback) {
		callback(a - b);
	}
});

server.listen(8000);