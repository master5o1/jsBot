var util = require('util');

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
	self.bot.addListener('message', self.consoleHandler);
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bot.removeListener('message', self.consoleHandler);
};

Module.prototype.console = function(){
	var self = this;
	function f(n){ return ((""+n).length == 1 ? "0":"") + n; };
	return function(client, from, to, message) {
		var time, date = new Date(),
		time = util.format("%s:%s:%s", f(date.getUTCHours()), f(date.getUTCMinutes()), f(date.getUTCSeconds()));
		text = util.format("%s [%s] %s <%s> %s", time, client.opt.server, to, from, message);
		console.log(text);
	};
};