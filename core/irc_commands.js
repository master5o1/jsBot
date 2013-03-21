
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
	self.kickHandler = self.kick();
	
	self.sayHandler = self.say();
	
	self.bot.registerCommand('join', self.joinHandler, 'admin');
	self.bot.registerCommand('part', self.partHandler, 'admin');
	self.bot.registerCommand('kick', self.kickHandler, 'op');
	
	self.bot.registerCommand('say', self.sayHandler, false);
	
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bot.deregisterCommand('join', self.joinHandler);
	self.bot.deregisterCommand('part', self.partHandler);
	self.bot.deregisterCommand('kick', self.kickHandler);
	
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
		console.log('Joined channel', channel, 'on server', client.opt.server);
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
		console.log('Parted channel', channel, 'on server', client.opt.server);
	};
};

Module.prototype.kick = function(){
	var self = this;
	return function(client, from, to, args) {
		var nick, text = "";
		if (args.length == 0 || !to.startsWith('#')) {
			text = self.bot.help("kick", "<nick> [<message>]");
			self.bot.emit('command_say', client, self.bot.details.nick, to, text.split(' '));
			return;
		}
		nick = args[0];
		if (args.length > 1) text = args.slice(1).join(' ');
		client.send('KICK', to, nick, text);
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
			} else {
				if (args[0] == '/me') {
					args.shift();
				}
			}
			message = args.join(' ');
		} else if (args[0] == '/me') {
			args.shift();
			message = args.join(' ');
		}
		
		message.split("\n").forEach(function(text){
			var isAction = text.startsWith('/me');
			if (isAction) client.action(receiver, text);
			else client.say(receiver, text);
			self.bot.emit('said', client, self.bot.details.nick, receiver, text);
		});
	};
};