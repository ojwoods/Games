EnemyTank = function (game, player, bullets){
	this.game = game;
    this.health = 3;
    this.player = player;
    this.bullets = bullets;
    this.fireRate = 4000;
    this.nextFire = 0;
    this.alive = true;

	this.tank = game.add.sprite(100, 400, 'objectsSpritesheet', 'enemy_tank.png');
    this.turret = game.add.sprite(100,400, 'objectsSpritesheet', 'enemy_barrel.png');

    this.tank.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
};

EnemyTank.prototype.update = function() {


    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
    this.turret.rotation = this.game.physics.arcade.angleBetween(this.tank, this.player);

    if (this.game.physics.arcade.distanceBetween(this.tank, this.player) < 250)
    {
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;

            var bullet = this.bullets.getFirstDead();

            bullet.reset(this.turret.x, this.turret.y);

            bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 50);
        }
    }

};