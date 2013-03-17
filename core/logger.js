var util = require('util')
	fs = require('fs'),
	Mongolian = require('mongolian');

String.prototype.startsWith = function(start) {
	return this.substring(0, start.length) == start;
};

var Module = module.exports = function Module(bot){
	var self = this;
	self.bot = bot;
	
	self.dbLogs = self.bot.dbDatabase.collection('logs');
	
	self.load();
	
	console.log('core module logger loaded');
};

Module.prototype.load = function(){
	var self = this;
	
	self.dbHandler = self.database();
	self.fileHandler = self.file();
	self.consoleHandler = self.console();
	
	self.bot.addListener('message', self.dbHandler);
	self.bot.addListener('message', self.fileHandler);
	self.bot.addListener('message', self.consoleHandler);
	
	self.bot.addListener('said', self.dbHandler);
	self.bot.addListener('said', self.fileHandler);
	self.bot.addListener('said', self.consoleHandler);
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bot.removeListener('message', self.dbHandler);
	self.bot.removeListener('message', self.fileHandler);
	self.bot.removeListener('message', self.consoleHandler);
	
	self.bot.removeListener('said', self.dbHandler);
	self.bot.removeListener('said', self.fileHandler);
	self.bot.removeListener('said', self.consoleHandler);
};

Module.prototype.database = function(){
	var self = this;
	return function(client, from, to, message) {
		self.dbLogs.insert({
			date: new Date(),
			server: client.opt.server,
			from: from,
			to: to,
			message: message
		});
	};
};

Module.prototype.file = function() {
	var self = this;
	return function(client, from, to, message) {
		var sender, time, path, file, date = new Date();
		function f(n){ return ((""+n).length == 1 ? "0":"") + n; };
		time = util.format("%s:%s:%s", f(date.getUTCHours()), f(date.getUTCMinutes()), f(date.getUTCSeconds()));
		text = util.format("[%s] <%s>\t%s\r\n", time, from, message);

		sender = to.startsWith('#') ? to : from;
		sender = (sender == self.bot.details.nick) ? to : sender;
		
		file = util.format("%s-%s-%s.txt", date.getUTCFullYear(), f((date.getUTCMonth() + 1) % 12), f(date.getUTCDate()));
		
		path = util.format("log/%s", client.opt.server);
		if (!fs.existsSync(path)) fs.mkdirSync(path);
		
		path = util.format("%s/%s", path, sender);
		if (!fs.existsSync(path)) fs.mkdirSync(path);
		
		fs.appendFile(path + '/' + file, text);
	};
};

Module.prototype.console = function(){
	var self = this;
	return function(client, from, to, message) {
		var time, date = new Date();
		function f(n){ return ((""+n).length == 1 ? "0":"") + n; };
		
		time = util.format("%s:%s:%s", f(date.getUTCHours()), f(date.getUTCMinutes()), f(date.getUTCSeconds()));
		text = util.format("%s [%s] %s <%s>\t%s", time, client.opt.server, to, from, message);
		
		console.log(text);
	};
};