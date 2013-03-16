
String.prototype.startsWith = function(start) {
	return this.substring(0, start.length) == start;
};

var Module = module.exports = function Module(bot){
	var self = this;
	self.bot = bot;
	
	self.load();
	
	console.log('core module irc_commands loaded');
};

Module.prototype.load = function(){
	var self = this;
	
	self.joinHandler = self.join();
	self.partHandler = self.part();
	
	self.sayHandler = self.say();
	
	self.bot.registerCommand('join', self.joinHandler, 'admin');
	self.bot.registerCommand('part', self.partHandler, 'admin');
	
	self.bot.registerCommand('say', self.sayHandler, false);
	
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bot.deregisterCommand('join', self.joinHandler);
	self.bot.deregisterCommand('part', self.partHandler);
	
	self.bot.deregisterCommand('say', self.sayHandler);
};

Module.prototype.join = function(){
	var self = this;
	return function(client, from, to, args) {
		var channel;
		if (args.length == 0) {
			message = self.bot.help("join", "[#channel]");
			self.say()(client, from, to, message.split(' '));
			return;
		}
		channel = args[0];
		client.join(channel);
	};
};

Module.prototype.part = function(){
	var self = this;
	return function(client, from, to, args) {
		var channel;
		if (args.length == 0) {
			message = self.bot.help("part", "[#channel]");
			self.say(client, from, to, message.split(' '));
			return;
		}
		channel = args[0];
		if (!channel && to.startsWith('#')) channel = to;
		client.part(channel);
	};
};

Module.prototype.say = function(){
	var self = this,
		isAction = false;
	return function(client, from, to, args) {
		var receiver, message;
		message = args.join(' ');
		if (args.length == 0) {
			message = self.bot.help("say", "<message>");
		}
		if (to == self.bot.details.nick) {
			receiver = from;
			r = from;
		} else {
			receiver = to;
			r = to;
		}
		
		if ((args[0] || '_').startsWith('#')) {
			receiver = args.shift();
			if (typeof client.chans[receiver] == 'undefined') {
				args.unshift(receiver);
				receiver = r;
			}
			message = args.join(' ');
		} else if (args[0] == '/me') {
			args.shift();
			isAction = true;
			message = args.join(' ');
		}
		if (isAction) client.action(receiver, message);
		else client.say(receiver, message);
		
		self.bot.emit('said', client, self.bot.details.nick, receiver, message);
	};
};