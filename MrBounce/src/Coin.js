define([
    'phaser'
], function(Phaser) {
    'use strict';

    var Coin = function Coin(game, x, y, frame) {
        Phaser.Sprite.call(this, game, x, y, 'coin', frame);
        this.anchor.setTo(0.5, 0.5);
        this.game.physics.arcade.enableBody(this);

        //this.body.immovable = true;
        //this.body.checkCollision.up = true;
        //this.body.checkCollision.down = false;


        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
    };

    Coin.prototype = Object.create(Phaser.Sprite.prototype);
    Coin.prototype.constructor = Coin;

    return Coin;
});