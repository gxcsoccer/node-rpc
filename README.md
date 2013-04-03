node-rpc
========

<<<<<<< HEAD
node-rpc is an asynchronous rpc system for node.js that lets you call remote functions.

# example

## listen and connect
``` js
var RpcServer = require('node-rpc').server;
var server = RpcServer.create({
    transform : function (s, cb) {
        cb(s.replace(/[aeiou]{2,}/, 'oo').toUpperCase())
    }
});
server.listen(5004);
```
client:

``` js
var RpcClient = require('node-rpc').client
	client = RpcClient.create();

client.connect(5004);
client.on('remote', function (remote) {
    remote.transform('beep', function (s) {
        console.log('beep => ' + s);
        d.end();
    });
});
```

output:

```
$ node server.js &
[1] 27574
$ node client.js
beep => BOOP
```
=======
This is a rpc library base on nodejs
>>>>>>> 1eff48ad473ffbd5d74e96cfdab3ef548cff13af
