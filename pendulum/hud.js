Hud = function (game) {
    this.score = game.score;
    this.game = game;

    this.gem = game.add.sprite(5, 5, 'hud_gem');
    this.gem.scale.setTo(1.5, 1.5);
    this.gem.alpha = 0.8;
    this.gem.fixedToCamera = true;

    this.counter = game.add.bitmapText(90, 38, 'carrier_command', this.score.toString(), 36);
    this.counter.alpha = 0.8;
    if (this.score > 0) {
        this.counter.tint = 0x222222;
    } else {
        this.counter.tint = 0xDD2222;
    }
    this.counter.fixedToCamera = true;
};

Hud.prototype.constructor = Hud;

Hud.prototype.update = function () {
    if (this.game.score != this.score) {
        this.score = this.game.score;
        this.counter.text = this.score.toString();

        if (this.score > 0) {
            this.counter.tint = 0x222222;
        } else {
            this.counter.tint = 0xDD2222;
        }
    }
};
