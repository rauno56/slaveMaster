var Slave = function (id, master, data) {
	this.id = id || "NA";
	this.master = master || null;
	this.master = master || null;
	
	$('.field').append('<div id="'+id+'" class="node">'+id+'</div>');
	this.el = $('#'+id);
	this.el.on('click', (function () {
		Slavery.select(this);
		$('#rightContent input').first().focus();
	}).bind(this));
	this.el.draggable();
};

Slave.prototype = {
	id: null,
	el: null,
	master: null,
	options: {},
	remove: function () {
		this.el.remove();
		this.master.slaves[this.id] = null;
		delete this.master.slaves[this.id];
	}
};

var Master = function () {
	var socket = this.socket = io.connect('/master');
	
	socket.on('slaves', (function (data) {
		console.log("slaves came",data);
		this.update(data);
	}).bind(this));
};

Master.prototype = {
	slaves: {},
	yell: function (cmd) {
		this.socket.emit('yell', cmd, function (a,b) {
			console.log("answer", a,b);
		});
	},
	command: function (cmd, slaves) {
		cmd = cmd || "";
		slaves = isArray(slaves) ? slaves : (slaves ? [slaves] : []);
		this.socket.emit('command', { command: cmd, slaves: slaves }, function (a,b) {
			console.log("answer:", a,b);
		});
	},
	update: function (data) {
		data = data || [];
		console.log(this.slaves);
		for (var i in data) {
			this.addSlave(i,data[i]);
		}
		for (var i in this.slaves) {
			if (!data[i]) {
				this.removeSlave(i);
			}
		}
	},
	addSlave: function (id, options) {
		if (!this.slaves[id]) {
			console.log("Slave added", id);
			this.slaves[id] = new Slave(id, this, options);
		}
	},
	removeSlave: function (id) {
		console.log("Slave removed", id);
		this.slaves[id].remove();
	}
};

var master = Slavery.master = new Master();