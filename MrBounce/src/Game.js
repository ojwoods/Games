define([
    'phaser', 'Player', 'Platform', 'Barrier', 'Coin', 'Baddie'
], function(Phaser, Player, Platform, Barrier, Coin, Baddie) {
    'use strict';

    function Game() {


        //  You can use any of these from any function within this State.
        //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.
        this.player = null;
        this.platformsGroup = null;
        this.barriersGroup = null;
        this.coinsGroup = null;
        this.groundFG = null;
        this.groundBG = null;
        this.canPlacePlatform = false;
        this.baddie = null;
        this.emitter = null;
        this.font = null;
        this.score = 0;
    }

    Game.prototype = {
        constructor: Game,

        preload: function() {


        },

        create: function() {

            this.game.stage.backgroundColor = '#71c5cf';



            // Set the physics system
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.physics.arcade.enableBody(this);

            // Emitter
            this.emitter = this.game.add.emitter(0, 0, 100);
            this.emitter.makeParticles('particle');
            this.emitter.gravity = 200;

            // Display the bird on the screen
            this.player = new Player(this.game, 100, 50, null);
            this.game.add.existing(this.player);

            // Ground
            this.groundBG = this.game.add.tileSprite(0, this.game.world.height - 64, this.game.world.width, 64, 'ground');
            this.groundFG = this.game.add.tileSprite(0, this.game.world.height - 32, this.game.world.width, 64, 'ground');

            this.groundBG.autoScroll(-100, 0);
            this.groundFG.autoScroll(-200, 0);

            // Add gravity to the player to make it fall
            this.game.physics.arcade.enable(this.groundFG);

            this.groundFG.body.immovable = true;
            this.groundFG.body.allowGravity = false;

            // Add controls
            this.input.onUp.add(this.addPlatform, this);

            // Platforms and Barriers are grouped for reusablility
            this.platformsGroup = this.game.add.group();
            this.barriersGroup = this.game.add.group();
            this.coinsGroup = this.game.add.group();

            // add a timer for barrier creation
            this.barrierGenerator = this.game.time.events.loop(Phaser.Timer.SECOND * 1.5, this.generateBarriers, this);
            this.barrierGenerator.timer.start();

            this.coinGenerator = this.game.time.events.loop(Phaser.Timer.SECOND * 0.5, this.generateCoins, this);
            this.coinGenerator.timer.start();

            this.canPlacePlatform = true;

            this.baddie = new Baddie(this.game, this.game.world.width + 50, this.game.world.height / 2, null);
            this.game.add.existing(this.baddie);

            this.addBaddie();

           /* this.font = this.game.add.retroFont('font', 8, 8, Phaser.RetroFont.TEXT_SET1);
            var fontImage = this.game.add.image(this.game.world.centerX, 1, this.font);
            fontImage.scale.set(3);
            fontImage.anchor.set(0.5, 0);
            fontImage.smoothed = false;
            this.font.text = "Score: " + this.score;*/
        },

        update: function() {

            //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
            this.game.physics.arcade.collide(this.player, this.groundFG, this.playerGameOver, null, this);
            this.game.physics.arcade.collide(this.player, this.platformsGroup, this.platformCollideHandler, null, this);
            this.game.physics.arcade.collide(this.player, this.barriersGroup, this.playerGameOver, null, this);
            this.game.physics.arcade.collide(this.player, this.baddie, this.playerGameOver, null, this);
            this.game.physics.arcade.collide(this.player, this.coinsGroup, null, this.collectCoin, this);

            this.player.body.x = 100;

        },

        playerGameOver: function() {
            this.quitGame();
        },

        quitGame: function(pointer) {

            //  Here you should destroy anything you no longer need.
            //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

            //  Then let's go back to the main menu.
            this.state.start('Game');

        },

        generateBarriers: function() {
            var barrier = this.barriersGroup.getFirstExists(false);
            if (!barrier) {
                barrier = new Barrier(this.game);
                this.game.add.existing(barrier);
                this.barriersGroup.add(barrier);
            }

            var position = this.game.rnd.pick([1, 2]);
            var yOffest = this.game.rnd.integerInRange(0, 64);
            var barrierY = 0;
            if (position === 1) //TOP
            {
                barrierY = 128 - yOffest;
            } else {
                barrierY = this.game.height - 128 + yOffest;
            }

            barrier.reset(this.game.width, barrierY);
            barrier.body.velocity.x = -200;

        },

        generateCoins: function() {
            var coin = this.coinsGroup.getFirstExists(false);
            if (!coin) {
                coin = new Coin(this.game);
                this.game.add.existing(coin);
                this.coinsGroup.add(coin);

                console.log("new coin");
            }

            var position = this.game.rnd.pick([1, 2]);
            var yOffest = this.game.rnd.integerInRange(0, this.game.height);

            coin.reset(this.game.width, yOffest);
            coin.body.velocity.x = -200;


        },

        addPlatform: function() {
            if (!this.canPlacePlatform) {
                return;
            }
            var platform = this.platformsGroup.getFirstExists(false);
            if (!platform) {
                platform = new Platform(this.game);
                this.game.add.existing(platform);
                this.platformsGroup.add(platform);
            }
            platform.reset(this.game.input.x, this.game.input.y);
            platform.body.velocity.x = -200;
            platform.alpha = 1.0;

            this.canPlacePlatform = false;
        },

        collectCoin: function(obj1, obj2) {
            var coinTween = this.game.add.tween(obj2);
            coinTween.to({
                y: obj2.y - 50,
                alpha: 0,
                angle: 180
            }, 1000, Phaser.Easing.Linear.None);
            coinTween.onComplete.addOnce(obj2.kill);
            coinTween.start();

           // this.font.text = "Score: " + (++this.score);


            return false;
        },

        platformCollideHandler: function(obj1, obj2) {
            this.player.body.velocity.y = -600;
            this.canPlacePlatform = true;
            this.game.add.tween(this.player).from({
                angle: 0
            }, 1000).start();

            var platformKillTween = this.game.add.tween(obj2);
            platformKillTween.to({
                alpha: 0,
            }, 500, Phaser.Easing.Linear.None);
            platformKillTween.onComplete.addOnce(obj2.kill);
            platformKillTween.start();

            //  Position the emitter where the player is
            this.emitter.x = this.player.body.x;
            this.emitter.y = this.player.body.y;
            this.emitter.setAlpha(1, 0);

            this.emitter.start(true, 1000, null, 10);
        },

        addBaddie: function() {
            this.baddie.reset(this.game.world.width, this.game.world.height / 2);

            this.baddie.body.velocity.x = -250;
        },
    };

    return Game;
});