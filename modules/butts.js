
String.prototype.startsWith = function(start) {
	return this.substring(0, start.length) == start;
};

var Module = module.exports = function Module(bot){
	var self = this;
	self.bot = bot;
	
	self.probability = 0.01;
	
	self.load();
	
	console.log('module butts loaded');
};

Module.prototype.load = function(){
	var self = this;
	
	self.buttHandler = self.butt();
	self.setProbabilityHandler = self.setProbability();
	
	self.bot.registerCommand('butts_prob', self.setProbabilityHandler);
	self.bot.addListener('message', self.buttHandler);
};

Module.prototype.unload = function() {
	var self = this;
	self.bot.deregisterCommand('butts_prob', self.setProbabilityHandler);
	self.bot.removeListener('message', self.buttHandler);
};

Module.prototype.setProbability = function(){
	var self = this;
	return function(client, from, to, args) {
		var receiver = to.startsWith('#') ? to : from;
		var text = "Random butts probability is set to " + self.probability.toFixed(2) + ".";
		if (args.length == 0) {
			text = self.bot.help('butts_prob', "<float>");
		} else if (/number/i.test(typeof parseFloat(args[0])) && ! /nan/i.test(parseFloat(args[0]).toString())) {
			self.probability = parseFloat(args[0]);
			text = "Random butts generation probability is set to " + self.probability.toFixed(2) + ".";
		}
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
		
		if (Math.random() < self.probability)
			self.bot.emit('command_say', client, self.bot.details.nick, receiver, text_array);
	};
};