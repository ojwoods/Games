EnemyBomber = function(game, player) {
    this.game = game;
    this.player = player;
    this.bottomOfScreenY = (window.innerHeight * this.game.scale.scaleFactor.y);

    Phaser.Group.call(this, this.game);

    this.warningIcon = game.add.sprite(-100, 32, 'objectsSpritesheet', 'Enemy.png');
    this.bomber = game.add.sprite(-100, 400, 'objectsSpritesheet', 'enemy_barrel.png');
    this.add(this.bomber);

    this.warningIcon.anchor.set(0.5);
    this.bomber.anchor.set(0.5);

    this.warningIcon.fixedToCamera = true;

    game.physics.enable(this.bomber, Phaser.Physics.ARCADE);
    this.bomber.body.immovable = false;

    this.bomber.outOfBoundsKill = true;
    this.bomber.checkWorldBounds = true;

    this.warningIcon.cameraOffset.x = -100;

    this.kill();


};
EnemyBomber.prototype = Object.create(Phaser.Group.prototype);

EnemyBomber.prototype.constructor = EnemyBomber;

EnemyBomber.prototype.setAlive = function(alive) {
    this.bomber.alive = alive;
    this.alive = alive;
}

EnemyBomber.prototype.kill = function() {
    this.setAlive(false);
    this.bomber.kill();
}

EnemyBomber.prototype.fire = function(screenTopY, gridWidth, gridHeight, gridSize) {
    var direction = this.game.rnd.between(0, 3);
    var startX, startY, velocityX, velocityY = 0;
    var bottomOfScreenY = (window.innerHeight * this.game.scale.scaleFactor.y);
    var rightOfScreenY = (window.innerWidth * this.game.scale.scaleFactor.x);
    var gridSize2 = gridSize / 2;

    switch (direction) {
        case 0: //top
            startX = (this.game.rnd.between(0, gridWidth - 1) * gridSize) + gridSize2;
            startY = screenTopY;
            this.warningIcon.cameraOffset.x = startX;
            this.warningIcon.cameraOffset.y = gridSize2;
            break;
        case 1: //bottom
            startX = (this.game.rnd.between(0, gridWidth - 1) * gridSize) + gridSize2;
            startY = screenTopY + this.game.stage.height - gridSize2;
            this.warningIcon.cameraOffset.x = startX;
            this.warningIcon.cameraOffset.y = bottomOfScreenY - gridSize2;
            break;
        case 2: //left
            startX = 0;
            startY = this.game.rnd.pick([0, gridSize, gridSize * 2]);

            this.warningIcon.cameraOffset.x = startX + gridSize2;
            this.warningIcon.cameraOffset.y = (this.player.y + startY - screenTopY);
            rememberY = this.player.y + startY;
            break;
        case 3: //right
            startX = gridWidth * gridSize;
            startY = this.game.rnd.pick([0, gridSize, gridSize * 2]);

            this.warningIcon.cameraOffset.x = startX - gridSize2;
            this.warningIcon.cameraOffset.y = (this.player.y + startY - screenTopY);
            break;
    }

    this.setAlive(true);
    this.warningIcon.reset(startX, startY);
    this.warningIcon.alpha = 1;
    this.warningIcon.bringToTop();


    this.game.add.tween(this.warningIcon).to({

        alpha: 0
    }, 200, Phaser.Easing.Cubic.InOut, true, 0, 4, true).onComplete.addOnce(function() {
        this.warningIcon.kill();

        // Take into account moved camera
        switch (direction) {
            case 0: //top/
                startY = this.game.camera.y;
                velocityX = 0;

                velocityY = 300;
                break;
            case 1: //bottom
                startY = screenTopY + bottomOfScreenY - gridSize2;
                velocityX = 0;

                velocityY = -200;
                break;
            case 2: //left
                startY = this.game.camera.y + this.warningIcon.cameraOffset.y;
                velocityX = 200;

                velocityY = 0;
                break;
            case 3: //right
                startY = this.game.camera.y + this.warningIcon.cameraOffset.y;
                velocityX = -200;

                velocityY = 0;
                break;
        }

        this.bomber.reset(startX, startY);
        this.bomber.body.velocity.x = velocityX;
        this.bomber.body.velocity.y = velocityY;

        this.setAlive(true);
    }, this);

    // Flash warning a few times before firing

},

EnemyBomber.prototype.update = function() {

if(this.alive&& (this.bomber.y-this.game.camera.y)>this.bottomOfScreenY)
    {
        this.setAlive(false);
    }
    this.alive = this.bomber.alive;
};