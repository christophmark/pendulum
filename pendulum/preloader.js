
BasicGame.Preloader = function (game) {
};

BasicGame.Preloader.prototype = {

	preload: function () {
		this.load.bitmapFont('carrier_command', 'assets/carrier_command.png', 'assets/carrier_command.xml');

		this.load.spritesheet('player', 'assets/player.png', 52, 72);
        this.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);

		this.load.image('cloud', 'assets/cloud.png');
		this.load.image('cloud_finish', 'assets/cloud_finish.png');
		this.load.image('gem', 'assets/gem.png');
		this.load.image('bullet', 'assets/bullet.png');
        this.load.image('hud_gem', 'assets/hud_gem.png');
		this.load.image('indicator', 'assets/indicator.png');
	},

	create: function () {
	},

	update: function () {
        this.state.start('MainMenu');
	}

};
