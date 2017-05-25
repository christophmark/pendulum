Gem = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'gem');
    game.add.existing(this);
    game.physics.p2.enable(this, game.debugOn);

    this.body.clearShapes();
    this.body.addCircle(15, 0, 0);
    this.body.updateCollisionMask();

    this.body.onBeginContact.add(this.contact, this);

    this.body.fixedRotation=true;
    this.body.mass = 0.001;
    this.body.data.gravityScale=0;

    this.game = game;
    this.timer = 0;
};

Gem.prototype = Object.create(Phaser.Sprite.prototype);
Gem.prototype.constructor = Gem;

Gem.prototype.update = function() {
    var scale = 0.25*Math.sin((this.timer/120)*2*Math.PI) + 1.25;
    this.scale.setTo(scale, scale);
    this.timer++;
    if (this.timer == 360) { this.timer = 0; }
};

Gem.prototype.contact = function(body, bodyB, shapeA, shapeB) {
    if (body && body.sprite && body.sprite.key == 'player') {
        this.body.destroy();
        var tween = this.game.add.tween(this.scale).to( { x: 10, y: 10 }, 350, 'Linear', true);
        var tween2 = this.game.add.tween(this).to( { alpha: 0 }, 350, 'Linear', true);
        tween2.onComplete.add( function () {this.destroy();}, this );

        this.game.score++;
    }
};
