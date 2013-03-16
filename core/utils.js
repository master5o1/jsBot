var util = require('util'),
	fs = require('fs');

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
	
	self.reloadHandler = self.reload();
	self.loadModuleHandler = self.loadModule();
	
	self.helpHandler = self.help();
	
	self.bot.registerCommand('reload', self.reloadHandler, 'admin');
	self.bot.registerCommand('load', self.loadModuleHandler, 'admin');

	self.bot.registerCommand('help', self.helpHandler, false);
	
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bot.deregisterCommand('reload', self.reloadHandler);
	self.bot.deregisterCommand('load', self.loadModuleHandler);
	
	self.bot.deregisterCommand('help', self.helpHandler);
};

Module.prototype.help = function(){
	var self = this;
	return function(client, from, to, args) {
		var message,
			admin = self.bot.commands.filter(function(command){
				return command.permission == 'admin';
			}).map(function(command){
				return command.command;
			}).join(' '),
			common = self.bot.commands.filter(function(command){
				return command.permission != 'admin';
			}).map(function(command){
				return command.command;
			}).join(' ');
		message = util.format("Available commands: %s\nAdmin only: %s", common, admin);
		self.bot.emit('command_say', client, from, to, message.split(' '));
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
		self.bot.emit('command_say', client, from, to, message.split(' '));
	};
};

Module.prototype.loadModule = function(){
	var self = this,
		module_paths = {
			'./core' : './',
			'./modules' : '../modules'
		};
	return function(client, from, to, args) {
		var bot = self.bot,
			module,
			keys = Object.keys(module_paths),
			found = false,
			message = "",
			reply = from;
		module = bot.modules.filter(function(mod){
			if (args.length == 0) { return false; }
			return mod.name == args[0];
		});
		
		if (args.length == 0) {
			message = bot.help('load', '<module>');
		} else if (module.length != 0) {
			message = "Module " + args[0] + " already loaded.";
		} else {
			message = "";
			keys.forEach(function(path, index){
				fs.readdir(path, function(err, files){
					if (err) {
						console.log('fs.readdir error', err);
						return;
					}
					var filtered_files = files.filter(function(file){
						return file == (args[0] + '.js');
					});
					filtered_files.forEach(function(file, fIndex) {
						console.log(file, args[0]);
						bot.loadModule(module_paths[path], file, fIndex);
						message = "loaded: " + args[0];
						self.bot.emit('command_say', client, from, to, message.split(' '));
						message = "";
					}, bot);
					if (filtered_files.length == 0 && index == keys.length - 1) {
						message = "Module file for '" + args[0] + "' not found.";
					}
				});
			});
		}
		if (message.length > 0)
			self.bot.emit('command_say', client, from, to, message.split(' '));
	};
};
