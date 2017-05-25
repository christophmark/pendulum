Player = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'player');
    game.add.existing(this);
    game.physics.p2.enable(this, game.debugOn);

    this.game = game;
    this.wireBitmap = game.add.bitmapData(game.world.bounds.width, game.world.bounds.height);
    this.wireBitmap.addToWorld();
    this.frame = 0;

    this.body.clearShapes();
    this.body.addCircle(22,0,-10);
    this.body.addRectangle(10, 15, 0, 25);
    this.body.updateCollisionMask();

    this.body.fixedRotation=true;
    this.body.mass = 4;
    this.body.data.gravityScale=1;

    this.allowAction = true;
    this.showPointer = true;
    this.playerAlive = true;
    this.orientation = 'right';

    this.anchorPoint = new Phaser.Point();
    this.anchorBody = undefined;
    this.distanceToAnchor = undefined;
    this.wireSegments = this.game.add.group();
    this.nSegments = undefined;
    this.anchorBodyOffset = undefined;
    this.constraints = [];
    this.maxWireLength = 750;
    this.wireTimer = 0;

    this.shotTimer = 60;
    this.touchReloaded = true;
    this.bullets = [];

    this.button = game.add.bitmapData(200, 200);
    this.button.circle(100, 100, 100, 'rgb(207,140,155)');
    this.button.circle(100, 100, 90, 'rgb(207,113,134)');
    this.button.circle(100, 100, 80, 'rgb(207,69,100)');
    this.buttonSprite = game.add.sprite(-100, -100, this.button);
    this.buttonSprite.anchor.setTo(0.5, 0.5);
    this.buttonSprite.alpha = 0.8;
    this.isButtonActive = false;

    this.indicator = game.add.sprite(this.x, this.y, 'indicator');
    this.indicator.anchor.setTo(0, 0.5);
    this.indicator.alpha = 0.;
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.switchOrientation = function() {
    if (this.orientation == 'right') {
        this.scale.x = -1;
        this.orientation = 'left';
    } else {
        this.scale.x = 1;
        this.orientation = 'right';
    }

    // if (this.isWireActive()) { new Cannon(this); }
};

Player.prototype.touchingDown = function () {
    var yAxis = p2.vec2.fromValues(0, 1);
    var result = false;
    for (var i = 0; i < this.game.physics.p2.world.narrowphase.contactEquations.length; i++) {
        var c = this.game.physics.p2.world.narrowphase.contactEquations[i];  // cycles through all the contactEquations until it finds our "someone"
        if (c.bodyA === this.body.data || c.bodyB === this.body.data) {
            var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
            if (c.bodyA === this.body.data) d *= -1;
            if (d > 0.5) result = true;
        }
    } return result;
};

Player.prototype.touchingBMP = function () {
    var x = Math.round(this.body.x);
    var y = Math.round(this.body.y);
    if (this.game.terrain.getPixelRGB(x, y).a > 0. ||
        this.game.terrain.getPixelRGB(x, y - 20).a > 0. ||
        this.game.terrain.getPixelRGB(x +10, y-10).a > 0. ||
        this.game.terrain.getPixelRGB(x -10, y-10).a > 0.) {
        return true;
    } else {
        return false;
    }
};

Player.prototype.update = function () {
    if (this.playerAlive) {
        if (this.orientation == 'right' && this.body.velocity.x < -5) {
            this.switchOrientation();
        } else if (this.orientation == 'left' && this.body.velocity.x > 5) {
            this.switchOrientation();
        }

        if (this.isWireActive()) {
            this.updateWire();
            // mobile touch control for shooting
            if (this.game.input.pointer1.isDown) {
                if (!this.isButtonActive) {
                    this.buttonSprite.fixedToCamera = false;
                    this.buttonSprite.x = this.game.input.pointer1.x;
                    this.buttonSprite.y = this.game.input.pointer1.y;
                    this.buttonSprite.fixedToCamera = true;
                    this.isButtonActive = true;
                    this.touchReloaded = true;
                } else {
                    var dist = Math.sqrt(Math.pow(this.buttonSprite.x - this.game.input.pointer1.worldX, 2.) +
                                         Math.pow(this.buttonSprite.y - this.game.input.pointer1.worldY, 2.));
                    var angle = 180*Math.atan2(this.game.input.pointer1.worldX - this.buttonSprite.x,
                                               this.game.input.pointer1.worldY - this.buttonSprite.y)/Math.PI;

                    if (dist < 85) {
                        this.touchReloaded = true;
                        if (dist > 25) {
                            this.indicator.x = this.x;
                            this.indicator.y = this.y;
                            this.indicator.angle = -angle + 90;
                            this.indicator.alpha = dist/85.;

                            if (dist > 50) {
                                var scale = 1.+(dist-50)/(35.*3.);
                                this.indicator.scale.setTo(scale, scale);
                            }
                        } else {
                            this.indicator.alpha = 0;
                        }
                    } else {
                        if (this.shotTimer > 60 && this.touchReloaded) {
                            this.shoot(angle);
                            this.shotTimer = 0;
                            this.touchReloaded = false;

                            this.game.add.tween(this.buttonSprite.scale).to( { x: 0.75, y: 0.75 }, 100, "Linear", true, 0);
                            this.game.add.tween(this.buttonSprite.scale).to( { x: 1.0, y: 1.0 }, 100, "Linear", true, 100);

                            this.indicator.alpha = 0;
                        }
                    }
                }
            } else {
                if (this.isButtonActive) {
                    this.buttonSprite.fixedToCamera = false;
                    this.buttonSprite.x = -100;
                    this.buttonSprite.y = -100;
                    this.buttonSprite.fixedToCamera = true;
                    this.isButtonActive = false;
                }
            }

            //desktop mouse control for shooting
            if (this.game.input.mousePointer.isDown && this.shotTimer > 60) {
                var angle = 180*Math.atan2(this.game.input.mousePointer.worldX - this.x, this.game.input.mousePointer.worldY - this.y)/Math.PI;
                this.shoot(angle);
                this.shotTimer = 0;
            }

        } else if (this.showPointer) {
            this.wireBitmap.clear();
            for (var i = 0; i <= 50; i++) {
                if (this.orientation == 'right') {
                    this.wireBitmap.rect(this.x + i + 4, this.y - (2 * i) - 10, 2, 2, 'rgba(255, 0, 0, ' + (1 - i / 50. - Math.exp(-i / 10)).toString() + ')');
                } else {
                    this.wireBitmap.rect(this.x - i - 4, this.y - (2 * i) - 10, 2, 2, 'rgba(255, 0, 0, ' + (1 - i / 50. - Math.exp(-i / 10)).toString() + ')');
                }

            }
        }

        if (this.allowAction) {
            if (this.game.input.pointer1.isDown || this.game.spacebar.isDown) {
                if (!this.isWireActive()) {
                    this.castWire();
                    this.frame = 1;

                    // prevent switching direction when shooting wire from ground
                    if (this.touchingDown()) {
                        this.body.velocity.x = 300;
                        this.body.velocity.y = 300;
                        this.distanceToAnchor -= this.distanceToAnchor*0.1;
                    }
                }
            } else if (this.game.input.pointer1.isUp && this.game.spacebar.isUp) {
                if (this.isWireActive()) {
                    this.destroyWire();
                } else {
                    if (this.touchingDown()) { this.frame = 0; }
                }
            }
        }
        
        if (this.touchingBMP()) {
            this.die();
        }

        this.shotTimer++;
    } else { this.wireBitmap.clear(); } // make laser disappear
};

Player.prototype.shoot = function(angle) {
    new Bullet(this.game, angle, 700, true);
    new Bullet(this.game, angle + this.game.rnd.realInRange(-5, 5), 700, true);
    new Bullet(this.game, angle + this.game.rnd.realInRange(-5, 5), 700, true);
};

Player.prototype.die = function() {
    this.destroyWire();
    this.frame = 2;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.body.static = true;
    this.playerAlive = false;
};

Player.prototype.castWire = function() {
    var y0 = this.y;

    this.anchorPoint.x = this.x+23;
    this.anchorPoint.y = this.y;

    var body_array = [];
    var bmp_alpha = 0.;

    while (this.anchorPoint.y >= 0 && (y0 - this.anchorPoint.y < this.maxWireLength)) {
        if (this.anchorPoint.x > this.game.world.bounds.width-3 || this.anchorPoint.x < 3 || this.anchorPoint.y < 3) {
            this.switchOrientation(); // enables further movement when stuck at wall
            break;
        }

        body_array = this.game.physics.p2.hitTest(this.anchorPoint);
        bmp_alpha = this.game.terrain.getPixelRGB(Math.round(this.anchorPoint.x), Math.round(this.anchorPoint.y)).a;

        if (body_array.length > 0) {
            if ((body_array[0].parent.sprite == null) || (body_array[0].parent.sprite &&
                (body_array[0].parent.sprite.key != 'player'))) {
                this.anchorBody = body_array[0].parent;
                while (body_array.length > 0) {
                    this.anchorPoint.y += 2;
                    if (this.orientation == 'right') {
                        this.anchorPoint.x -= 1;
                    } else {
                        this.anchorPoint.x += 1;
                    }

                    body_array = this.game.physics.p2.hitTest(this.anchorPoint);
                }
                break;
            }
        } else if (bmp_alpha > 0.) {
            while (bmp_alpha > 0.) {
                this.anchorPoint.y += 2;
                if (this.orientation == 'right') {
                    this.anchorPoint.x -= 1;
                } else {
                    this.anchorPoint.x += 1;
                }

                bmp_alpha = this.game.terrain.getPixelRGB(Math.round(this.anchorPoint.x), Math.round(this.anchorPoint.y)).a;
            }

            var anchorSprite = this.game.add.sprite(this.anchorPoint.x, this.anchorPoint.y);
            anchorSprite.key = 'dummy';
            this.game.physics.p2.enable(anchorSprite, this.game.debugOn);
            this.anchorBody = anchorSprite.body;
            this.anchorBody.setRectangle(3,3);
            this.anchorBody.static = true;
            break;
        }

        this.anchorPoint.y -= 10;
        if (this.orientation == 'right') {
            this.anchorPoint.x += 5;
        } else {
            this.anchorPoint.x -= 5;
        }
    }

    if (this.anchorBody == null) {
        if (y0 - this.anchorPoint.y == this.maxWireLength) {
            if (this.orientation == 'right') {
                this.anchorPoint.x = this.x + this.maxWireLength/2.;
            } else {
                this.anchorPoint.x = this.x - this.maxWireLength/2.;
            }
            this.anchorPoint.y = this.y - this.maxWireLength/2.;
        }
    }

    this.buildWire();
};

Player.prototype.buildWire = function() {
    if (this.wireSegments.children.length == 0) { // check for double sensor collision event
        this.distanceToAnchor = Math.sqrt(Math.pow(this.x - this.anchorPoint.x, 2) + Math.pow(this.y - this.anchorPoint.y, 2));
        this.nSegments = ~~(this.distanceToAnchor/40);
        if (this.nSegments < 4) { this.nSegments=4; } else if (this.nSegments > 15) { this.nSegments=15; }

        for (var i=1; i<=this.nSegments; i++){
            var x = (this.x+23) + i/this.nSegments*(this.anchorPoint.x - (this.x+23));
            var y = this.y + i/this.nSegments*(this.anchorPoint.y - this.y);

            if (this.anchorBody == null) {
                x += this.game.rnd.realInRange(-75, 75);
            }

            var w = this.wireSegments.create(x, y);
            this.game.physics.p2.enable(w, this.game.debugOn);
            w.key = 'wire';
            w.body.setCircle(10);
            w.body.setCollisionGroup(this.game.wireCG);
            w.body.collides([this.game.spriteCG, this.game.dummyCG]);

            if (this.anchorBody) {
                w.body.mass=1;
            } else {
                w.body.mass=.2;
            }

            w.body.fixedRotation=true;
            w.body.data.gravityScale=0;
        }

        if (this.anchorBody) {
            this.anchorBodyOffset = [this.anchorBody.x - this.wireSegments.children[this.nSegments-1].x,
                this.anchorBody.y - this.wireSegments.children[this.nSegments-1].y];
        }

        this.updateWire();
    }
};

Player.prototype.updateWire = function() {
    this.wireTimer++;
    this.wireBitmap.clear();

    var y = 1 / this.game.height;
    var wx = [this.x+23];
    var wy = [this.y];
    for (var i=0; i<(this.nSegments-1); i++){
        wx.push(this.wireSegments.children[i+1].x);
        wy.push(this.wireSegments.children[i+1].y);
    }

    for (var i = 0; i <= 1.; i += y) {
        var px = this.game.math.catmullRomInterpolation(wx, i);
        var py = this.game.math.catmullRomInterpolation(wy, i);

        this.wireBitmap.rect(px, py, 3, 1, 'rgb(175, 250, 255)');

        if (py % 8 < 0.5) {
            var rx = Math.round(px);
            var ry = Math.round(py);
            if (this.game.terrain.getPixelRGB(rx+16, ry).a > 0. &&
                this.game.terrain.getPixelRGB(rx+25, ry).a > 0. &&
                this.game.physics.p2.hitTest(new Phaser.Point(rx+16, ry)).length == 0) {
                new Dummy(this.game, rx+25, ry);
            } else if (this.game.terrain.getPixelRGB(rx-16, ry).a > 0. &&
                this.game.terrain.getPixelRGB(rx-25, ry).a > 0. &&
                this.game.physics.p2.hitTest(new Phaser.Point(rx-16, ry)).length == 0) {
                new Dummy(this.game, rx-25, ry);
            }

            if (this.game.terrain.getPixelRGB(rx, ry-16).a > 0. &&
                this.game.terrain.getPixelRGB(rx, ry-25).a > 0. &&
                this.game.physics.p2.hitTest(new Phaser.Point(rx, ry-16)).length == 0) {
                new Dummy(this.game, rx, ry-25);
            } else if (this.game.terrain.getPixelRGB(rx, ry+16).a > 0. &&
                this.game.terrain.getPixelRGB(rx, ry+25).a > 0. &&
                this.game.physics.p2.hitTest(new Phaser.Point(rx, ry+16)).length == 0) {
                new Dummy(this.game, rx, ry+25);
            }
        }
    }

    var r = 3*(Math.sin((this.wireTimer/36)*2*Math.PI) + 1) + 3;
    this.wireBitmap.circle(this.wireSegments.children[this.nSegments-1].x, this.wireSegments.children[this.nSegments-1].y, r+4, 'rgb(175, 250, 255)');
    this.wireBitmap.circle(this.x+23, this.y, r, 'rgb(175, 250, 255)');

    if (this.shotTimer < 60) {
        this.wireBitmap.circle(this.x+23, this.y, (60 - this.shotTimer)/3., 'rgb(246, 103, 97)');
    }

    this.clearWireConstraints();

    if (this.distanceToAnchor >= 120) {
        this.distanceToAnchor -= this.distanceToAnchor*0.0085;
    }

    this.constraints.push( this.game.physics.p2.createDistanceConstraint(this, this.wireSegments.children[0], this.distanceToAnchor/(this.nSegments), [23,0]));
    for (var i=0; i<(this.nSegments-1); i++){
        this.constraints.push( this.game.physics.p2.createDistanceConstraint(this.wireSegments.children[i+1], this.wireSegments.children[i], this.distanceToAnchor/(this.nSegments)) );
    }
    if (this.anchorBody) {
        this.constraints.push( this.game.physics.p2.createLockConstraint(this.anchorBody, this.wireSegments.children[this.nSegments-1], this.anchorBodyOffset) );
    }
};

Player.prototype.isWireActive = function() {
    if (this.wireSegments.children.length > 0) {return true;}
    else {return false;}
};

Player.prototype.clearWireConstraints = function() {
    for (var i=0; i<=this.constraints.length; i++){ this.game.physics.p2.removeConstraint(this.constraints[i]);}
    this.constraints = [];
};

Player.prototype.destroyWire = function() {
    // make indicator invisible again
    this.indicator.alpha = 0;

    // reset wire stuff
    this.wireTimer = 0;
    this.clearWireConstraints();
    this.wireSegments.destroy(true, true);  // destroy children, dont destroy group
    this.wireBitmap.clear();
    
    // destroy landscape around anchor point
    this.game.terrain.blendDestinationOut();
    this.game.terrain.circle(this.anchorPoint.x, this.anchorPoint.y, 64, 'rgba(0, 0, 0, 255)');

    // show explosion
    if (this.anchorBody && this.anchorBody.sprite && this.anchorBody.sprite.key == 'dummy') {
        playExplosion(this.game, this.anchorBody.x, this.anchorBody.y);
        this.anchorBody.sprite.pendingDestroy = true;
    }

    // redraw landscape
    this.game.terrain.blendReset();
    this.game.terrain.update();

    // reset reference to anchor body
    this.anchorBody = undefined;
};

Player.prototype.destroy = function() {
    this.clearWireConstraints();
    this.destroyWire();
    this.wireSegments.destroy(true, false);
    this.wireBitmap.destroy();
    Phaser.Sprite.prototype.destroy(this);
};



Dummy = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y);
    game.add.existing(this);
    game.physics.p2.enable(this, game.debugOn);

    this.key = 'dummy';
    this.body.setRectangle(20,20);
    this.body.static = true;
    this.body.setCollisionGroup(game.dummyCG);
    this.body.collides(game.wireCG);

    this.contacted = false;
    this.counter = 0;
};

Dummy.prototype = Object.create(Phaser.Sprite.prototype);
Dummy.prototype.constructor = Dummy;

Dummy.prototype.update = function() {
    if (!this.contacted) { this.counter++; }
    if (this.counter > 20) { this.pendingDestroy = true; }
};
