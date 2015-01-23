define([
    'phaser'
], function(Phaser) {
    'use strict';

    var Barrier = function Barrier(game, x, y, frame) {
        Phaser.Sprite.call(this, game, x, y, 'barrier', frame);
        this.anchor.setTo(0.5, 0.5);
        this.game.physics.arcade.enableBody(this);
this.body.width=32;
        this.body.immovable = true;
        //this.body.checkCollision.up = true;
        //this.body.checkCollision.down = false;


        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
    };

    Barrier.prototype = Object.create(Phaser.Sprite.prototype);
    Barrier.prototype.constructor = Barrier;

    return Barrier;
});