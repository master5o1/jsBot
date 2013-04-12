var fs = require('fs'),
	Mongolian = require('mongolian');

if (process.argv.length < 3) {
	console.log('Usage: node ./markov_generator.js input.txt');
	process.exit();
}

var filename = process.argv[2];
	
var dbServer = new Mongolian();
var dbDatabase = dbServer.db('jsBot');
var dbMarkov = dbDatabase.collection('markov');
var dbLogs = dbDatabase.collection('logs');

if (filename != '--database') {
	fs.readFile(filename, function(err, data) {
		var lines = data.toString().split(/\r?\n/);
		lines.forEach(function(line, index){
			generate_keys(line, index, lines.length);
		});
	});
} else {
	var cursor = dbLogs.find({ from: /[^(jsbot)|(bunge)]/i });
	cursor.count(function(err, count){
		var i = 0;
		console.log(count);
		cursor.forEach(function(log){
			generate_keys(log.message, ++i, count);
		});
	});
}
var generate_keys = function(message, __index, __count) {
	var dict, i, words, first, second, third, key;
	function saveMarkov() {
		Object.keys(dict).forEach(function(key, _index, arr){
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
				console.log("[" + __index + "/" + __count + "]", 'saved item', _index, 'of', arr.length);
				if (__index == __count) {
					console.log("\nGoodbye.");
					process.exit();
				}
			});
		});
	}
	
	if (typeof message != 'string' || message.length < 3) return;
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
	
	saveMarkov();
	// console.log(dict);
};