define([
    'phaser'
], function(Phaser) {
    'use strict';

    var Coin = function Coin(game, x, y, frame) {
        var isCollected = false;
        this.game = game;
        Phaser.Sprite.call(this, game, x, y, 'spritesheet', 'a1.png');
        this.anchor.setTo(0.5, 0.5);
        this.game.physics.arcade.enableBody(this);

        this.body.immovable = true;
        //this.body.checkCollision.up = true;
        //this.body.checkCollision.down = false;

        // add animation phases
        this.animations.add('spin', [
            'a1.png',
            'a2.png',
            'a3.png',
            'a4.png',
            'a5.png',
            'a6.png',
            'a7.png',
            'a8.png'
        ], 10, true, false);

        // play animation
        this.animations.play('spin', 10, true);
    };

    Coin.prototype = Object.create(Phaser.Sprite.prototype);
    Coin.prototype.constructor = Coin;

    Coin.prototype.regenerate = function(x, y, velocity) {
        this.reset(x, y);
        this.revive();
        this.alpha = 1;
        this.isCollected = false;
        this.body.velocity.x = velocity;


    };

    Coin.prototype.update = function() {

        if (this.body.x > this.game.width + 20) {
            this.kill();

            //this.respawn();
        }
    };
    return Coin;
});