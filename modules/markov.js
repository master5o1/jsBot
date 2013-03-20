var Mongolian = require('mongolian');

String.prototype.startsWith = function(start) {
	return this.substring(0, start.length) == start;
};

var Module = module.exports = function Module(bot){
	var self = this;
	self.bot = bot;
	
	self.probability = 0.02;
	self.max_words = 50;
	
	self.dbMarkov = self.bot.dbDatabase.collection('markov');
	
	self.load();
	
	console.log('module markov loaded');
};

Module.prototype.load = function(){
	var self = this;
	
	self.builderHandler = self.builder();
	self.probabilityHandler = self.probable();
	self.markovReplyHandler = self.markovReply();
	self.setProbHandler = self.setProbability();
	self.gatherHandler = self.gather();
	
	self.bot.registerCommand('markov', self.builderHandler);
	self.bot.registerCommand('markov_prob', self.setProbHandler);
	self.bot.addListener('message', self.probabilityHandler);
	self.bot.addListener('message', self.markovReplyHandler);
	self.bot.addListener('message', self.gatherHandler);
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bot.deregisterCommand('markov', self.builderHandler);
	self.bot.deregisterCommand('markov_prob', self.setProbHandler);
	self.bot.removeListener('message', self.probabilityHandler);
	self.bot.removeListener('message', self.markovReplyHandler);
	self.bot.removeListener('message', self.gatherHandler);
};

Module.prototype.builder = function(){
	var self = this;
	return function(client, from, to, args){
		var reply = '',
			dict = {},
			receiver = to.startsWith('#') ? to : from;
		// console.log('Building Markov String');
		
		if (args.length > 0 && args[0])
			reply = from + ':';
		
		function build_string(dict, length) {
			var dict_keys = [];
			length = length || self.max_words;
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
		
		self.dbMarkov.count(function(err, count){
			var skip = Math.round(Math.random() * count+1) % count;
			var cursor = self.dbMarkov.find({}).skip(skip).limit(1);
			function findWords(cursor) {
				cursor.toArray(function(err, data){
					var item, next_key, next_word, build_str;
					if (err) return;
					if (data.length == 0) {
						if (dict) {
							var build_str = build_string(dict).split(' ');
							if (reply.length > 0) build_str.unshift(reply);
							self.bot.emit('command_say', client, self.bot.details.nick, receiver, build_str);
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
						findWords(self.dbMarkov.find({key: next_key}).limit(1));
					}
				});
			}
			findWords(cursor);
		});
	};
};

Module.prototype.probable = function(){
	var self = this;
	return function(client, from, to, message) {
		if (Math.random() < self.probability)
			self.bot.emit('command_markov', client, from, to, []);
	};
};

Module.prototype.markovReply = function(){
	var self = this;
	return function(client, from, to, message) {
		if (message.split(' ')[0].startsWith(self.bot.details.nick))
			self.bot.emit('command_markov', client, from, to, [true]);
	};
};

Module.prototype.setProbability = function(){
	var self = this;
	return function(client, from, to, args) {
		var receiver = to.startsWith('#') ? to : from;
		var text = "Random markov generation probability is set to " + self.probability.toFixed(2) + ".";
		if (args.length == 0) {
			text = self.bot.help('markov_prob', "<float>");
		} else if (/number/i.test(typeof parseFloat(args[0])) && ! /nan/i.test(parseFloat(args[0]).toString())) {
			self.probability = parseFloat(args[0]);
			text = "Random markov generation probability is set to " + self.probability.toFixed(2) + ".";
		}
		self.bot.emit('command_say', client, self.bot.details.nick, receiver, text.split(' '));
	};
};

Module.prototype.gather = function(){
	var self = this;
	return function(client, from, to, message) {
		var dict, i, words, first, second, third, key;
		if (message.length < 3) return;
		// console.log('Adding words to Markov DB');
		
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
			self.dbMarkov.findOne({ key: key }, function(err, item){
				var updated_words = [];
				if (typeof item == 'undefined') {
					self.dbMarkov.insert({
						key: key,
						words: dict[key]
					});
				} else {
					updated_words = dict[key].concat(item.words);
					item.words = updated_words;
					self.dbMarkov.save(item);
				}
			});
		});
	};
};