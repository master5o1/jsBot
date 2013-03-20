String.prototype.startsWith = function(start) {
	return this.substring(0, start.length) == start;
};

var Module = module.exports = function Module(bot){
	var self = this;
	self.bot = bot;
	
	self.bridges = [];
	
	self.load();
	
	console.log('module bridge loaded');
};

Module.prototype.load = function(){
	var self = this;
	
	self.bridges = [];
	
	self.bridgeCommandHandler = self.bridgeCommand();
	// self.unbridgeHandler = self.unbridge();
		
	self.bridgeHandler = self.bridge();
	
	self.bot.registerCommand('bridge', self.bridgeCommandHandler);
	// self.bot.registerCommand('unbridge', self.unbridgeHandler);
	self.bot.addListener('message', self.bridgeHandler);
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bridges = [];
	
	self.bot.deregisterCommand('bridge', self.bridgeCommandHandler);
	// self.bot.deregisterCommand('unbridge', self.unbridgeHandler);
	self.bot.removeListener('message', self.bridgeHandler);
};

Module.prototype.bridge = function(){
	var self = this;
	return function(client, from, to, message) {
		var text = "";
		if (!to.startsWith('#')) return;
		self.bridges.filter(function(bridge){
			console.log(bridge.from.server.opt.server, client.opt.server, bridge.fromChannel, to);
			return bridge.from.server.opt.server == client.opt.server
					&& bridge.fromChannel.toLowerCase() == to.toLowerCase();
		}).forEach(function(bridge){
			console.log('>>>', bridge.from.server.opt.server, client.opt.server, bridge.fromChannel, to);
			text = "[" + client.opt.server + "] <" + from + "> " + message
			self.bot.emit('command_say', bridge.to.server, self.bot.details.nick, bridge.toChannel, text.split(' '));
		});
	};
};

Module.prototype.bridgeCommand = function(){
	var self = this;
	return function(client, from, to, args) {
		var text = "";
		if (!to.startsWith('#')) {
			text = "This command must be said from a channel.";
			self.bot.emit('command_say', client, self.bot.details.nick, from, text.split(' '));
			return;
		}
		if (args.length != 2) {
			text = self.bot.help('bridge', '<server> <channel>');
			self.bot.emit('command_say', client, self.bot.details.nick, to, text.split(' '));
			return;
		}
		var serverName = args[0];
		var channel = args[1];
		if (!channel.startsWith('#')) {
			text = self.bot.help('bridge', '<server> <channel>');
			self.bot.emit('command_say', client, self.bot.details.nick, to, text.split(' '));
			return;		
		}
		var foreign = self.bot.servers.filter(function(s){
			return serverName == s.config.name;
		});

		if (foreign.length > 0) { foreign = foreign[0]; }
		else {
			text = self.bot.help('bridge', '<server> <channel>');
			self.bot.emit('command_say', client, self.bot.details.nick, to, text.split(' '));
			return;
		}
		
		// redundancy maybe? idk.
		var local = self.bot.servers.filter(function(s){
			return s.server.opt.server == client.opt.server;
		});
		local = local[0];
		
		var bridge_pair = [
			{
				from: local, fromChannel: to,
				to: foreign, toChannel: channel
			},
			{
				from: foreign, fromChannel: channel,
				to: local, toChannel: to
			},
		];
		
		self.bridges = self.bridges.concat(bridge_pair);
		console.log(bridge_pair, bridge_pair.length, self.bridges.length);
		
		text = "Bridge Established with " + foreign.server.opt.server + "/" + channel;
		self.bot.emit('command_say', local.server, self.bot.details.nick, to, text.split(' '));
		text = "Bridge Established with " + local.server.opt.server + "/" + to;
		self.bot.emit('command_say', foreign.server, self.bot.details.nick, channel, text.split(' '));
	};
};