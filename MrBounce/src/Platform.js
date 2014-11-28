define([
    'phaser'
], function(Phaser) {
    'use strict';

    var Platform = function Platform(game, x, y, frame) {
        Phaser.Sprite.call(this, game, x, y, 'platform', frame);
        this.anchor.setTo(0.5, 0.5);
        this.game.physics.arcade.enableBody(this);

        this.body.immovable = true;
        this.body.checkCollision.up = true;
        this.body.checkCollision.down = false;


        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
    };

    Platform.prototype = Object.create(Phaser.Sprite.prototype);
    Platform.prototype.constructor = Platform;

    return Platform;
});