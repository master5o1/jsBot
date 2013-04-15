var config = module.exports = {};

config.bot = {
	nick: "Bunge_",
	pass: "",
	commandPrefix: '.'
};

// List of hostmasks that are to be
// considered as admin or banned.
config.users = {
	admin: [
		{ host: "unaffiliated/master5o1", account: "master5o1" },
		{ host: "PirateParty/NZ/Member", account: "master5o1" }
	],
	banned: []
};

config.servers = [
	{
		name: "Freenode",
		url: "irc.freenode.net",
		channels: [
			"##jsbot",
			"#ualug",
			"##bikes",
			"#bitcoin-pricetalk",
			"#mtgoxlive",
			"#node.js"
		]
	},
	{
		name: "PirateIRC",
		url: "london-uk.pirateirc.net",
		channels: [
			"#ppnz"
		]
	}
];

// Modules to be loaded on startup.
config.modules = [
	"bridge.js",
	"markov.js",
	"lolcryption.js",
	"fun.js"
];