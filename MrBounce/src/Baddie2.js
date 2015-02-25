define([
    'phaser'
], function(Phaser) {
    'use strict';

    var Baddie2 = function Baddie2(game, x, y, frame) {
        Phaser.Sprite.call(this, game, x, y, 'spritesheet', 'frame-1-2.png');
        this.anchor.setTo(0.5, 0.5);
        this.game.physics.arcade.enableBody(this);

        this.body.immovable = true;
        this.chaseTween = null;
        this.game = game;

        //this.body.velocity.x = -5;
        // this.checkWorldBounds = true;
        //this.outOfBoundsKill = true;
        this.animations.add('flap', [
            'baddy1-1.png',
            'baddy1-2.png',
            'baddy1-3.png',
            'baddy1-4.png',
            'baddy1-5.png',
            'baddy1-6.png'

        ], 10, true, false);

        this.animations.add('explode', [
            'explode-1.png',
            'explode-2.png',
            'explode-3.png',
            'explode-4.png',
            'explode-5.png'
        ], 10, true, false);

        // play animation
        this.animations.play('flap', 10, true);
    };

    Baddie2.prototype = Object.create(Phaser.Sprite.prototype);
    Baddie2.prototype.constructor = Baddie2;


    Baddie2.prototype.respawn = function() {
        this.spawns++;

        this.reset(this.game.world.width - 50, this.game.world.height / 2);
        this.body.x = this.game.world.width - 50;
        this.body.y = this.game.rnd.integerInRange(100, this.game.height - 100);
        // this.body.velocity.x = -5;

        this.chaseTween = this.game.add.tween(this).to({
            angle: 30,
            x: "-35"
        }, 2000 - (this.spawns * 10), Phaser.Easing.Linear.None, true, 0, 1000, true);
    };

    Baddie2.prototype.flyAway = function() {
        this.chaseTween.stop();
        this.game.add.tween(this).to({
            x: this.game.world.width + 50
        }, 2000 - (this.spawns * 10), Phaser.Easing.Linear.None, true, 0, 1000, true);
    };
    Baddie2.prototype.update = function() {
        this.scale.x = -1

        if (this.body.x < 0) {


            //this.respawn();
        }
    };




    return Baddie2;
});