String.prototype.startsWith = function(start) {
	return this.substring(0, start.length) == start;
};

var Module = module.exports = function Module(bot){
	var self = this;
	self.bot = bot;
	
	self.bridges = [];
	
	/*
	[
		{
			name: 'Freenode',
			server: null,
			channel: '#ualug'
		},
		{
			name: 'PirateIRC',
			server: null,
			channel: '#ppnz'		
		}
	]
	*/
	
	self.load();
	
	console.log('module bridge loaded');
};

Module.prototype.load = function(){
	var self = this;
	
	self.bridgeCommandHandler = self.bridgeCommand();
	self.bridgeHandler = self.bridge();
	
	self.bot.registerCommand('bridge', self.bridgeCommandHandler);
	
	self.bot.addListener('message', self.bridgeHandler);
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bot.deregisterCommand('bridge', self.bridgeCommandHandler);
	
	self.bot.removeListener('message', self.bridgeHandler);
};

Module.prototype.bridge = function(){
	var self = this;
	return function(client, from, to, message) {
	
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
		var serverName = arg[0];
		var channel = arg[1];
		if (!channel.startsWith('#')) {
			text = self.bot.help('bridge', '<server> <channel>');
			self.bot.emit('command_say', client, self.bot.details.nick, to, text.split(' '));
			return;		
		}
		var foreign = self.bot.servers.filter(function(s){
			return serverName == s.config.name;
		});
		if (foreign.length == 1) { foreign = foreign[0]; }
		else {
			text = self.bot.help('bridge', '<server> <channel>');
			self.bot.emit('command_say', client, self.bot.details.nick, to, text.split(' '));
			return;
		}
		var local = self.bot.servers.filter(function(s){
			return s.server.opt.server == client.opt.server;
		});
		local = local[0];
		
		var bridge = [
			{},
			{}
		];
		
	};
};

/*
[
	{
		name: 'Freenode',
		server: null,
		channel: '#ualug'
	},
	{
		name: 'PirateIRC',
		server: null,
		channel: '#ppnz'		
	}
]
*/