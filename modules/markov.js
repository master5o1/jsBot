var Mongolian = require('mongolian');

var Module = module.exports = function Module(bot){
	var self = this;
	var dbMarkov = bot.dbDatabase.collection('markov');
	var default_probability = 0.02;
	var max_words = 25;
	var custom_probabilities = {}; // { 'irc.freenode.net/#ualug': 0.00 }
	
	var gather = function(client, from, to, message) {
		var dict, i, words, first, second, third, key;
		if (message.length < 3) return;
		
		dict = {};
		i = 0;
		words = message.split(' ');
		first = words[i++];
		second = words[i++];
		while (i < words.length) {
			third = words[i++];
			key = first + ' ' + second;
			if (typeof dict[key] == 'undefined') { dict[key] = []; }
			dict[key].push(third);
			first = second;
			second = third;
		};
		
		Object.keys(dict).forEach(function(key){
			dbMarkov.findOne({ key: key }, function(err, item){
				var updated_words = [];
				if (typeof item == 'undefined') {
					dbMarkov.insert({
						key: key,
						words: dict[key]
					});
				} else {
					updated_words = dict[key].concat(item.words);
					item.words = updated_words;
					dbMarkov.save(item);
				}
			});
		});
	};
	
	var setProbability = function(client, from, to, args) {
		var receiver = bot.startsWith(to, '#') ? to : from;
		var prob_key = client.opt.server + '/' + receiver;
		var probability = typeof custom_probabilities[prob_key] == 'number' ? custom_probabilities[prob_key] : default_probability;
		var text = 'Markov probability for ' + prob_key + ' is set to ' + probability.toFixed(2) + '.';
		if (args.length == 0) {
			text = bot.help('markov_prob', "<float>");
		} else if (/number/i.test(typeof parseFloat(args[0])) && ! /nan/i.test(parseFloat(args[0]).toString())) {
			custom_probabilities[prob_key] = parseFloat(args[0]);
			probability = typeof custom_probabilities[prob_key] == 'number' ? custom_probabilities[prob_key] : default_probability;
			text = 'Markov probability for ' + prob_key + ' is set to ' + probability.toFixed(2) + '.';
		}
		bot.say(client, receiver, text);
	};
	
	var listProbability = function(client, from, to, args) {
		var text = 'Markov Probabilities: default = ' + default_probability + '\n';
		text += Object.keys(custom_probabilities).map(function(key){
			return key + ' has probability of ' + custom_probabilities[key];
		}).join('\n');
		bot.say(client, from, text);
	};
	
	var builder = function(client, from, to, args){
		var dict = {},
			receiver = bot.startsWith(to, '#') ? to : from;
		
		function build_string(dict, length) {
			var dict_keys = [];
			length = length || max_words;
			for (var k in dict) { dict_keys.push(k); }
			var start_key = Math.round(Math.random()*dict_keys.length)%dict_keys.length;
			var key = dict_keys[start_key];
			var str = key;
			while (str.split(" ").length < length) {
				var value = dict[key];
				str = str + " " + value;
				key = key.split(" ")[1] + " " + value;
				if (typeof dict[key] == 'undefined') { break; }
			}
			return str;
		};
		
		dbMarkov.count(function(err, count){
			function findWords(cursor, cursor_default) {
				cursor.toArray(function(err, data){
					var item, next_key, next_word;
					if (err) return;
					if (data.length == 0 && typeof cursor_default != 'undefined') {
						findWords(cursor_default);
						return;
					}
					if (data.length == 0) {
						if (dict) {
							bot.say(client, receiver, build_string(dict));
						}
						return
					};
					item = data[0];
					if (item.words.length == 0) {
						return;
					} else {
						next_word = Math.round(Math.random()*item.words.length) % item.words.length;
						next_key = item.key.split(' ').concat(item.words[next_word]).slice(1).join(' ');
						dict[item.key] = item.words[next_word];
						findWords(dbMarkov.find({key: next_key}).limit(1));
					}
				});
			}
			var skip = Math.round(Math.random() * count+1) % count,
				starting_key = {},
				cursor = dbMarkov.find(starting_key).skip(skip).limit(1),
				default_cursor = dbMarkov.find(starting_key).skip(skip).limit(1);
			if (args.length > 0) {
				start = Math.round(Math.random() * (args.length + 1)) % args.length;
				finish = start + 2;
				cursor = dbMarkov.find({ key: args.slice(start, finish).join(' ') }).limit(1);
			}
			findWords(cursor, default_cursor);
		});
	};
	
	var markovCommand = function(client, from, to, args){
		var receiver = bot.startsWith(to, '#') ? to : from;
		if (args.length == 0) {
			bot.say(client, receiver, bot.help('markov', '(list|say <words>|probability <float>)'));
			return
		}
		if (args[0] == 'list') {
			listProbability(client, from, to, args);
		} else if (args[0] == 'say') {
			builder(client, from, to, args.slice(1));
		} else if (args[0] == 'probability' && args.length > 1) {
			setProbability(client, from, from, args.slice(1)); // users can only set their own one.
		}
	};
	
	var markovOpCommand = function(client, from, to, args){
		var receiver = bot.startsWith(to, '#') ? to : from;
		if (!bot.startsWith(to, '#')) {
			bot.say(client, receiver, 'Say this command from a channel that you are op in');
			return
		}
		if (args.length == 0) {
			bot.say(client, receiver, bot.help('markov_op', '<float>'));
			return;
		}
		setProbability(client, from, to, args);
	};
	
	var onProbability = function(client, from, to, message) {
		var receiver = bot.startsWith(to, '#') ? to : from;
		var prob_key = client.opt.server + '/' + receiver;
		var probability = typeof custom_probabilities[prob_key] == 'number' ? custom_probabilities[prob_key] : default_probability;
		if (Math.random() <= probability)
			builder(client, from, to, message.split(' '));
	};
	
	this.load = function(){
		bot.addListener('message', onProbability);
		bot.addListener('message', gather);
		
		bot.registerCommand('markov_op', markovOpCommand, 'op');
		bot.registerCommand('markov', markovCommand);
		
		console.log('module markov loaded');
	};
	
	this.unload = function() {	
		bot.removeListener('message', onProbability);
		bot.removeListener('message', gather);
		
		bot.deregisterCommand('markov_op', markovOpCommand);
		bot.deregisterCommand('markov', markovCommand);
		
		console.log('module markov unloaded');
	};
	
	this.load();
};