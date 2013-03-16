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
	
	self.bot.registerCommand('join', self.join(), 'admin');
	self.bot.registerCommand('part', self.part(), 'admin');
	self.bot.registerCommand('reload', self.reload(), 'admin');
	
	self.bot.registerCommand('say', self.say(), false);
	self.bot.registerCommand('help', self.help(), false);
	
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bot.unregisterCommand('join');
	self.bot.unregisterCommand('part');
	self.bot.unregisterCommand('reload');
	
	self.bot.unregisterCommand('say');
	self.bot.unregisterCommand('help');
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
	};
};

Module.prototype.help = function(){
	var self = this;
	return function(client, from, to, args) {
		var message,
			text = self.bot.commands.map(function(command){
			return command.command;
		}).join(' ');
		message = "Available commands: " + text;
		self.say()(client, from, to, message.split(' '));
	};
};

Module.prototype.reload = function(){
	var self = this;
	return function(client, from, to, args) {
		var bot = self.bot,
			module, message,
			reply = from;
		module = bot.modules.filter(function(mod){
			if (args.length == 0) { return false; }
			return mod.name == args[0];
		});
		
		if (args.length == 0) {
			message = bot.help('reload', '<module>');
		} else if (module.length == 0) {
			message = "no module found named: " + args[0];
		} else {
			module = module[0];
			bot.unloadModule(module.name);
			bot.loadModule(module.path, module.file);
			message = "reloaded: " + module.name;
		}
		self.say()(client, from, to, message.split(' '));
	};
};