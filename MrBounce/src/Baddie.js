define([
    'phaser'
], function(Phaser) {
    'use strict';

    var Baddie = function Baddie(game, x, y, frame) {
        Phaser.Sprite.call(this, game, x, y, 'spritesheet', 'baddy1-1.png');
        this.anchor.setTo(0.5, 0.5);
        this.game.physics.arcade.enableBody(this);
        this.game = game;
        this.spawns = 0;
        this.body.immovable = true;

        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;

        this.animations.add('flap', [
           'frame-1-2.png',
            'frame-2-2.png',
            'frame-3-2.png',
            'frame-4-2.png',
            'frame-5-2.png',
            'frame-6-2.png',
            'frame-7-2.png',
            'frame-8-2.png'
        ], 10, true, false);

        // play animation
        this.animations.play('flap', 10, true);
    };

    Baddie.prototype = Object.create(Phaser.Sprite.prototype);
    Baddie.prototype.constructor = Baddie;


    Baddie.prototype.respawn = function(level) {
        this.spawns++;

        this.reset(this.game.world.width, ((this.game.world.height / 2) - this.spawns * 10));
        this.body.x = this.game.world.width;
        this.body.y = this.game.rnd.integerInRange(100, this.game.height - 100);
        this.body.velocity.x = -85;

        this.game.add.tween(this).to({
            y: ((this.game.world.height / 2) + this.spawns * 10 + level*10)
            /*,
                angle: 20*/
        }, 2000 - (this.spawns * 10)- (level+10), Phaser.Easing.Linear.None, true, 0, 1000, true);
    };
    Baddie.prototype.update = function() {
        if (this.body.x < 0) {


            this.respawn();
        }
    };


    return Baddie;
});