var config = require('./config'),
	Bot = require('./core/bot'),
	fs = require('fs');
	
var jsBot = new Bot(config);

['./core', './modules'].forEach(function(path){
	fs.readdir(path, function(err, files){
		if (err) {
			console.log('fs.readdir error', err);
			return;
		}
		files.filter(function(file){
			return file != 'bot.js';
		}).forEach(function(file, index) {
			var module = require(path + '/' + file);
			console.log('loading core:', index, file);
			jsBot.addModule(module, file, path == './core');
		}, jsBot);
	});
});