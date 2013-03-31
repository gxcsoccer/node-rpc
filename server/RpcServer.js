var util = require("util"),
	net = require("net"),
	protocol = require("../protocol/proto"),
	Composer = require("stream-pkg"),
	EventEmitter = require("events").EventEmitter,
	hasOwnProperty = Object.prototype.hasOwnProperty,
	slice = Array.prototype.slice;

var RpcServer = function(services) {
		this.services = services || {};
		this.server = net.createServer();

		EventEmitter.call(this);

		this.registerService("__metadata__", (function(callback) {
			var svs = [];
			for (var name in this.services) {
				if (hasOwnProperty.call(this.services, name) && name != "__metadata__") {
					svs.push(name);
				}
			}
			callback(svs);
		}).bind(this));
	};

util.inherits(RpcServer, EventEmitter);

/**
 * 注册服务
 */
RpcServer.prototype.registerService = function(name, fn) {
	this.services[name] = fn;
};

/**
 * 启动Server，监听指定端口
 */
RpcServer.prototype.listen = function(port, host) {
	port = port || 8000;
	host = host || "127.0.0.1";
	var me = this;

	this.server.listen(port, host);

	this.server.on("connection", function(socket) {
		var composer = new Composer();

		socket.on("data", function(data) {
			composer.feed(data);
		});

		composer.on("data", function(data) {
			var args = protocol.decode(data),
				id = args.shift(),
				serviceName = args.shift(),
				service = me.services[serviceName],
				aArr = args.shift() || [];

			if (service) {
				aArr.push(function() {
					var rArgs = slice.call(arguments, 0);
						rArgs.unshift(id);
					socket.write(composer.compose(protocol.encode.apply(null, rArgs)));
				});
				service.apply(null, aArr);
			}
		});

		socket.on("error", function(err) {
			console.error("Unexpected exception: " + err);
		});
	});

	this.server.on("error", function(err) {
		me.emit("error", err);
	});
};

/**
 * 结束
 */
RpcServer.prototype.close = function() {
	this.server.close();
};

// 工厂方法
exports.create = function(services) {
	return new RpcServer(services);
};