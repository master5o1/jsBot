
String.prototype.startsWith = function(start) {
	return this.substring(0, start.length) == start;
};

var Module = module.exports = function Module(bot){
	var self = this;
	self.bot = bot;
	
	self.load();
	
	console.log('module butts loaded');
};

Module.prototype.load = function(){
	var self = this;
	
	self.buttHandler = self.butt();
	
	self.bot.addListener('message', self.buttHandler);
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bot.removeListener('message', self.buttHandler);
};

Module.prototype.butt = function(){
	var self = this;
	return function(client, from, to, message) {
		var receiver;
		
		receiver = to.startsWith('#') ? to : from;
		text = message.split(' ').map(function(word, index, arr) {
			if (word.length == 4 && index == Math.round(arr.length * Math.random())) {
				return 'butt';
			}
			if (word.length == 5 && word.substring(4) == 's') {
				return 'butts';
			}
			if (word.length > 4 && index == Math.round(arr.length * Math.random())) {
				return 'poop';
			}
			return word;
		});
		
		if (text.join(' ') == message) { return; }
		
		if (Math.random() > 0.8)
			self.bot.emit('command_say', client, from, to, text);
	};
};