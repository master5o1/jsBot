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
	return function(client, from, to, message) {
		var time, date = new Date(),
		text = "{time} [{server}] {to} <{from}> {message}";
		text = text.replace("{server}", client.opt.server)
						 .replace("{from}", from)
						 .replace("{to}", to)
						 .replace("{message}", message);
		time = "h:m:s".replace("h", date.getUTCHours())
					  .replace("m", date.getUTCMinutes())
					  .replace("s", date.getUTCSeconds());
		text = text.replace("{time}", time);
		
		console.log(text);
	};
};