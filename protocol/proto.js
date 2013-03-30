var toString = Object.prototype.toString,
	slice = Array.prototype.slice;

/**
 * 将rpc调用序列化为字节流
 */
exports.encode = function() {
	var args = slice.call(arguments, 0),
		len = 1,
		offset = 1,
		list;

	list = args.map(function(arg) {
		var chunk = toString.call(arg) == "[object String]" ? arg : JSON.stringify(arg);
		len += (Buffer.byteLength(chunk) + 4);
		return chunk;
	});

	console.log("length: " + list.length);

	var buf = new Buffer(len);

	buf.writeInt8(list.length, 0); // arguments number
	list.forEach(function(chunk) {
		var clen = Buffer.byteLength(chunk);
		buf.writeInt32LE(clen, offset);
		buf.write(chunk, offset + 4);
		offset += (clen + 4);
	});

	return buf;
};

/**
 * 将字节流反序列化为rpc调用
 */
exports.decode = function(buf) {
	var argNum = buf.readInt8(0),
		args = [],
		i = 0,
		offset = 1,
		dLen, data;

	console.log("argNum: " + argNum);
	for (; i < argNum; i++) {
		dLen = buf.readInt32LE(offset);
		console.log("dLen: " + dLen);
		data = buf.slice(offset + 4, offset + 4 + dLen).toString();
		if(data[0] == "[" || data[0] == "{") {
			data = JSON.parse(data);
		}
		args.push(data);
		offset += (4 + dLen);
	}

	return args;
};