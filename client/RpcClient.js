var util = require("util"),
	net = require("net"),
	uuid = require("uuid"),
	protocol = require("../protocol/proto"),
	Composer = require("stream-pkg"),
	EventEmitter = require("events").EventEmitter,
	ST_INITED = 0,
	ST_CONNECTING = 1,
	ST_CONNECTED = 2,
	slice = Array.prototype.slice;


var RpcClient = function() {
		this.connection = null;
		this.state = false;
		this.callback = {};
		this.clientStub = {};
		this.invokeQueue = [];

		EventEmitter.call(this);
	};

util.inherits(RpcClient, EventEmitter);

/**
 * 连接rpc服务
 */
RpcClient.prototype.connect = function(port, host, callback) {
	if (this.state > ST_INITED) {
		console.log("The client is probability connected or connecting now.")
		return;
	}

	if (typeof host == "function") {
		callback = host;
		host = "127.0.0.1";
	}

	var composer = new Composer(),
		me = this;

	this.connection = net.createConnection(port, host);
	this.connection.setKeepAlive(true);
	this.state = ST_CONNECTING;

	this.connection.on("connect", function() {
		var id = uuid.v4();
		me.callback[id] = function(methods) {
			methods.forEach(function(method) {
				me.clientStub[method] = function() {
					if (me.state < ST_CONNECTED) {
						console.log("The connection is disconnected.")
						return;
					}

					var uid = uuid.v4()
					args = slice.call(arguments, 0),
						len = args.length;

					if (typeof args[len - 1] == "function") {
						me.callback[uid] = args.pop();
					}
					me.connection.write(composer.compose(protocol.encode.apply(null, [uid, method, args])));
				};
			});
			me.state = ST_CONNECTED;
			me.flush();
			callback(me.clientStub);
			me.emit("remote", me.clientStub);
		};
		me.connection.write(composer.compose(protocol.encode(id, "__metadata__")));
	});
	this.connection.on("error", function(err) {
		console.error("Unexpected exception: " + err);
		me.emit("error", err);
	});
	this.connection.on("close", function() {
		me.connection = null;
		me.state = ST_INITED;
		me.clientStub = {};
		me.callback = {};
	});

	this.connection.on("data", function(data) {
		composer.feed(data);
	});
	composer.on("data", function(data) {
		var args = protocol.decode(data),
			id = args.shift();

		me.callback[id].apply(null, args);
		delete me.callback[id];
	});
};

/**
 * 断连
 */
RpcClient.prototype.disConnect = function() {
	this.connection.destroy();
};

/**
 * rpc调用
 */
RpcClient.prototype.invoke = function(method /*, arg1, arg2, ..., callback*/ ) {
	var args = slice.call(arguments, 0),
		method;

	if (this.state < ST_CONNECTED) {
		this.invokeQueue.push(args);
		return;
	}

	method = args.shift();
	if (typeof this.clientStub[method] === "function") {
		this.clientStub[method].apply(null, args);
	}
};

/**
 * 清空调用队列
 */
RpcClient.prototype.flush = function() {
	if (this.state < ST_CONNECTED) {
		return;
	}

	var args;
	while((args = this.invokeQueue.shift())) {
		this.invoke.apply(this, args);
	}
};

exports.create = function() {
	return new RpcClient();
}