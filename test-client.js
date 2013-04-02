var client = require("./client/RpcClient").create();

client.connect("8000", function(stub) {
	stub.add(1, 2, function(result) {
		console.log("1 + 2 = " + result);
	});

	stub.minus(2, 1, function(result) {
		console.log("2 - 1 = " + result);
	});
});

client.invoke("add", 100, 200, function(result) {
	console.log("100 + 200 = " + result);
});

client.invoke("minus", 100, 200, function(result) {
	console.log("100 - 200 = " + result);
});

client.on("remote", function(stub) {
	stub.add(56, 89, function(result) {
		console.log("56 + 89 = " + result);
	})
});

client.on("remote", function(stub) {
	stub.add(100, 89, function(result) {
		console.log("100 + 89 = " + result);
	});
});