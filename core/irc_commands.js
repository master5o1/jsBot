var Module = module.exports = function Module(bot){
	var self = this;
	self.bot = bot;
	
	self.muted_channels = {};
	
	self.load();
	
	console.log('core module irc_commands loaded');
};

Module.prototype.load = function(){
	var self = this;
	
	self.joinHandler = self.join();
	self.partHandler = self.part();
	self.kickHandler = self.kick();
	self.nickHandler = self.nick();
	self.muteHandler = self.mute();
	self.rawHandler = self.raw();
	
	self.sayHandler = self.say();
	
	self.bot.registerCommand('join', self.joinHandler, 'admin');
	self.bot.registerCommand('part', self.partHandler, 'op');
	self.bot.registerCommand('nick', self.nickHandler, 'admin');
	self.bot.registerCommand('kick', self.kickHandler, 'op');
	self.bot.registerCommand('mute', self.muteHandler, 'op');
	self.bot.registerCommand('raw', self.rawHandler, 'admin');
	self.bot.registerCommand('say', self.sayHandler, false);
	
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bot.deregisterCommand('join', self.joinHandler);
	self.bot.deregisterCommand('part', self.partHandler);
	self.bot.deregisterCommand('nick', self.nickHandler);
	self.bot.deregisterCommand('kick', self.kickHandler);
	self.bot.deregisterCommand('mute', self.muteHandler);
	self.bot.deregisterCommand('raw', self.rawHandler);
	
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
		var channel,
			receiver = self.bot.startsWith(to, '#') ? to : from,
			isAdmin = self.bot.details.admin.some(function(user){
				return user.host == self.bot.users[from].host && user.account == self.bot.users[from].account;
			});
		if ((args.length == 0 && !self.bot.startsWith(to, '#'))
			|| (args.length > 0 && (!isAdmin || !self.bot.startsWith(args[0], '#')))) {
			message = self.bot.help("part", "[#channel]");
			self.bot.say(client, receiver, message);
			return;
		}
		if (isAdmin && args.length > 0) {
			channel = args[0];
		} else {
			channel = to;
		}
		client.part(channel);
		console.log('Parted channel', channel, 'on server', client.opt.server);
	};
};

Module.prototype.mute = function(){
	var self = this;
	return function(client, from, to, args) {
		if (!self.bot.startsWith(to, '#')) {
			self.bot.say(client, from, self.bot.help('mute', '[reset]'));
			return;
		}
		var mute_key = client.opt.server + '/' + to;
		self.muted_channels[mute_key] = true;
		if (args.length > 0 && args[0] == 'reset') {
			self.muted_channels[mute_key] = false;
		}
	};
};

Module.prototype.kick = function(){
	var self = this;
	return function(client, from, to, args) {
		var nick, text = "";
		if (args.length == 0 || !self.bot.startsWith(to, '#')) {
			text = self.bot.help("kick", "<nick> [<message>]");
			self.bot.emit('command_say', client, self.bot.details.nick, to, text.split(' '));
			return;
		}
		nick = args[0];
		if (args.length > 1) text = args.slice(1).join(' ');
		client.send('KICK', to, nick, text);
	};
};

Module.prototype.nick = function(){
	var self = this;
	return function(client, from, to, args) {
		var text = "";
		if (args.length == 0 || !self.bot.startsWith(to, '#')) {
			text = self.bot.help("nick", "<nick>");
			self.bot.emit('command_say', client, self.bot.details.nick, to, text.split(' '));
			return;
		}
		self.bot.details.nick = args[0];
		self.bot.servers.forEach(function(s){
			s.server.send('NICK', self.bot.details.nick);
		});
	};
};

Module.prototype.raw = function(){
	var self = this;
	return function(client, from, to, args) {
		var text = "",
			receiver = self.bot.startsWith(to, '#') ? to : from;
		if (args.length == 0) {
			text = self.bot.help("raw", "<args>");
			self.bot.say(client, receiver, text);
			return;
		}
		self.bot.servers.forEach(function(s){
			s.server.send.apply(this, args);
		});
	};
};

Module.prototype.say = function(){
	var self = this;
	return function(client, from, to, args) {
		var receiver, message;
		message = args.join(' ');
		var mute_key = client.opt.server + '/' + to;
		if (typeof self.muted_channels[mute_key] != 'undefined' && self.muted_channels[mute_key] === true) {
			return;
		}
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
		
		if (self.bot.startsWith((args[0] || '_'), '#')) {
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
			var isAction = self.bot.startsWith(text, '/me');
			if (isAction) client.action(receiver, text);
			else client.say(receiver, text);
			self.bot.emit('said', client, self.bot.details.nick, receiver, text);
		});
	};
};