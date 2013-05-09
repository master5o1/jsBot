var Module = module.exports = function Module(bot){
	
	var tr = function (str, inAlphabet, outAlphabet) {
		inAlphabet = inAlphabet || 'aeioubcdfghjklmnpqrstvwxyz';
		outAlphabet = outAlphabet || 'iouaenpqrstvwxyzbcdfghjklm';
		return str.replace(new RegExp('([' + inAlphabet + '])', 'ig'), function (value) {
			var index = inAlphabet.indexOf(value.toLowerCase());
			var c = outAlphabet[index] || value;
			return /[A-Z]/.test(value) ? c.toUpperCase() : c;
		});
	};

	var enlolcrypt = function (str) {
		return tr(str, 'aeioubcdfghjklmnpqrstvwxyz', 'iouaenpqrstvwxyzbcdfghjklm');
	};
	 
	var delolcrypt = function (str) {
		return tr(str, 'iouaenpqrstvwxyzbcdfghjklm', 'aeioubcdfghjklmnpqrstvwxyz');
	};
	
	var enLolcryptHandler = function(client, from, to, args){
		var text, receiver = bot.startsWith(to, '#') ? to : from;
		if (args.length == 0) {
			text = bot.help('enlolcrypt','<plaintext>');
		} else {
			text = enlolcrypt(args.join(' '));
		}
		bot.say(client, receiver, text);
	};
	
	var deLolcryptHandler = function(client, from, to, args){
		var text, receiver = bot.startsWith(to, '#') ? to : from;
		if (args.length == 0) {
			text = bot.help('delolcrypt','<ciphertext>');
		} else {
			text = delolcrypt(args.join(' '));
		}
		bot.say(client, receiver, text);
	};
	
	this.load = function(){
		bot.registerCommand('enlolcrypt', enLolcryptHandler);
		bot.registerCommand('delolcrypt', deLolcryptHandler);
		console.log('module lolcryption loaded');
	};

	this.unload = function() {		
		bot.deregisterCommand('enlolcrypt', enLolcryptHandler);
		bot.deregisterCommand('delolcrypt', deLolcryptHandler);
		console.log('module lolcryption unloaded');
	};
	
	this.load();
};
