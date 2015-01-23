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
       // this.playerEmitter = null;
        // this.startButton = null;
        //this.platformsLeftText = null;
        this.scoreText = null;
        this.finalScoreText = null;
        this.infoBoard = null;
        this.boardText = null;

        this.gameOverBoard = null

        this.score = 0;
        //this.platformsLeft = 0;
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
            //  Enable the QuadTree
            this.game.physics.arcade.skipQuadTree = false;
            this.game.physics.arcade.enableBody(this);



            // backround

            this.game.add.tileSprite(0, 0, 800, 600, 'bg');

            // Coins/ score
            var style = {
                font: "50px Arial",
                fill: "#fff",
                align: "center"
            };

            var coinsGraphic = this.game.add.sprite(this.game.width / 2 - 5, 5, 'spritesheet', 'Coin-Collection.png');
            coinsGraphic.anchor.set(1, 0);
            this.scoreText = this.game.add.text(this.game.world.centerX + 5, 5, this.score, style);
            this.scoreText.anchor.set(0, 0);

            // Ground
            this.groundBG = this.game.add.tileSprite(0, this.game.world.height - 80, this.game.world.width, 64, 'ground2');
            this.groundFG = this.game.add.tileSprite(0, this.game.world.height - 64, this.game.world.width, 64, 'ground');


            // Emitters
            this.emitter = this.game.add.emitter(0, 0, 4);
            this.emitter.makeParticles('platform-particle');
            this.emitter.gravity = 200;

          /*  this.playerEmitter = this.game.add.emitter(0, 0, 10);
            this.playerEmitter.makeParticles('particle');
            this.playerEmitter.gravity = 200;
            this.playerEmitter.minParticleScale = 0.75;
            this.playerEmitter.maxParticleScale = 1;

            this.playerEmitter.setXSpeed(-100, -150);*/


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
            this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

            this.baddie = new Baddie(this.game, this.game.world.width + 50, this.game.world.height / 2, null);
            this.game.add.existing(this.baddie);


            // User interface
            this.gameOverBoard = this.game.add.group();

            var finalStyle = {
                font: "50px Arial",
                fill: "#fff",
                align: "center"
            };

            //this.infoBoard = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'spritesheet', 'Board.png')
            this.infoBoard = this.gameOverBoard.create(this.game.world.centerX, this.game.world.centerY, 'spritesheet', 'Board.png')
            this.infoBoard.anchor.set(0.5, 0.5);



            this.finalScoreText = this.game.add.text(this.game.world.centerX, this.game.world.centerY - 20, "Score: " + this.score, finalStyle);
            this.finalScoreText.anchor.set(0.5, 0);
            this.finalScoreText.visible = false;
            this.gameOverBoard.add(this.finalScoreText);


            //this.platformsLeftText = this.game.add.text(this.game.world.centerX - 200, 5, "Platforms: " + this.platformsLeft, style);
            // this.platformsLeftText.anchor.set(0.5, 0);
            this.boardText = this.gameOverBoard.create(this.game.world.centerX, this.game.world.centerY - 100, 'spritesheet', 'Get-Ready.png')
            this.boardText.anchor.set(0.5, 0);


            this.startButton = this.game.add.button(this.game.world.centerX, 350, 'play', this.restartGame, this);
            this.startButton.anchor.set(0.5, 0);

            this.gameOverBoard.add(this.startButton);
            this.gameOverBoard.visible = true;


        },


        restartGame: function() {
            this.score = 0;
            //this.platformsLeft = 10;
            this.scoreText.text = (this.score);
            //this.platformsLeftText.text = "Platforms: " + (this.platformsLeft);

            this.player.restartGame(100, 0);
            this.player.animations.play('fly', 10, true);


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

            //this.playerEmitter.start(false, 5000, 20);

            var boardBounce = this.game.add.tween(this.gameOverBoard);

            boardBounce.to({
                alpha: 0
            }, 200, Phaser.Easing.Linear.None);
            boardBounce.start();



        },

        playerGameOver: function() {
            this.player.kill();
            this.baddie.kill();

            //this.startButton.visible = true;
            this.finalScoreText.visible = true;
            //this.gameOverBoard.y=-300;
            this.gameOverBoard.visible = true;

            this.boardText.frameName = 'Game-Over.png';

            var boardBounce = this.game.add.tween(this.gameOverBoard);
            this.gameOverBoard.alpha = 1;
            boardBounce.from({
                y: -this.game.world.height,

            }, 1000, Phaser.Easing.Bounce.Out);
            boardBounce.start();

            if (localStorage) {
                var highScore = localStorage['highscore'];
                if (!highScore) {
                    localStorage['highscore'] = this.score;
                } else if (this.score > parseInt(highScore)) {
                    localStorage['highscore'] = this.score;
                }
            }
            this.finalScoreText.text = " High: " + localStorage['highscore'];
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
            if (this.playerTween) {
                this.playerTween.pause();
            }
            var deathTween = this.game.add.tween(this.player.body);
            deathTween.to({
                y: "-250"
            }, 1000, Phaser.Easing.Cubic.Out, false, 500);

            deathTween.to({
                y: this.game.height + 30
            }, 1000, Phaser.Easing.Cubic.In, true)
            deathTween.onComplete.addOnce(this.playerGameOver, this);

            deathTween.start();

            this.player.animations.play('killed', 10, true);
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
                var yOffest = 0;
                var barrierY = 0;
                var tweenYOffset = null;

                this.game.tweens.removeFrom(barrier.body);

                if (this.difficulty > 3) {
                    tweenYOffset = this.game.rnd.integerInRange(10, 150 + this.difficulty).toString();
                    yOffest = 0;
                } else {
                    yOffest = this.game.rnd.integerInRange(0, 80)
                }

                if (position === 1) //TOP
                {
                    barrierY = 128 - yOffest;
                    tweenYOffset = "-" + tweenYOffset;
                    barrier.scale.y = 1;
                } else if (this.difficulty > 3) {
                    barrierY = this.game.height - 128 + yOffest;
                    tweenYOffset = "+" + tweenYOffset;
                    barrier.scale.y = -1;
                }

                barrier.reset(this.game.width, barrierY);
                barrier.revive();

                if (this.difficulty > 3) {
                    this.game.add.tween(barrier.body).to({
                        y: tweenYOffset
                    }, this.game.rnd.integerInRange(1000, 2000), "Cubic.easeInOut", true, 0, -1, true);
                }
                barrier.body.velocity.x = -200;
                barrier.checkWorldBounds = true;
                barrier.outOfBoundsKill = true;
                barrier.body.width = 32;
            }
        },

        generateCoins: function() {
            var coin = this.coinsGroup.getFirstExists(false);

            if (coin) {
                var yOffest = this.game.rnd.integerInRange(this.game.height / 2 - 100, this.game.height / 2 + 100);

                coin.regenerate(this.game.width, yOffest);
            }

        },

        addPlatform: function() {
            if (!this.canPlacePlatform) {
                return;
            }
            var platform = this.platformsGroup.getFirstExists(false);
            if (platform) {

                platform.reset(this.game.input.x, this.game.input.y);
                platform.body.velocity.x = -200;
                platform.alpha = 1.0;

                this.canPlacePlatform = false;
                //this.platformsLeft--;

                //this.platformsLeftText.text = "Platforms: " + (this.platformsLeft);
            }
        },

        collectCoin: function(obj1, obj2) {

            if (!obj2.isCollected) {
                var coinTween = this.game.add.tween(obj2);
                coinTween.to({
                    y: 5,
                    x: this.game.width / 2,
                    alpha: 0
                }, 1500, Phaser.Easing.Linear.None);
                coinTween.onComplete.addOnce(function() {
                    obj2.kill;
                    this.score++;
                    this.scoreText.text = this.score;

                }, this);
                coinTween.start();

                obj2.isCollected = true;
                //this.score++;

                // this.platformsLeft+=2;


            }

            return false;
        },

        platformPlayerCollideHandler: function(player, platform) {
            if (platform.alive) {
                this.player.bounce();

                this.canPlacePlatform = true;
                platform.alive = false;
                this.playerTween = this.game.add.tween(this.player).to({
                    angle: 360
                }, 4000).start();

                /*var platformKillTween = this.game.add.tween(platform);
                platformKillTween.to({
                    alpha: 0,
                }, 500, Phaser.Easing.Linear.None);
                platformKillTween.onComplete.addOnce(platform.kill);
                platformKillTween.start();*/
                platform.kill();

                //  Position the emitter where the platform is
                this.emitter.x = platform.body.x+32;
                this.emitter.y = platform.body.y;
                this.emitter.setAlpha(1, 0);

                this.emitter.start(true, 1000, null, 10);

                //this.scoreText.text = "Score: " + (++this.score);
            }
        },

        addBaddie: function() {
            this.baddie.reset(this.game.world.width, ((this.game.world.height / 2) - 100));

            this.baddie.body.velocity.x = -75;

            this.game.add.tween(this.baddie).to({
                y: ((this.game.world.height / 2) + 100),
                angle: 360
            }, 2000 - (this.difficulty * 10), Phaser.Easing.Linear.None, true, 0, 1000, true);

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
            this.player.body.x = 100;

            if (this.player.alive) {
                //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
                this.game.physics.arcade.collide(this.player, this.platformsGroup, this.platformPlayerCollideHandler, null, this);
                this.game.physics.arcade.collide(this.player, this.barriersGroup, this.playerDeath, null, this);
                this.game.physics.arcade.collide(this.player, this.baddie, this.playerDeath, null, this);
                this.game.physics.arcade.collide(this.player, this.coinsGroup, null, this.collectCoin, this);


               // this.playerEmitter.x = this.player.body.x;
                //this.playerEmitter.y = this.player.body.y;


                if (!this.player.inWorld) {
                    this.playerDeath();
                }
            }

        },
        render: function() {

            /* this.game.debug.quadTree(this.game.physics.arcade.quadTree);
            this.game.debug.body(this.player);
            this.barriersGroup.forEach(function(barrier) {
                barrier.game.debug.body(barrier);

            })*/

        }
    };

    return Game;
});