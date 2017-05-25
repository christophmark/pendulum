
BasicGame.MainMenu = function (game) {
	this.background;
	this.message;
    this.spacebar;
};

BasicGame.MainMenu.prototype = {

	create: function () {
        this.background = new Background(this.game, this.game.width, this.game.height);
        this.message = new Message(this.game, 'PENDULUM', 'TAP or press SPACE to start', true);
        this.spacebar = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	},

	update: function () {
		if (this.input.pointer1.isDown) {
            this.startGame(true);
        } else if (this.spacebar.isDown) {
            this.startGame(false);
        }
	},

	startGame: function (onMobile) {
	    // create local storage entry
        var currentlevel = localStorage.getItem('currentlevel');
        if (currentlevel == null) {
            localStorage.setItem('currentlevel', '0');
            currentlevel = 0;
        }

		// start game
        this.background.destroy();
        this.message.destroy();
		this.state.start('Level', true, false, parseInt(currentlevel), onMobile);

	}
};
