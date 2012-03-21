var Slave = function () {
	var me = this;
	
	var socket = me.socket = io.connect('/slave'); 
	
	socket.on('connect', (function () {
		this.log('connection established');
		this.reg();
	}).bind(me));
	
	socket.on('command', this.act.bind(me));
};

Slave.prototype = {
	id: null,
	messages: [],
	say: function (data, cb) {
		data = data || { code: "ping" };
		cb = cb || this.log.bind(this);
		
		if (typeof data == "string") {
			data = { msg: data };
		}
		data['slaveId'] = this.id;
		
		this.socket.emit('slave', data, cb);
		
		return data;
	},
	reg: function () {
		this.say({ code: 'reg' }, this.setId.bind(this));
	},
	setId: function (id) {
		this.log("Set id: "+id);
		this.id = id;
		this.displayId();
	},
	displayId: function () {
		$('.slaveId').html(this.id);
	},
	act: function (data, cb) {
		this.log(data);
		console.log("command", data, cb);
		if (data && data.type && data.type=='background-color') {
			this.color(data.to);
		}
	},
	log: function (data) {
		console.log(data, this.messages.push(data));
	},
	color: function (to) {
		console.log("change background color to",to);
		$('html').css('background', "none");
		$('html').css('background-color', to);
	}
};

var slave = new Slave(),
	master = io.connect('/master');