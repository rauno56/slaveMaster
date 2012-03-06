
/**
 * Module dependencies.
 */

var PORT = process.env['port'] || 3000,
	express = require('express'),
	routes = require('./routes'),
	app = module.exports = express.createServer(),
	io = require('socket.io').listen(app);

//Socket.IO configuration

io.configure(function () {
	io.set('log level', 1);
	io.set("transports", ["xhr-polling"]); 
	io.set("polling duration", 10); 
});


//App configuration

app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'secret'}));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function () {
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function (req, res) { res.redirect('/slave'); });
app.get('/slave', routes.index);

app.get('/master', routes.master);

var genId = function () {
	return 's'+Math.floor(Math.random()*1000);
};

var getSocket = function (id) {
	return sockets[id] || null;
};

var sockets = {},
	slaves = {};

var regSlave = function (socket, id) {
	if (!id) {
		console.log('New slave.');
		id = genId();
		obj = {};
		obj[id] =  {color: 'white' };
		io.of('/master').emit('slaves', obj);
	}
	sockets[id] = socket;
	slaves[id] = { color: 'white' };
	socket.set('slaveId', id, function (a,b,c) {
//		console.log('setting slaveId',a);
	});
	return id;
};

io.of('/slave').on('connection', function (socket) {
	socket.on('slave', function (data, cb) {
		if (data.code) {
			if (data.code=='reg') {
				var id = regSlave(socket, data.slaveId);
				console.log("-> " + id);
				cb(id);
			} else if (data.code=='ping') {
				socket.get('slaveId', function (err, id) {
					console.log('ping from', id);
					if (cb) {
						cb(id);
					}
				});
			} 
		} else {
			console.log(data);	
		}
	});
	
	socket.on('disconnect', function () {
		console.log("Slave got away.");
	});
});

io.of('/master').on('connection', function (socket) {
	socket.emit('slaves', slaves);
	
	socket.on('yell', function (data, cb) {
		io.of('/slave').emit('command', data, cb);
		console.log("Master commanded all slaves: ", data, !!cb);
	});
	socket.on('command', function (data, cb) {
		var slaves, slave;
		if (data && (slaves = data.slaves)) {
			for (var i = 0; i<slaves.length; i++) {
				if (slave = getSocket(slaves[i])) {
					slave.emit('command', data.command);
				}
			}
		}
		console.log("Master commanded some slaves: ", data);
	});
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
