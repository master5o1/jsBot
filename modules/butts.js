module.exports = function Module(bot){
	var self = this;
	var probability = 0.01;
	
	var setProbability = function(client, from, to, args) {
		var receiver = bot.startsWith(to, '#') ? to : from;
		var text = "Random butts probability is set to " + probability.toFixed(2) + ".";
		if (args.length == 0) {
			text = bot.help('butts_prob', "<float>");
		} else if (/number/i.test(typeof parseFloat(args[0])) && ! /nan/i.test(parseFloat(args[0]).toString())) {
			probability = parseFloat(args[0]);
			text = "Random butts generation probability is set to " + probability.toFixed(2) + ".";
		}
		bot.say(client, receiver, text);
	};
	
	var buttHandler = function(client, from, to, message) {
		var receiver = bot.startsWith(to, '#') ? to : from,
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
			}).join(' ');
		
		if (text == message) { return; }
		
		if (Math.random() < probability)
			bot.say(client, receiver, text);
	};
	
	
	this.load = function(){		
		bot.registerCommand('butts_prob', setProbability);
		bot.addListener('message', buttHandler);
		console.log('module butts loaded');
	};

	this.unload = function() {
		bot.deregisterCommand('butts_prob', setProbability);
		bot.removeListener('message', buttHandler);
		console.log('module butts unloaded');
	};

	this.load();
};
