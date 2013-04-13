var Module = module.exports = function Module(bot){
	var self = this;
	self.bot = bot;
	
	self.load();
	
	console.log('module fun loaded');
};

Module.prototype.load = function(){
	var self = this;
	
	self.magic8ballHandler = self.magic8ball();
	self.sortinghatHandler = self.sortinghat();
	
	self.bot.registerCommand('8ball', self.magic8ballHandler);
	self.bot.registerCommand('sortinghat', self.sortinghatHandler);
};

Module.prototype.unload = function() {
	var self = this;
	self.bot.deregisterCommand('8ball', self.magic8ballHandler);
	self.bot.deregisterCommand('sortinghat', self.sortinghatHandler);
};

Module.prototype.magic8ball = function(){
	var self = this,
		responses = [
			"It is certain.", "It is decidedly so.", "Without a doubt.", "Yes - definitely.", "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.", "Signs point to yes.", "Yes.",
			"Reply hazy, try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.",
			"Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful."
		];
	return function(client, from, to, args) {
		var key, text = "",
			receiver = self.bot.startsWith(to, '#') ? to : from;
		if (args.length == 0) {
			text = self.bot.help('8ball', "<question>");
		} else {
			key = Math.round(Math.random()*(responses.length+1))%responses.length;
			text = responses[key];
		}
		self.bot.emit('command_say', client, self.bot.details.nick, receiver, text.split(' '));
	};
};

Module.prototype.sortinghat = function(){
	var self = this,
		houses = ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'];
	return function(client, from, to, args) {
		var nick, key, text = "";
		if (args.length == 0 || !self.bot.startsWith(to, '#')) {
			text = self.bot.help('sortinghat', "<nick>");
		} else {
			nick = args[0];
			if (typeof client.chans[to].users[nick] == 'undefined') {
				text = "But they're not here!";
			} else {
				key = nick.split('').reduce(function(p, c){
					return p + c.charCodeAt(0);
				}, 0) % houses.length;
				text = houses[key] + '!';
			}
		}
		self.bot.emit('command_say', client, self.bot.details.nick, to, text.split(' '));
	};
};