var	EventEmitter = require('events').EventEmitter,
	irc = require('irc');

String.prototype.startsWith = function(start) {
	return this.substring(0, start.length) == start;
};
	
function Bot(config){
	var bot = this;
	
	bot.details = {
		name: 'jsBot by 5o1',
		nick: config.bot.nick,
		commandPrefix: config.bot.commandPrefix,
		banned: config.users.banned,
		admin: config.users.admin
	};
	
	// Bot is multi-server orientated so holds a
	// list of the servers that it is connected to.
	bot.servers = [];
	bot.users = [];
	bot.modules = [];
	bot.core = [];
	
	bot.addListener('command_reload', function(client, from, to, args){
		bot.reload(client, from, to, args);
	});
	
	bot.addServers(config.servers);
}

Bot.prototype = Object.create(EventEmitter.prototype);

Bot.prototype.addServers = function(servers) {
	var bot = this;
	servers.forEach(function(server, index) {
		bot.addServer(server);
	}, bot);
};

Bot.prototype.addServer = function(server) {
	var bot = this;
	var client = new irc.Client(server.url, bot.details.nick, {
		channels: server.channels,
		userName: bot.details.nick,
		realName: bot.details.name
	});
	console.log('connecting to:', client.opt.server);
	client.addListener('registered', function(message){
		console.log('connected to:', client.opt.server);
	});
	client.addListener('message', bot.messageParser(client));
	client.addListener('error', bot.errorParser(client));
	
	bot.servers.push({ config: server, server: client });
};

Bot.prototype.messageParser = function(client) {
	var bot = this;
	return function(from, to, message) {
		if (message.startsWith(bot.details.commandPrefix)) {
			var args = message.split(' '),
				command = args.shift().substring(bot.details.commandPrefix.length);
			console.log('command_' + command, client.opt.server, from, to, args);
			bot.emit('command_' + command, client, from, to, args);
		} else {
			console.log("message", client.opt.server, from, to, message);
			bot.emit('message', client, from, to, message);
		}
	};
};

Bot.prototype.errorParser = function(client) {
	var bot = this;
	return function(message) {
		bot.emit('error', client, message);
		console.error("error", client.opt.server, message);
	};
};

Bot.prototype.addModule = function(module, name, core) {
	var bot = this, mod;
	core = core || false;
	var mod = {
		name: name,
		path: (core ? './' : '../modules/') + name,
		module: new module(bot)
	};
	
	if (core) bot.core.push(mod);
	else bot.modules.push(mod);
};

Bot.prototype.reload = function(client, from, to, args) {
	var bot = this, reply = from;
	console.log('reload command');
	console.log(client, from, to, args);
	
	if (to.startsWith('#')) reply = to;
	client.say(reply, "DEMO reloaded: {args}".replace("{args}", args.join(' ')));
};


module.exports = Bot;