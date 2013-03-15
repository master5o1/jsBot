var EventEmitter = require('events').EventEmitter,
	irc = require('irc'),
	fs = require('fs');

String.prototype.startsWith = function(start) {
	return this.substring(0, start.length) == start;
};
	
var Bot = module.exports = function Bot(config){
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
	
	// list of modules (including core).
	bot.modules = [];
	
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
		name: name.replace(/\.js$/, ''),
		file: name,
		path: (core ? './' : '../modules/'),
		core: core,
		module: new module(bot)
	};
	
	bot.modules.push(mod);
};

Bot.prototype.loadModule = function(path, file, index) {
	var bot = this,
		isCore = path == './',
		module;
	if (file == 'bot.js') return;
	console.log('loading', (isCore ? 'core:' : 'module:'), file);
	
	Object.keys(require.cache).forEach(function(key) {
		if (require(key) == require(path + '/' + file))
			delete require.cache[key];
	});
	module = require(path + '/' + file);
	bot.addModule(module, file, isCore);
};

Bot.prototype.unloadModule = function(name) {
	var bot = this,	modules;
	modules = bot.modules.filter(function(mod){
		return mod.name == name;
	});
	modules.forEach(function(module, index) {
		module.module.unload();
		console.log('unloading', (module.core ? 'core:' : 'module:'), module.file);
	});
	bot.modules = bot.modules.filter(function(mod){
		return mod.name != name;
	});
};

Bot.prototype.loadModules = function() {
	var bot = this;
	var module_paths = {
		'./core' : './',
		'./modules' : '../modules'
	};
	Object.keys(module_paths).forEach(function(path){
		fs.readdir(path, function(err, files){
			if (err) {
				console.log('fs.readdir error', err);
				return;
			}
			files.forEach(function(file, index) {
				bot.loadModule(module_paths[path], file, index);
			}, bot);
		});
	});
};

// I want to move this to utils.js
Bot.prototype.reload = function(client, from, to, args) {
	var bot = this,
		module, message,
		reply = from;
	console.log('reload command', from, to, args);
	
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
		console.log(module);
		bot.unloadModule(module.name);
		bot.loadModule(module.path, module.file);
		message = "reloaded: " + module.name;
	}
	console.log(message);
	bot.emit('command_say', client, from, to, message.split(' '));
};

Bot.prototype.help = function(command, help) {
	var bot = this;
	return 'Usage: ' + bot.details.commandPrefix + command + ' ' + help;
};