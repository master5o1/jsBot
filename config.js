var config = module.exports = {};

config.bot = {
	nick: "jsBot",
	pass: "",
	commandPrefix: '.'
};

// List of hostmasks that are to be
// considered as admin or banned.
config.users = {
	admin: [
		"unaffiliated/master5o1"
	],
	banned: []
};

config.servers = [
	{
		name: "Freenode",
		url: "irc.freenode.net",
		channels: [
			"##jsbot",
			"##master5o1",
		]
	},
	{
		name: "PirateIRC",
		url: "london-uk.pirateirc.net",
		channels: [
			"#jsbot",
		]
	}
];

// Modules to be loaded on startup.
config.modules = [
	"bridge.js",
	"markov.js",
	"lolcryption.js",
];