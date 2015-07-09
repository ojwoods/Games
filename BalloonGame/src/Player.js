define([
    'phaser'
], function(Phaser) {
    'use strict';

    var Player = function Player(game, x, y, frame) {
        Phaser.Sprite.call(this, game, x, y, 'spritesheet', 'planeYellow1.png');
        this.anchor.setTo(0.5, 0.5);
        this.game.physics.arcade.enableBody(this);

        this.body.allowGravity = true;
        this.body.immovable = false;
        this.body.gravity.y = 500;
        this.body.width = 32;
        this.body.height = 32;
        this.game=game;
        //this.angle = 45;


        // this.body.collideWorldBounds = true;
        this.body.bounce.set(0);

        // add animation phases
        this.animations.add('fly', [
            'planeYellow1.png',
            'planeYellow2.png',
            'planeYellow3.png'
        ], 10, true, false);

        this.animations.add('killed', [
            'frame-4.png'
        ], 10, true, false);

        this.animations.add('explode', [
            'explode-1.png',
            'explode-2.png',
            'explode-3.png',
            'explode-4.png',
            'explode-5.png'
        ], 10, true, false);

        // play animation
        this.animations.play('fly', 10, true);
    };


    Player.prototype = Object.create(Phaser.Sprite.prototype);
    Player.prototype.constructor = Player;

    Player.prototype.restartGame = function(x, y) {
        this.alive = true;
        this.body.allowGravity = true;
        this.body.velocity.x = -10;
        this.reset(x, y);
    };

    Player.prototype.bounce = function() {
        this.body.velocity.y = -150;
        //this.angle = 0;
        this.game.add.tween(this).to({
                    angle: 25
                }, 250, "Cubic.easeOut").to({
                    angle: 0
                }, 350, "Cubic.easeIn").start();

    };

    Player.prototype.flyAway = function() {
        this.body.velocity.y = 0;
        this.body.velocity.x = 30;
        this.body.angle = 0;
    };

    return Player;
});