'use strict';


var Player = function(game, x, y, frame) {
    Phaser.Sprite.call(this, game, x, y, 'player', frame);
    this.anchor.setTo(0.5, 0.5);
    this.game.physics.arcade.enableBody(this);

    this.body.allowGravity = true;
    this.body.immovable = fale;
    this.body.gravity.y = 1000;


    this.body.collideWorldBounds = true;
    this.body.bounce.set(1);
};