var config = require('./config'),
	Bot = require('./core/bot');

var jsBot = new Bot(config);

jsBot.loadModules(true);
config.modules.forEach(function(file){
	jsBot.loadModule('../modules/', file);
});