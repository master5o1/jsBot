
String.prototype.enlolcrypt = function (cipher) {
    cipher = cipher || "aeoiubcdfghjklmnpqrstvwxyz";
    return this.split("").map(function (T) {
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
 
String.prototype.delolcrypt = function (cipher) {
    cipher = cipher || "aeoiubcdfghjklmnpqrstvwxyz";
    return this.split("").map(function (T) {
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

var Module = module.exports = function Module(bot){
	var self = this;
	self.bot = bot;
		
	self.load();
	
	console.log('module lolcryption loaded');
};

Module.prototype.load = function(){
	var self = this;
	
	self.enlolcryptHandler = self.lolcrypt(false);
	self.delolcryptHandler = self.lolcrypt(true);
	
	self.bot.registerCommand('enlolcrypt', self.enlolcryptHandler);
	self.bot.registerCommand('delolcrypt', self.delolcryptHandler);
};

Module.prototype.unload = function() {
	var self = this;
	
	self.bot.deregisterCommand('enlolcrypt', self.enlolcryptHandler);
	self.bot.deregisterCommand('delolcrypt', self.delolcryptHandler);
};

Module.prototype.lolcrypt = function(decrypt){
	var self = this;
	return function(client, from, to, args){
		var text, receiver = self.bot.startsWith(to, '#') ? to : from;
		
		if (args.length == 0) {
			if (decrypt) {
				text = self.bot.help('delolcrypt','<ciphertext>');
			} else {
				text = self.bot.help('enlolcrypt','<plaintext>');
			}
		} else {
			text = args.join(' ')[decrypt ? 'enlolcrypt' : 'delolcrypt']();
		}
		self.bot.emit('command_say', client, self.bot.details.nick, receiver, text.split(' '));
	};
};