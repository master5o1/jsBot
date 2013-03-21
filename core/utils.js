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
	self.unloadModuleHandler = self.unloadModule();
	self.listModulesHandler = self.listModules();
	
	self.helpHandler = self.help();
	
	self.bot.registerCommand('reload', self.reloadHandler, 'admin');
	self.bot.registerCommand('load', self.loadModuleHandler, 'admin');
	self.bot.registerCommand('unload', self.unloadModuleHandler, 'admin');
	self.bot.registerCommand('lsmod', self.listModulesHandler, 'admin');

	self.bot.registerCommand('help', self.helpHandler, false);
	
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bot.deregisterCommand('reload', self.reloadHandler);
	self.bot.deregisterCommand('load', self.loadModuleHandler);
	self.bot.deregisterCommand('unload', self.unloadModuleHandler);
	self.bot.deregisterCommand('lsmod', self.listModulesHandler);
	
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
			}),
			op = self.bot.commands.filter(function(command){
				return command.permission == 'op';
			}).map(function(command){
				return command.command;
			});
			common = self.bot.commands.filter(function(command){
				return command.permission != 'admin'
					&& command.permission != 'op';
			}).map(function(command){
				return command.command;
			});
		message = "Available Commands: " + common.join(' ');
		if (op.length > 0) message += "\nOP only: " + op.join(' ');
		if (admin.length > 0) message += "\nAdmin only: " + admin.join(' ');
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

Module.prototype.unloadModule = function(){
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
			message = "unloaded: " + module.name;
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

Module.prototype.listModules = function(){
	var self = this,
		module_paths = {
			'./core' : './',
			'./modules' : '../modules'
		};
	return function(client, from, to, args) {
		var bot = self.bot,
			keys = Object.keys(module_paths),
			count = 0,
			message = "",
			reply = from,
			modules = [],
			path = "";
		
		for (var _index = 0; _index < keys.length; _index++) {
			path = keys[_index];
			fs.readdir(path, (function(path){
				return function(err, files){
					if (err) {
						console.log('fs.readdir error', err);
						return;
					}
					var file_count = 0;
					for (var index = 0; index < files.length; index++) {
						var file = files[index];
						file_count++; 
						if (file == 'bot.js') { continue; }
						var isCore = path == './core' ? true : false;
						var isLoaded = self.bot.modules.some(function(mod){ return (mod.name + '.js') == file });
						modules.push({ name: file.replace('.js', ''), core: isCore, loaded: isLoaded });
						if (count == keys.length - 1 && index == files.length - 1) {
							message = "Modules:\n";
							message += modules.sort(function(a, b){
								var c = a.core ? 2 : 0;
								var d = b.core ? 2 : 0;
								a.loaded ? c++ : c;
								b.loaded ? d++ : d;
								return d - c;
							}).map(function(mod){
								return "{name} ({loaded},{core})"
									.replace("{name}", mod.name)
									.replace("{loaded}", mod.loaded ? 'loaded' : '')
									.replace("{core}", mod.core ? 'core' : '')
									.replace(",", mod.loaded && mod.core ? ', ' : '')
									.replace('()', '');
							}).join ("\n");
							self.bot.emit('command_say', client, from, to, message.split(' '));
							message = "";
						}
					}
					count++;
				}
			})(path));
		}
		if (message.length > 0)
			self.bot.emit('command_say', client, from, to, message.split(' '));
	};
};
