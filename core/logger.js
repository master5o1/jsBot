var util = require('util')
	fs = require('fs');

String.prototype.startsWith = function(start) {
	return this.substring(0, start.length) == start;
};

var Module = module.exports = function Module(bot){
	var self = this;
	self.bot = bot;
	
	self.load();
	
	console.log('core module logger loaded');
};

Module.prototype.load = function(){
	var self = this;
	
	self.consoleHandler = self.console();
	self.fileHandler = self.file();
	
	self.bot.addListener('message', self.consoleHandler);
	self.bot.addListener('message', self.fileHandler);
	
	self.bot.addListener('said', self.consoleHandler);
	self.bot.addListener('said', self.fileHandler);
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bot.removeListener('message', self.consoleHandler);
	self.bot.removeListener('message', self.fileHandler);
	
	self.bot.removeListener('said', self.consoleHandler);
	self.bot.removeListener('said', self.fileHandler);
};

Module.prototype.file = function() {
	var self = this;
	return function(client, from, to, message) {
		var sender, time, path, file, date = new Date();
		function f(n){ return ((""+n).length == 1 ? "0":"") + n; };
		time = util.format("%s:%s:%s", f(date.getUTCHours()), f(date.getUTCMinutes()), f(date.getUTCSeconds()));
		text = util.format("[%s] <%s>\t%s\r\n", time, from, message);

		sender = to.startsWith('#') ? to : from;
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