var config = module.exports = {};

config.bot = {
	nick: "jsBot",
	pass: "",
	commandPrefix: '.'
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
			"#ualug",
			"##bikes",
		]
	},
	// {
		// name: "PirateIRC",
		// url: "london-uk.pirateirc.net",
		// channels: [
			// "#ppnz",
		// ]
	// }
];