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
        this.playerEmitter = null;
        this.startButton = null;
        this.platformsLeftText = null;
        this.scoreText = null;
        this.finalScoreText = null;

        this.score = 0;
        this.platformsLeft = 0;
        this.difficulty = 1;


        this.barrierGeneratorEvent = null;
        this.coinGeneratorEvent = null;
        this.difficultyIncrementEvent = null;
    }

    Game.prototype = {
        constructor: Game,

        preload: function() {


        },

        create: function() {

            this.game.stage.backgroundColor = '#71c5cf';
            this.game.renderer.renderSession.roundPixels = true;
            this.game.stage.smoothed = false;


            // Set the physics system
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.physics.arcade.enableBody(this);

            // Emitters
            this.emitter = this.game.add.emitter(0, 0, 100);
            this.emitter.makeParticles('particle');
            this.emitter.gravity = 200;

            this.playerEmitter = this.game.add.emitter(0, 0, 100);
            this.playerEmitter.makeParticles('particle');
            this.playerEmitter.gravity = 200;
            this.playerEmitter.minParticleScale = 0.75;
            this.playerEmitter.maxParticleScale = 1;

            this.playerEmitter.setXSpeed(-100, -150);



            // Ground
            this.groundBG = this.game.add.tileSprite(0, this.game.world.height - 50, this.game.world.width, 64, 'ground');
            this.groundFG = this.game.add.tileSprite(0, this.game.world.height - 32, this.game.world.width, 64, 'ground');



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

            this.createGameObjects();

            // Display the bird on the screen
            this.player = new Player(this.game, 100, 50, null);
            this.player.kill();
            this.game.add.existing(this.player);

            this.baddie = new Baddie(this.game, this.game.world.width + 50, this.game.world.height / 2, null);
            this.game.add.existing(this.baddie);


            var style = {
                font: "30px Arial",
                fill: "#fff",
                align: "center"
            };

            var finalStyle = {
                font: "50px Arial",
                fill: "#fff",
                align: "center"
            };

            this.scoreText = this.game.add.text(this.game.world.centerX + 200, 5, "Score: " + this.score, style);
            this.scoreText.anchor.set(0.5, 0);

            this.finalScoreText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, "Score: " + this.score, finalStyle);
            this.finalScoreText.anchor.set(0.5, 0);
            this.finalScoreText.visible = false;

            this.platformsLeftText = this.game.add.text(this.game.world.centerX - 200, 5, "Platforms: " + this.platformsLeft, style);
            this.platformsLeftText.anchor.set(0.5, 0);


            this.startButton = this.game.add.button(this.game.world.centerX - 95, 400, 'startButton', this.restartGame, this, 2, 1, 0);
            this.startButton.visible = true;


        },


        restartGame: function() {
            this.score = 0;
            this.platformsLeft = 10;
            this.scoreText.text = "Score: " + (this.score);
            this.platformsLeftText.text = "Platforms: " + (this.platformsLeft);

            this.player.reset(100, 0);
            this.player.alive = true;
            this.player.body.allowGravity = true;


            this.canPlacePlatform = true;
            this.difficulty = 1;
            this.gameStartedTime = this.game.time;

            this.barriersGroup.callAll('kill');
            this.coinsGroup.callAll('kill');
            this.platformsGroup.callAll('kill');

            // add a timer for barrier creation
            this.barrierGeneratorEvent = this.game.time.create(false);
            this.barrierGeneratorEvent.loop(Phaser.Timer.SECOND * 2, this.addOneBarrier, this);

            //  Create our Timer
            this.coinGeneratorEvent = this.game.time.create(false);
            this.coinGeneratorEvent.loop(Phaser.Timer.SECOND * 0.75, this.generateCoins, this);

            this.difficultyIncrementEvent = this.game.time.create(false);
            this.difficultyIncrementEvent.loop(Phaser.Timer.SECOND * 7, this.increaseDifficulty, this);

            this.coinGeneratorEvent.start();
            this.difficultyIncrementEvent.start();

            this.groundBG.autoScroll(-100, 0);
            this.groundFG.autoScroll(-200, 0);

            this.playerEmitter.start(false, 5000, 20);

            this.startButton.visible = false;
            this.finalScoreText.visible = false;


        },

        playerGameOver: function() {
            this.player.kill();
            this.baddie.kill();

            this.startButton.visible = true;
            this.finalScoreText.visible = true;

            if (localStorage) {
                var highScore = localStorage['highscore'];
                if (!highScore) {
                    localStorage['highscore'] = this.score;
                } else if (this.score > parseInt(highScore)) {
                    localStorage['highscore'] = this.score;
                }
            }
            this.finalScoreText.text = "Score: " + (this.score) + " High: "+localStorage['highscore'];
        },

        playerDeath: function() {
            // Do not create anymore stuff, event off
            this.barrierGeneratorEvent.destroy();
            this.coinGeneratorEvent.destroy();
            this.difficultyIncrementEvent.destroy();
            // ********* Should this all go in the player class???

            this.player.alive = false;
            this.player.body.allowGravity = false;


            this.canPlacePlatform = false;

            this.groundBG.autoScroll(0, 0);
            this.groundFG.autoScroll(0, 0);

            // stop everything from moving
            this.coinsGroup.setAll('body.velocity.x', 0);
            this.barriersGroup.setAll('body.velocity.x', 0);
            this.platformsGroup.setAll('body.velocity.x', 0);
            //this.baddie.set('body.velocity.x', 0);

            var deathTween = this.game.add.tween(this.player.body);
            deathTween.to({
                y: "-250"
            }, 1000, Phaser.Easing.Cubic.Out, false, 500);

            deathTween.to({
                y: this.game.height + 30
            }, 1000, Phaser.Easing.Cubic.In, true)
            deathTween.onComplete.addOnce(this.playerGameOver, this);

            deathTween.start();
            //this.platformsGroup.callAll('kill');

        },


        createGameObjects: function() {
            // Coins
            for (var coinsNdx = 0; coinsNdx < 15; coinsNdx++) {
                var coin = new Coin(this.game, -100, -100);
                this.coinsGroup.add(coin);
            }
            // Barriers
            for (var barrierNdx = 0; barrierNdx < 5; barrierNdx++) {
                var barrier = new Barrier(this.game, -100, -100);
                this.barriersGroup.add(barrier);
            }
            // Platforms
            for (var platformNdx = 0; platformNdx < 3; platformNdx++) {
                var platform = new Platform(this.game, -100, -100);
                this.platformsGroup.add(platform);
            }
        },

        quitGame: function(pointer) {

            //  Here you should destroy anything you no longer need.
            //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

            //  Then let's go back to the main menu.

        },

        addOneBarrier: function() {
            var barrier = this.barriersGroup.getFirstExists(false);
            if (barrier) {
                var position = this.game.rnd.pick([1, 2]);
                var yOffest = this.game.rnd.integerInRange(0, 64);
                var barrierY = 0;
                this.game.tweens.removeFrom(barrier);
                if (position === 1) //TOP
                {
                    barrierY = 128 - yOffest;
                    this.game.add.tween(barrier.body).to({
                        y: "-50"
                    }, this.game.rnd.integerInRange(1000, 750), "Cubic.easeInOut", true, 0, -1, true);

                } else {
                    barrierY = this.game.height - 128 + yOffest;
                    this.game.add.tween(barrier.body).to({
                        y: "+50"
                    }, this.game.rnd.integerInRange(1000, 750), "Cubic.easeInOut", true, 0, -1, true);

                }

                barrier.reset(this.game.width, barrierY);
                barrier.revive();
                barrier.body.velocity.x = -200;
                barrier.checkWorldBounds = true;
                barrier.outOfBoundsKill = true;


            }

        },

        generateCoins: function() {
            var coin = this.coinsGroup.getFirstExists(false);

            if (coin) {
                var yOffest = this.game.rnd.integerInRange(150, this.game.height - 150);

                coin.regenerate(this.game.width, yOffest);
            }

        },

        addPlatform: function() {
            if (!this.canPlacePlatform || this.platformsLeft < 1) {
                return;
            }
            var platform = this.platformsGroup.getFirstExists(false);
            if (platform) {

                platform.reset(this.game.input.x, this.game.input.y);
                platform.body.velocity.x = -200;
                platform.alpha = 1.0;

                this.canPlacePlatform = false;
                this.platformsLeft--;

                this.platformsLeftText.text = "Platforms: " + (this.platformsLeft);
            }
        },

        collectCoin: function(obj1, obj2) {

            if (!obj2.isCollected) {
                var coinTween = this.game.add.tween(obj2);
                coinTween.to({
                    y: obj2.y - 50,
                    alpha: 0,
                    angle: 180
                }, 1000, Phaser.Easing.Linear.None);
                coinTween.onComplete.addOnce(obj2.kill);
                coinTween.start();

                obj2.isCollected = true;

                this.platformsLeft++

                this.platformsLeftText.text = "Platforms: " + (this.platformsLeft);

            }

            return false;
        },

        platformCollideHandler: function(obj1, obj2) {
            if (obj2.alive) {
                this.player.body.velocity.y = -500;
                this.player.body.angle = 0;
                this.canPlacePlatform = true;
                obj2.alive = false;
                this.game.add.tween(this.player).to({
                    angle: 360
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

                this.scoreText.text = "Score: " + (++this.score);
            }


            ;
        },

        addBaddie: function() {
            this.baddie.reset(this.game.world.width, ((this.game.world.height / 2) - 100));

            this.baddie.body.velocity.x = -75;

            this.game.add.tween(this.baddie).to({
                y: ((this.game.world.height / 2) + 100),
                angle: 360
            }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

        },

        increaseDifficulty: function() {
            this.difficulty++;
            switch (this.difficulty) {
                case 2:
                    this.barrierGeneratorEvent.start();
                    break;
                case 3:
                    this.addBaddie();
                    break;
                default:
            }
        },


        update: function() {

            if (this.player.alive) {
                //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
                this.game.physics.arcade.collide(this.player, this.platformsGroup, this.platformCollideHandler, null, this);
                this.game.physics.arcade.collide(this.player, this.barriersGroup, this.playerDeath, null, this);
                this.game.physics.arcade.collide(this.player, this.baddie, this.playerDeath, null, this);
                this.game.physics.arcade.collide(this.player, this.coinsGroup, null, this.collectCoin, this);

                this.player.body.x = 100;

                this.playerEmitter.x = this.player.body.x;
                this.playerEmitter.y = this.player.body.y;


                if (!this.player.inWorld) {
                    this.playerDeath();
                }
            }

        },
    };

    return Game;
});