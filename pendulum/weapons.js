Bullet = function(game, angle, speed, explodeOnContact) {
    Phaser.Sprite.call(this, game, game.player.x, game.player.y, 'hud_gem');
    game.add.existing(this);
    game.physics.p2.enable(this, game.debugOn);

    this.scale.setTo(0.5, 0.5);

    this.body.clearShapes();
    this.body.addCircle(2, 0, 0);
    this.body.updateCollisionMask();

    this.angle = -(angle + Math.PI/2.);
    this.body.fixedRotation=true;
    this.body.mass = 0.001;
    this.body.data.gravityScale=0;

    this.game = game;
    angle = (angle/180.)*Math.PI;
    this.velX = Math.sin(angle)*speed;
    this.velY = Math.cos(angle)*speed;

    this.body.velocity.x = this.velX;
    this.body.velocity.y = this.velY;

    this.explodeOnContact = explodeOnContact;
};

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.update = function() {
    if (this.x < 5 || this.x > this.game.world.bounds.width-5 || this.y < 5 || this.y > this.game.world.bounds.height-5) {
        this.pendingDestroy = true;
    }

    this.touchingBMP();
};

Bullet.prototype.touchingBMP = function () {
    if (this.game.terrain.getPixelRGB(Math.round(this.body.x), Math.round(this.body.y + 0)).a > 0.) {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        this.body.static = true;

        if (this.explodeOnContact) {
            this.explode();
        }
    }
};

Bullet.prototype.explode = function() {
    // check if anchor of wire is hit
    if (this.game.player.anchorBody && this.game.player.anchorBody.sprite && this.game.player.anchorBody.sprite.key == 'dummy' &&
        Math.sqrt(Math.pow(this.x - this.game.player.anchorBody.sprite.x, 2.) + Math.pow(this.y - this.game.player.anchorBody.sprite.y, 2.)) < 64) {
        this.game.player.anchorBody.static = false;
    }

    if (this.explodeOnContact) {
        this.game.terrain.blendDestinationOut();
    }

    this.game.terrain.circle(this.body.x, this.body.y, 64, 'rgba(0, 0, 0, 255)');
    playExplosion(this.game, this.body.x, this.body.y);
    this.pendingDestroy = true;

    if (this.explodeOnContact) {
        this.game.terrain.blendReset();
        this.game.terrain.update();
    }
};



Cannon = function(player) {
    this.player = player;
    this.game = player.game;

    this.orientation = player.orientation;
    this.delta = this.game.rnd.realInRange(-10, 10);
    this.phi = 20;
    this.timer = 0;

    this.wireDestroyed = false;
    this.bullets = [];

    Phaser.Sprite.call(this, this.game, this.player.x, this.player.y);
    this.game.add.existing(this);
};

Cannon.prototype = Object.create(Phaser.Sprite.prototype);
Cannon.prototype.constructor = Cannon;

Cannon.prototype.update = function() {
    if (this.phi <= 160) {
        if (this.orientation == 'right') {
            this.bullets.push(new Bullet(this.game, -this.phi+this.delta, 700, false));
        } else {
            this.bullets.push(new Bullet(this.game, this.phi+this.delta, 700, false));
        }
    }

    if (!this.player.isWireActive()) { this.wireDestroyed = true; }

    if (this.wireDestroyed && this.timer > 40) {
        this.game.terrain.blendDestinationOut();

        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].explode();
        }
        this.bullets = [];

        this.game.terrain.blendReset();
        this.game.terrain.update();

        this.pendingDestroy = true;
    }

    this.phi += 20;
    this.timer += 1;
};



explosionParticle = function(game, x, y, key, frame) {
    Phaser.Particle.call(this, game, x, y, key, frame);
};

explosionParticle.prototype = Object.create(Phaser.Particle.prototype);
explosionParticle.prototype.constructor = explosionParticle;
explosionParticle.prototype.onEmit = function() {
    this.animations.add('kaboom');
    this.animations.play('kaboom', 30, false, true);
};

playExplosion = function(game, x, y) {
    var emitter = game.add.emitter(x, y, 6);
    emitter.particleClass = explosionParticle;
    emitter.makeParticles('kaboom');
    emitter.width = 20;
    emitter.height = 20;
    emitter.minParticleScale = 0.5;
    emitter.maxParticleScale = 2.5;
    emitter.minParticleSpeed.set(0, 0);
    emitter.maxParticleSpeed.set(0, 0);
    emitter.gravity = 0;
    emitter.start(false, 2000, 50, 6);
};