var	EventEmitter = require('events').EventEmitter,
	irc = require('irc');

function Bot(config){
	var bot = this;
	
	bot.details = {
		name: 'jsBot by 5o1',
		nick: config.bot.nick
	};
	
	bot.addListener('message', bot.messageParser());
	bot.addListener('error', bot.errorParser());
	
	// Bot is multi-server orientated so holds a
	// list of the servers that it is connected to.
	bot.servers = [];
	
	bot.addServers(config.servers);
}

Bot.prototype.__proto__ = EventEmitter.prototype;

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
		realname: bot.details.name
	});
	
	client.addListener('message', function(from, to, message) {
		bot.emit('message', client, from, to, message);
	});
	
	client.addListener('error', function(message) {
		bot.emit('error', client, message);
	});
	
	console.log('connecting to: ', client.opt.server);
	
	return client;
};

Bot.prototype.messageParser = function() {
	var bot = this;
	return function(client, from, to, message) {
		console.log(client.opt.server);
		console.log("message", client.opt.server, from, to, message);
	};
};

Bot.prototype.errorParser = function() {
	var bot = this;
	return function(client, message) {
		console.error("error", client.opt.server, message);
	};
};


module.exports = Bot;