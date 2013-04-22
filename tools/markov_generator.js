var fs = require('fs'),
	Mongolian = require('mongolian'),
	http = require('http');

if (process.argv.length < 3) {
	console.log('Usage: node ./markov_generator.js input.txt');
	process.exit();
}

var filename = process.argv[2];
	
var dbServer = new Mongolian();
var dbDatabase = dbServer.db('jsBot');
var dbMarkov = dbDatabase.collection('markov');
var dbLogs = dbDatabase.collection('logs');

if (filename == '--database') {
	var cursor = dbLogs.find({ from: /[^(jsbot)|(bunge)]/i });
	cursor.count(function(err, count){
		var i = 0;
		console.log(count);
		cursor.forEach(function(log){
			generate_keys(log.message, ++i, count);
		});
	});
} else if (filename == '--bash.org') {
	// 419 = number of pages bash.org has at time of writing. Hard coded because easier.
	var pages = new Array(419).join(' ').split(' ').map(function(e,i){return i+1;});
	var _url = "http://bash.org/?browse&p=";
	var markov_lines = [];
	pages.forEach(function(page, index){
		var url = _url + page;
		http.get(url, function(res) {
			var pageData = "";
			res.on('data', function(chunk){
				pageData += chunk;
			}).on('end', function(){
				var quotes = pageData.match(/<p class=\"qt\">([^`]*?)<\/p>/g);
				quotes.forEach(function(quote, _index) {
					var lines = quote.split(/<br\ \/>\r?\n?/);
					lines.forEach(function(line, __index){
						var sanitised = line.replace(/<\/?[a-z][^>]*>/gi, '')
											.replace(/&lt;/, '<')
											.replace(/&gt;/, '>');
						if (sanitised.substring(0, 1) != '<' || sanitised.substring(0, 3) == '<--') return;
						sanitised = sanitised.replace(/^<[^>]+>/, '');
						console.log("receiving...", __index, _index, url);
						markov_lines.push(sanitised);
					});
				});
				if ((index+1) == pages.length) {
					markov_lines.forEach(function(line, _index){
						generate_keys(line, _index, markov_lines.length);
					});
				}
			});
		});
	});
} else if (filename == '--qdb.us') {
	// 566 = number of pages qdb.us has at time of writing. Hard coded because easier.
	var pages = new Array(55).join(' ').split(' ').map(function(e,i){return i+1;});
	var _url = "http://qdb.us/latest/";
	var markov_lines = [];
	pages.forEach(function(page, index){
		var url = _url + page;
		http.get(url, function(res) {
			var pageData = "";
			res.on('data', function(chunk){
				pageData += chunk;
			}).on('end', function(){
				// <span class="qt" id="qt308868">
				var quotes = pageData.match(/<span class=\"?qt\"? id\"?.*\"?>([^`]*?)<\/span>/ig);
				quotes.forEach(function(quote, _index) {
					var lines = quote.split(/<br\ \/>\r?\n?/);
					lines.forEach(function(line, __index){
						var sanitised = line.replace(/<\/?[a-z][^>]*>/gi, '')
											.replace(/&lt;/, '<')
											.replace(/&gt;/, '>')
											.replace(/\&quot;/g, "'");
						if (sanitised.substring(0, 1) != '<' || sanitised.substring(0, 3) == '<--') return;
						sanitised = sanitised.replace(/^<[^>]+>/, '');
						console.log("receiving...", __index, _index, url);
						markov_lines.push(sanitised);
					});
				});
				if ((index+1) == pages.length) {
					markov_lines.forEach(function(line, _index){
						generate_keys(line, _index, markov_lines.length);
					});
				}
			});
		});
	});
} else {
	fs.readFile(filename, function(err, data) {
		var lines = data.toString().split(/\r?\n/);
		lines.forEach(function(line, index){
			generate_keys(line, index, lines.length);
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
};