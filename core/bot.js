var EventEmitter = require('events').EventEmitter,
	irc = require('irc'),
	fs = require('fs'),
	Mongolian = require('mongolian');

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
	
	bot.dbServer = new Mongolian();
	bot.dbDatabase = bot.dbServer.db('jsBot');
	
	bot.servers = [];
	bot.users = [];
	
	bot.modules = [];
	bot.commands = [];
	
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
			bot.emit('command_' + command, client, from, to, args);
			bot.emit('command', client, from, to, message.split(' '));
		} else {
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
	var key = require.resolve(path + '/' + file);
	delete require.cache[key];
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

Bot.prototype.loadModules = function(core_only) {
	var bot = this,
		paths,
		module_paths = {
			'./core' : './',
			'./modules' : '../modules'
		};
	core_only = core_only || false;
	paths = Object.keys(module_paths)
	if (core_only)
		paths = ['./core'];
	paths.forEach(function(path){
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

Bot.prototype.registerCommand = function(command, handler, permission) {
	var bot = this;
	bot.commands.push({
		command: command,
		handler: handler,
		permission: permission
	});
	bot.addListener('command_' + command, handler);
};

Bot.prototype.deregisterCommand = function(command, handler) {
	var bot = this;
	bot.commands = bot.commands.filter(function(com) {
		return com.command != command;
	});
	bot.removeListener('command_' + command, handler);
};

Bot.prototype.help = function(command, help, isFilter) {
	var bot = this;
	isFilter = isFilter || false;
	if (isFilter)
		return command + ' filter: ' + help;
	else
		return 'Usage: ' + bot.details.commandPrefix + command + ' ' + help;
};