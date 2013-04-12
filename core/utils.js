var util = require('util'),
	fs = require('fs');

module.exports = function Module(bot){
	var self = this;
	var modulePaths = {
		'./core' : './',
		'./modules' : '../modules'
	};
	
	var lspermsCommand = function(client, from, to, args) {
		var receiver = bot.startsWith(to, '#') ? to : from,
			text = 'Permissions:';
		if (bot.details.admin.length > 0) {
			text += '\nAdmin: ' + bot.details.admin.map(function(user){
				return user.account + ' (' + user.host + ')';
			}).join(', ');
		}
		if (bot.details.banned.length > 0) {
			text += '\nBanned: ' + bot.details.banned.map(function(user){
				return user.account + ' (' + user.host + ')';
			}).join(', ');
		}
		bot.say(client, receiver, text);
	};
	
	var permsCommand = function(client, from, to, args) {
		var receiver = bot.startsWith(to, '#') ? to : from;
		function setPerms(client, from, to, permission, nick) {
				text = "",
				user = { host: bot.users[nick].host, account: bot.users[nick].account };
			bot.details.admin = bot.details.admin.filter(function(user){
				return !(user.host == bot.users[nick].host && user.account == bot.users[nick].account);
			});
			bot.details.banned = bot.details.banned.filter(function(user){
				return !(user.host == bot.users[nick].host && user.account == bot.users[nick].account);
			});
			if (permission != 'user')
				bot.details[permission == 'ban' ? 'banned' : permission].push(user);
			if (permission == 'ban') text = nick + " has been banned.";
			if (permission == 'user') text = "Permissions reset for " + nick;
			if (permission == 'admin') text = "Promoted " + nick + " to admin.";
			bot.say(client, receiver, text);
		}
		var message = "",
			permissions = ['ban', 'admin', 'user'];
		if (args.length < 2 || permissions.indexOf(args[0]) == -1) {
			message = bot.help("perms", "(ban|user|admin) <nick>");
			bot.say(client, receiver, message);
			return;
		}
		var permission = args[0],
			nick = args[1];
		if (typeof bot.users[nick] == 'undefined') {
			client.whois(nick, function(info){
				bot.users[nick] = info;
				setPerms(client, from, to, permission, nick);
			});
			return;
		}
		setPerms(client, from, to, permission, nick);
	};
	
	var helpCommand = function(client, from, to, args) {
		var receiver = bot.startsWith(to, '#') ? to : from,
			admin = bot.commands.filter(function(command){
				return command.permission == 'admin';
			}).map(function(command){
				return command.command;
			}),
			op = bot.commands.filter(function(command){
				return command.permission == 'op';
			}).map(function(command){
				return command.command;
			});
			common = bot.commands.filter(function(command){
				return command.permission != 'admin'
					&& command.permission != 'op';
			}).map(function(command){
				return command.command;
			}),
			message = "Available Commands: " + common.join(' ');
		if (op.length > 0) message += "\nOP & Admin: " + op.join(' ');
		if (admin.length > 0) message += "\nAdmin only: " + admin.join(' ');
		bot.say(client, receiver, message);
	};
	
	var loadModuleCommand = function(client, from, to, args) {
		var receiver = bot.startsWith(to, '#') ? to : from,
			module,
			keys = Object.keys(modulePaths),
			message = "",
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
						bot.loadModule(modulePaths[path], file, fIndex);
						message = "loaded: " + args[0];
						bot.say(client, receiver, message);
						message = "";
					}, bot);
					if (filtered_files.length == 0 && index == keys.length - 1) {
						message = "Module file for '" + args[0] + "' not found.";
					}
				});
			});
		}
		if (message.length > 0)
			bot.say(client, receiver, message);
	};
	
	var unloadModuleCommand = function(client, from, to, args) {
		var receiver = bot.startsWith(to, '#') ? to : from,
			message,
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
		bot.say(client, receiver, message);
	};
	
	var reloadModuleCommand = function(client, from, to, args) {
		var receiver = bot.startsWith(to, '#') ? to : from,
			message,
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
		bot.say(client, receiver, message);
	};
	
	var lsmodCommand = function(client, from, to, args) {
		var receiver = bot.startsWith(to, '#') ? to : from,
			keys = Object.keys(modulePaths),
			count = 0,
			message = "",
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
						var isLoaded = bot.modules.some(function(mod){ return (mod.name + '.js') == file });
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
							bot.say(client, receiver, message);
							message = "";
						}
					}
					count++;
				}
			})(path));
		}
		if (message.length > 0)
			bot.say(client, receiver, message);
	};
	
	this.load = function(){
		bot.registerCommand('lsperms', lspermsCommand, false);
		bot.registerCommand('perms', permsCommand, 'admin');
		
		bot.registerCommand('help', helpCommand, false);
		
		bot.registerCommand('load', loadModuleCommand, 'admin');
		bot.registerCommand('unload', unloadModuleCommand, 'admin');
		bot.registerCommand('reload', reloadModuleCommand, 'admin');
		bot.registerCommand('lsmod', lsmodCommand, 'admin');
		
		console.log('core module utils loaded');
	};

	this.unload = function() {
		bot.deregisterCommand('lsperms', lspermsCommand);
		bot.deregisterCommand('perms', permsCommand);
		bot.deregisterCommand('help', helpCommand);
		
		bot.deregisterCommand('load', loadModuleCommand);
		bot.deregisterCommand('unload', unloadModuleCommand);
		bot.deregisterCommand('reload', reloadModuleCommand);
		bot.deregisterCommand('lsmod', lsmodCommand);
		
		console.log('core module utils unloaded');
	};
	
	this.load();
};