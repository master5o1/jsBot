var config = require('./config'),
	Bot = require('./core/bot');

var jsBot = new Bot(config);

jsBot.loadModules();