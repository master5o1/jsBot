
String.prototype.startsWith = function(start) {
	return this.substring(0, start.length) == start;
};

var Module = module.exports = function Module(bot){
	var self = this;
	self.bot = bot;
	
	self.probability = 0.80;
	
	self.load();
	
	console.log('module butts loaded');
};

Module.prototype.load = function(){
	var self = this;
	
	self.buttHandler = self.butt();
	self.buttHelper = self.buttHelp();
	
	self.bot.registerCommand('butts', self.buttHelper);
	
	self.bot.addListener('message', self.buttHandler);
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bot.removeListener('message', self.buttHandler);
	
	self.bot.deregisterCommand('butts', self.buttHelper);
};

Module.prototype.buttHelp = function(){
	var self = this;
	return function(client, from, to, args){
		var receiver = to.startsWith('#') ? to : from;
		
		text = self.bot.help('butts', 'An ' + self.probability*100 + '% chance of echoing a line with some words replaced.');
		
		self.bot.emit('command_say', client, self.bot.details.nick, receiver, text.split(' '));
	};
};

Module.prototype.butt = function(){
	var self = this;
	return function(client, from, to, message) {
		var receiver, text_array;
		
		receiver = to.startsWith('#') ? to : from;
		text_array = message.split(' ').map(function(word, index, arr) {
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
		
		if (text_array.join(' ') == message) { return; }
		
		if (Math.random() > self.probability)
			self.bot.emit('command_say', client, self.bot.details.nick, receiver, text_array);
	};
};