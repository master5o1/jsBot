String.prototype.startsWith = function(start) {
	return this.substring(0, start.length) == start;
};

var Module = module.exports = function Module(bot){
	var self = this;
	self.bot = bot;
	
	self.load();
	
	console.log('core module utils loaded');
};

Module.prototype.load = function(){
	var self = this;
	
	self.bot.addListener('command_join', self.join());
	self.bot.addListener('command_part', self.part());
	self.bot.addListener('command_say', self.say());
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bot.removeAllListeners('command_join');
	self.bot.removeAllListeners('command_part');
	self.bot.removeAllListeners('command_say');
};

Module.prototype.join = function(){
	var self = this;
	return function(client, from, to, args) {
		var channel;
		if (args.length == 0) {
			message = self.bot.help("join", "[#channel]");
			self.say(client, from, to, message.split(' '));
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
	var self = this;
	return function(client, from, to, args) {
		var receiver, message;
		message = args.join(' ');
		if (args.length == 0) {
			message = self.bot.help("say", "<message>");
		}
		if (to == self.bot.details.nick) {
			receiver = from;
			if ((args[0] || '').startsWith('#')) {
				receiver = args.shift();
				if (typeof client.chans[receiver] == 'undefined') {
					args.unshift(receiver);
					receiver = from;
				}
				message = args.join(' ');
				if (args.length == 0) {
					message = self.bot.help("say", "[#channel] <message>");
				}
			}
		} else {
			receiver = to;
		}
		console.log(receiver, message);
		client.say(receiver, message);
	};
};