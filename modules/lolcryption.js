var Module = module.exports = function Module(bot){

	var enlolcrypt = function (str, cipher) {
		cipher = cipher || "aeioubcdfghjklmnpqrstvwxyz";
		return str.split("").map(function (T) {
			var c = /[A-Z]/.test(T), T = T.toLowerCase(), i = cipher.indexOf(T);
			if (/[^a-z]/.test(T)) { return T; }
	 
			if ((new RegExp("["+cipher.substr(0,5)+"]")).test(T)) {
			  T = cipher[(i+2)%5];
			} else {
			  T = cipher[(i+5)%21+5];
			}
	 
			return c?T.toUpperCase():T;
		}).join("");
	};
	 
	var delolcrypt = function (str, cipher) {
		cipher = cipher || "aeioubcdfghjklmnpqrstvwxyz";
		return str.split("").map(function (T) {
			var c = /[A-Z]/.test(T), T = T.toLowerCase(), i = cipher.indexOf(T),
				mod = function(a,n) {return ((a%n)+n)%n;};
			if (/[^a-z]/.test(T)) { return T; }
	 
			if ((new RegExp("["+cipher.substr(0,5)+"]")).test(T)) {
			  T = cipher[mod(i-2,5)];
			} else {
			  T = cipher[mod(i-15,21)+5];
			}
	 
			return c?T.toUpperCase():T;
		}).join("");
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