String.prototype.startsWith = function(start) {
	return this.substring(0, start.length) == start;
};

var Module = module.exports = function Module(bot){
	var self = this;
	self.bot = bot;
	
	bot.addListener('command_join', self.join());
	bot.addListener('command_part', self.part());
	
	console.log('module util loaded');
};

Module.prototype.join = function(){
	var self = this;
	return function(client, from, to, args) {
		var channel = args[0];
		client.join(channel);
	};
};

Module.prototype.part = function(){
	var self = this;
	return function(client, from, to, args) {
		var channel = args[0];
		if (!channel && to.startsWith('#')) channel = to;
		client.part(channel);
	};
};