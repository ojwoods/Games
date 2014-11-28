define([
    'phaser'
], function(Phaser) {
    'use strict';

    var Player = function Player(game, x, y, frame) {
            Phaser.Sprite.call(this, game, x, y, 'player', frame);
            this.anchor.setTo(0.5, 0.5);
            this.game.physics.arcade.enableBody(this);

            this.body.allowGravity = true;
            this.body.immovable = false;
            this.body.gravity.y = 1000;

            this.angle=45;


           // this.body.collideWorldBounds = true;
            this.body.bounce.set(0);
        };

    Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

    return Player;
});



