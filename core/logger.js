var util = require('util')
	fs = require('fs'),
	Mongolian = require('mongolian');

var Module = module.exports = function Module(bot){
	var self = this;
	self.bot = bot;
	
	self.dbLogs = self.bot.dbDatabase.collection('logs');
	self.dbErrors = self.bot.dbDatabase.collection('errors');
	
	self.load();
	
	console.log('core module logger loaded');
};

Module.prototype.load = function(){
	var self = this;
	
	self.dbHandler = self.database();
	self.fileHandler = self.file();
	self.consoleHandler = self.console();
	
	self.errorHandler = self.database(self.dbErrors);
	self.errorConsoleHandler = self.errorConsole();
	
	self.bot.addListener('logger', self.dbHandler);
	self.bot.addListener('logger', self.fileHandler);
	self.bot.addListener('logger', self.consoleHandler);
	
	self.bot.addListener('said', self.dbHandler);
	self.bot.addListener('said', self.fileHandler);
	self.bot.addListener('said', self.consoleHandler);
	
	self.bot.addListener('error', self.errorHandler);
	self.bot.addListener('error', self.errorConsoleHandler);
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bot.removeListener('logger', self.dbHandler);
	self.bot.removeListener('logger', self.fileHandler);
	self.bot.removeListener('logger', self.consoleHandler);
	
	self.bot.removeListener('said', self.dbHandler);
	self.bot.removeListener('said', self.fileHandler);
	self.bot.removeListener('said', self.consoleHandler);
	
	self.bot.removeListener('error', self.errorHandler);
	self.bot.removeListener('error', self.errorConsoleHandler);
};

Module.prototype.database = function(isError){
	var self = this;
	isError = isError || false;
	return function(client, from, to, message) {
		var item;
		if (Array.isArray(message)) { message = message.join(' '); }
		if (!isError) {
			self.dbLogs.insert({
				date: new Date(),
				server: client.opt.server,
				from: from,
				to: to,
				message: message
			});
		} else {
			message = from;
			self.dbErrors.insert({
				date: new Date(),
				server: client.opt.server,
				message: message
			});
		}
	};
};

Module.prototype.file = function() {
	var self = this;
	return function(client, from, to, message) {
		if (Array.isArray(message)) { message = message.join(' '); }
		var sender, time, path, file, date = new Date();
		function f(n){ return ((""+n).length == 1 ? "0":"") + n; };
		time = util.format("%s:%s:%s", f(date.getUTCHours()), f(date.getUTCMinutes()), f(date.getUTCSeconds()));
		text = util.format("[%s] <%s>\t%s\r\n", time, from, message);

		sender = self.bot.startsWith(to, '#') ? to : from;
		sender = (sender == self.bot.details.nick) ? to : sender;
		
		file = util.format("%s-%s-%s.txt", date.getUTCFullYear(), f((date.getUTCMonth() + 1) % 12), f(date.getUTCDate()));
		
		path = util.format("log/%s", client.opt.server);
		if (!fs.existsSync(path)) fs.mkdirSync(path);
		
		path = util.format("%s/%s", path, sender.replace(/[\\\[\]\{\}\^`\|]/g, '_'));
		if (!fs.existsSync(path)) fs.mkdirSync(path);
		
		fs.appendFile(path + '/' + file, text);
	};
};

Module.prototype.console = function(){
	var self = this;
	return function(client, from, to, message) {
		var time, date = new Date();
		if (Array.isArray(message)) { message = message.join(' '); }
		function f(n){ return ((""+n).length == 1 ? "0":"") + n; };
		
		time = util.format("%s:%s:%s", f(date.getUTCHours()), f(date.getUTCMinutes()), f(date.getUTCSeconds()));
		text = util.format("%s [%s] %s <%s>\t%s", time, client.opt.server, to, from, message);
		
		console.log(text);
	};
};

Module.prototype.errorConsole = function(){
	var self = this;
	return function(client, message) {
		var time, date = new Date();
		function f(n){ return ((""+n).length == 1 ? "0":"") + n; };
		
		time = util.format("%s:%s:%s", f(date.getUTCHours()), f(date.getUTCMinutes()), f(date.getUTCSeconds()));
		text = util.format("%s [%s]", time, client.opt.server);
		
		console.error('ERROR:', text, message);
	};
};