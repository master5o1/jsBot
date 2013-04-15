module.exports = function Module(bot){
	var self = this;
	var default_probability = 0.02;
	var custom_probabilities = {};
	
	
	var setProbability = function(client, from, to, args) {
		var receiver = bot.startsWith(to, '#') ? to : from;
		var prob_key = client.opt.server + '/' + receiver;
		var probability = typeof custom_probabilities[prob_key] == 'number' ? custom_probabilities[prob_key] : default_probability;
		var text = 'Butts probability for ' + prob_key + ' is set to ' + probability.toFixed(2) + '.';
		if (args.length == 0) {
			text = bot.help('markov_prob', "<float>");
		} else if (/number/i.test(typeof parseFloat(args[0])) && ! /nan/i.test(parseFloat(args[0]).toString())) {
			custom_probabilities[prob_key] = parseFloat(args[0]);
			probability = typeof custom_probabilities[prob_key] == 'number' ? custom_probabilities[prob_key] : default_probability;
			text = 'Random butts probability for ' + prob_key + ' is set to ' + probability.toFixed(2) + '.';
		}
		bot.say(client, receiver, text);
	};
	
	var listProbability = function(client, from, to, args) {
		var text = 'Butts Probabilities: default = ' + default_probability + '\n';
		text += Object.keys(custom_probabilities).map(function(key){
			return key + ' has probability of ' + custom_probabilities[key];
		}).join('\n');
		bot.say(client, from, text);
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
		
		bot.say(client, receiver, text);
	};
	
	var buttsCommand = function(client, from, to, args){
		var channel = bot.startsWith(to, '#') ? to : null,
			isChanOp = false;
			receiver = bot.startsWith(to, '#') ? to : from,
			isAdmin = bot.details.admin.some(function(user){
				return user.host == bot.users[from].host && user.account == bot.users[from].account;
			});
		if (args.length == 0) {
			bot.say(client, receiver, bot.help('butts', '(list|probability <float>|<words to buttify>)'));
			return
		}
		if (args[0] == 'list') {
			listProbability(client, from, to, args);
		} else if (args[0] == 'probability') {
			if (args.length == 1) args.push('what');
			if (!!channel) isChanOp = /@/.test(client.chans[channel.toLowerCase()].users[from]);
			receiver = from;
			if (bot.startsWith(to, '#') && (isChanOp || isAdmin)) {
				receiver = to
			}
			setProbability(client, receiver, receiver, args.slice(1)); // users can only set their own one.
		} else {
			buttHandler(client, from, to, args.join(' '));
		}
	};
	
	var onProbability = function(client, from, to, message) {
		var receiver = bot.startsWith(to, '#') ? to : from;
		var prob_key = client.opt.server + '/' + receiver;
		var probability = typeof custom_probabilities[prob_key] == 'number' ? custom_probabilities[prob_key] : default_probability;
		if (Math.random() <= probability)
			buttHandler(client, from, to, message);
	};
	
	
	this.load = function(){		
		bot.registerCommand('butts', buttsCommand);
		bot.addListener('message', onProbability);
		console.log('module butts loaded');
	};

	this.unload = function() {
		bot.deregisterCommand('butts', buttsCommand);
		bot.removeListener('message', onProbability);
		console.log('module butts unloaded');
	};

	this.load();
};
