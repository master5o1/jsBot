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

fs.readFile(filename, function(err, data) {
	var lines = data.toString().split(/\r?\n/);
	lines.forEach(function(line, index){
		generate_keys(line, index, lines.length);
	});
});

var generate_keys = function(message, _index, __count) {
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
	
	console.log(dict);
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
			console.log('saved item', _index, __count);
		});
	});
};