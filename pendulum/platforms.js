Cloud = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'cloud');
    game.add.existing(this);
    game.physics.p2.enable(this, game.debugOn);

    this.body.clearShapes();
    this.body.addRectangle(230, 25, -4, 0);
    this.body.updateCollisionMask();

    this.body.fixedRotation=true;
    this.body.mass = 1000;
    this.body.data.gravityScale=0;

    this.alpha = 0.8;
    this.timer = 0;
};

Cloud.prototype = Object.create(Phaser.Sprite.prototype);
Cloud.prototype.constructor = Cloud;

Cloud.prototype.update = function() {
    this.body.velocity.y = -20*Math.sin((3*this.timer/360)*2*Math.PI);
    this.timer++;
    if (this.timer == 360) { this.timer = 0; }
};

FinishCloud = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'cloud_finish');
    game.add.existing(this);
    game.physics.p2.enable(this, game.debugOn);

    this.body.clearShapes();
    this.body.addRectangle(230, 25, -4, 60);
    this.body.updateCollisionMask();

    this.body.fixedRotation=true;
    this.body.mass = 1000;
    this.body.data.gravityScale=0;

    this.body.onBeginContact.add(this.contact, this);

    this.alpha = 0.8;
    this.timer = 90;
};

FinishCloud.prototype = Object.create(Phaser.Sprite.prototype);
FinishCloud.prototype.constructor = FinishCloud;

FinishCloud.prototype.update = function() {
    this.body.velocity.y = -20*Math.sin((3*this.timer/360)*2*Math.PI);
    this.timer++;
    if (this.timer == 360) { this.timer = 0; }
};

FinishCloud.prototype.contact = function(body, bodyB, shapeA, shapeB) {
    if (body && body.sprite && body.sprite.key == 'player' && this.game.player.touchingDown() &&
        Math.abs(this.game.player.x - this.x) < 120) {
        this.game.playerWins = true;
    }
};
