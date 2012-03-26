var Slave = function (id, master, data) {
	this.id = id || "NA";
	this.master = master || null;
	this.master = master || null;
	var me = this;
	
	$('.field').append('<div id="'+id+'" class="node">'+id+'</div>');
	this.el = $('#'+id);
	this.el.on('click', (function () {
		Slavery.select(this);
		$('#rightContent input').first().focus();
	}).bind(this));
	
	this.el.draggable();
	
	this.el.one('dragstop', this, function (e) {
		console.log("stop");
		var el = e.data.el,
			position = el.position();
		el.css('position', 'absolute').css(position);
	});
};

Slave.prototype = {
	id: null,
	el: null,
	lined: true,
	master: null,
	options: {},
	remove: function () {
		this.el.remove();
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
	slaves: [],
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
		data = data || {};
		var me = this;
		console.log(this.slaves);
		for (var i in data) {
			this.addSlave(i,data[i]);
		}
		this.slaves.forEach(function (s, i) {
			if (!data[s.id]) {
				me.removeSlave(s.id);
			}
		});
	},
	addSlave: function (id, options) {
		if (this.findSlave(id)==-1) {
			console.log("Slave added", id);
			this.slaves.push(new Slave(id, this, options));
		} else {
			console.log("Slave exists", id);
		}
	},
	removeSlave: function (id) {
		var i;
		if ((i = this.findSlave(id)) == -1) {
			console.log("Such slave doesn't exist.", id);
		} else {
			var slave = this.slaves.splice(i, 1)[0].remove();
			console.log("Slave removed", id);
		}
	},
	findSlave: function (id) {
		var i = this.slaves.length;
		while (i--) {
			if (this.slaves[i].id == id) {
				return i;
			}
		}
		return -1;
	},
	getSlave: function (id) {
		var i;
		var match = this.slaves.filter(function (s) { return s.id==id; });
		return match.length == 0 ? null : match[0];
	}
};

var master = Slavery.master = new Master();