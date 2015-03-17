//  Here is a custom game object
Mine = function(game, x, y) {

    Phaser.Sprite.call(this, game, x, y, 'mine');
    game.physics.arcade.enable(this);
    this.body.y = y;
    this.anchor.setTo(0.5,0.5);
    this.game = game;
    this.gridPosition = {};

};

Mine.prototype = Object.create(Phaser.Sprite.prototype);
Mine.prototype.constructor = Mine;

/**
 * Automatically called by World.update
 */
Mine.prototype.update = function() {
    if (this.alive && this.y > 1000){
    	this.kill();
    	console.log("kill");
    }

};