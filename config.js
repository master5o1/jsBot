var config = module.exports = {};

config.bot = {
	nick: "jsBot",
	pass: "",
	commandPrefix: '!'
};

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
			"#jsBot",
		]
	},
	{
		name: "PirateIRC",
		url: "montreal-ca.pirateirc.net",
		channels: [
			"#master5o1",
		]
	},
];