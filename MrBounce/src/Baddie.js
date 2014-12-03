define([
    'phaser'
], function(Phaser) {
    'use strict';

    var Baddie = function Baddie(game, x, y, frame) {
        Phaser.Sprite.call(this, game, x, y, 'baddie1', frame);
        this.anchor.setTo(0.5, 0.5);
        this.game.physics.arcade.enableBody(this);

        this.body.immovable = true;
        //this.body.checkCollision.up = true;
        //this.body.checkCollision.down = false;


        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
    };

    Baddie.prototype = Object.create(Phaser.Sprite.prototype);
    Baddie.prototype.constructor = Baddie;

    Baddie.prototype.update= function() {
        if (this.body.x<0)
        {
            this.body.x=this.game.world.width;
            this.body.y=this.game.rnd.integerInRange(100, this.game.height-100)
        }
    };


    return Baddie;
});