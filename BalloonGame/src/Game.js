define([
    'phaser', 'Player', 'Platform', 'Barrier', 'Coin', 'Baddie', 'Baddie2', 'Obsticle'
], function(Phaser, Player, Platform, Barrier, Coin, Baddie, Baddie2, Obsticle) {
    'use strict';

    function Game() {


        //  You can use any of these from any function within this State.
        //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.
        this.player = null;
        this.coinsGroup = null;
        this.obsticlesGroup = null;
        this.groundFG = null;
        this.groundBG = null;
        this.canPlacePlatform = false;
        this.baddie = null;
        this.baddie2 = null;
        this.emitter = null;
        this.arrow = null;
        this.helpplatform = null;
        // this.playerEmitter = null;
        // this.startButton = null;
        //this.platformsLeftText = null;
        this.scoreText = null;
        this.finalScoreText = null;
        // this.infoBoard = null;
        this.boardText = null;
        this.helpText = null;
        this.sponsorText = null;

        this.gameOverBoard = null

        this.score = 0;
        //this.platformsLeft = 0;
        this.difficulty = 1;
        this.scrollVelocity = -200;

        this.bounce = null;
        this.coin = null;
        this.splat = null;
        this.buttonClick = null;


        //this.barrierGeneratorEvent = null;
        this.coinGeneratorEvent = null;
        this.obsticlesGeneratorEvent = null;
        this.obsticlesGeneratorEvent2 = null;
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
            //this.game.physics.arcade.skipQuadTree = false;
            this.game.physics.arcade.enableBody(this);



            // backround

            this.game.add.tileSprite(0, 0, 800, 600, 'bg');

            // Coins/ score
            var style = {
                font: "50px Arial",
                fill: "#fff",
                align: "center"
            };



            // Ground
            this.groundBG = this.game.add.tileSprite(0, this.game.world.height - 80, this.game.world.width, 64, 'spritesheet', 'ground2.png');
            this.groundFG = this.game.add.tileSprite(0, this.game.world.height - 64, this.game.world.width, 64, 'spritesheet', 'ground.png');


            // Emitters
            //this.emitter = this.game.add.emitter(0, 0, 4);
            // this.emitter.makeParticles('platform-particle');
            //this.emitter.gravity = 200;

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
            this.input.onUp.add(this.goUp, this);

            // Platforms and Barriers are grouped for reusablility
            this.platformsGroup = this.game.add.group();
            this.barriersGroup = this.game.add.group();
            this.coinsGroup = this.game.add.group();
            this.obsticlesGroup = this.game.add.group();

            this.createGameObjects();

            // Display the bird on the screen
            this.player = new Player(this.game, 100, 50, null);
            this.player.kill();
            this.game.add.existing(this.player);
            this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

            this.baddie = new Baddie(this.game, this.game.width + 100, this.game.world.height / 2, null);
            this.game.add.existing(this.baddie);
            this.baddie2 = new Baddie2(this.game, -50, this.game.world.height / 2, null);
            this.game.add.existing(this.baddie2);


            //this.baddie2.kill();*/

            // User interface
            this.gameOverBoard = this.game.add.group();

            var finalStyle = {
                font: "50px Arial",
                fill: "#ff0000",
                align: "center"
            };

            //this.infoBoard = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'spritesheet', 'Board.png')
            //this.infoBoard = this.gameOverBoard.create(this.game.world.centerX, this.game.world.centerY, 'spritesheet', 'UIbg.png')
            // this.infoBoard.anchor.set(0.5, 0.5);

            this.finalScoreText = this.game.add.text(this.game.world.centerX, this.game.world.centerY - 20, "Score: " + this.score, finalStyle);
            this.finalScoreText.anchor.set(0.5, 0);
            this.finalScoreText.visible = false;
            var grd = this.finalScoreText.context.createLinearGradient(0, 0, 0, this.finalScoreText.height);

            //  Add in 2 color stops
            grd.addColorStop(0, '#c83e3e');
            grd.addColorStop(1, '#e55c5c');

            //  And apply to the Text
            this.finalScoreText.fill = grd;


            this.gameOverBoard.add(this.finalScoreText);


            //this.platformsLeftText = this.game.add.text(this.game.world.centerX - 200, 5, "Platforms: " + this.platformsLeft, style);
            // this.platformsLeftText.anchor.set(0.5, 0);
            this.boardText = this.gameOverBoard.create(this.game.world.centerX, this.game.world.centerY - 100, 'spritesheet', 'textGetReady.png')
            this.boardText.anchor.set(0.5, 0);


            this.helpText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, "Add Platform", finalStyle);
            this.helpText.anchor.set(0.5, 0);
            this.helpText.visible = false;

            var sponsorTextStyle = {
                font: "20px Arial",
                fill: "#fff",
                align: "center"
            };
            this.sponsorText = this.game.add.text(this.game.width - 15, 10, "symmetrical-cow.com", sponsorTextStyle);
            this.sponsorText.anchor.set(1, 0.5);

            grd = this.sponsorText.context.createLinearGradient(0, 0, 0, this.sponsorText.height);

            //  Add in 2 color stops
            grd.addColorStop(0, '#000000');
            grd.addColorStop(1, '#6b9e04');

            //  And apply to the Text
            this.sponsorText.fill = grd;

            this.sponsorText.inputEnabled = true;
            this.sponsorText.events.onInputDown.add(function() {
                window.open("http://www.symmetrical-cow.com")
            }, this);




            this.startButton = this.game.add.button(this.game.world.centerX, 350, 'play', this.startButtonEvent, this);
            this.startButton.anchor.set(0.5, 0);

            this.gameOverBoard.add(this.startButton);
            this.gameOverBoard.visible = true;




            //sound
            this.bounce = this.game.add.audio('bounce'); //sound
            this.coin = this.game.add.audio('coin');
            this.splat = this.game.add.audio('splat');
            this.buttonClick = this.game.add.audio('button');

            var boardBounce = this.game.add.tween(this.gameOverBoard);
            this.gameOverBoard.alpha = 1;
            boardBounce.from({
                y: -this.game.world.height,

            }, 1000, Phaser.Easing.Bounce.Out);
            boardBounce.start();


            // add last so is top layer
            var coinsGraphic = this.game.add.sprite(this.game.width / 2 - 5, 5, 'spritesheet', 'Coin-Collection.png');
            coinsGraphic.anchor.set(1, 0);

            var obsticlesGraphic = this.game.add.sprite(this.game.width / 2 - 5, 5, 'spritesheet', 'Coin-Collection.png');
            obsticlesGraphic.anchor.set(1, 0);


            this.scoreText = this.game.add.text(this.game.world.centerX + 5, 5, this.score, style);
            this.scoreText.anchor.set(0, 0);

            this.helpplatform = this.game.add.sprite(this.game.width / 2, this.game.world.centerY + 100, 'spritesheet', 'tapTick.png');
            this.helpplatform.anchor.set(0.5, 0.5);
            this.helpplatform.visible = false;

            this.arrow = this.game.add.sprite(100, 40, 'spritesheet', 'Up-Green.png');
            this.arrow.anchor.set(0.5, 0.5);
            this.arrow.kill();
            // this.emitter = this.game.add.emitter(this.game.world.centerX, 32, 250);
            //this.game.load.image('smoke', 'spritesheet', 'puffSmall.png');

            this.emitter = this.game.add.emitter(100, 100, 5);

            this.emitter.makeParticles('puffSmoke');
            this.emitter.bringToTop = true;
            this.emitter.setRotation(0, 0);
            this.emitter.setAlpha(1, 0.25, 1000);
            this.emitter.setScale(0.1, 2, 0.1, 2, 1000);
            this.emitter.gravity = 100;



        },

        startButtonEvent: function() {
            this.buttonClick.play();
            this.restartGame();
        },

        restartGame: function() {
            this.score = 0;
            //this.platformsLeft = 10;
            this.scoreText.text = (this.score);
            //this.platformsLeftText.text = "Platforms: " + (this.platformsLeft);


            this.player.animations.play('fly', 10, true);
            //this.baddie2.animations.play('flap', 10, true);


            this.canPlacePlatform = true;
            this.difficulty = 1;
            this.gameStartedTime = this.game.time;

            //this.barriersGroup.callAll('kill');
            this.coinsGroup.callAll('kill');
            this.obsticlesGroup.callAll('kill');
            //this.platformsGroup.callAll('kill');

            // add a timer for barrier creation
            //this.barrierGeneratorEvent = this.game.time.create(false);
            //this.barrierGeneratorEvent.loop(Phaser.Timer.SECOND * 2, this.addOneBarrier, this);

            //  Create our Timer
            this.coinGeneratorEvent = this.game.time.create(false);
            this.coinGeneratorEvent.loop(Phaser.Timer.SECOND * 0.75, this.generateCoins, this);

            this.obsticlesGeneratorEvent = this.game.time.create(false);
            this.obsticlesGeneratorEvent.loop(Phaser.Timer.SECOND * 0.50, this.generateObsticles, this);

            this.obsticlesGeneratorEvent2 = this.game.time.create(false);
            this.obsticlesGeneratorEvent2.loop(Phaser.Timer.SECOND * 0.40, this.generateObsticles, this);

            this.difficultyIncrementEvent = this.game.time.create(false);
            this.difficultyIncrementEvent.loop(Phaser.Timer.SECOND * 5, this.increaseDifficulty, this);

            this.scoreIncrementEvent = this.game.time.create(false);
            this.scoreIncrementEvent.loop(Phaser.Timer.SECOND, this.increaseScore, this);

            this.scoreIncrementEvent.start();
            this.coinGeneratorEvent.start();
            this.obsticlesGeneratorEvent.start();
            this.obsticlesGeneratorEvent2.start();
            this.difficultyIncrementEvent.start();

            this.groundBG.autoScroll(100, 0);
            this.groundFG.autoScroll(200, 0);

            //this.playerEmitter.start(false, 5000, 20);

            var boardBounce = this.game.add.tween(this.gameOverBoard);

            boardBounce.to({
                alpha: 0
            }, 200, Phaser.Easing.Linear.None);
            boardBounce.onComplete.addOnce(function() {
                this.gameOverBoard.visible = false;
            }, this);

            boardBounce.start();
            this.playerPos = this.game.width - 200;
            this.player.x = this.playerPos

            this.baddie2.x = this.game.width + 50;
            var openingTween = this.game.add.tween(this.baddie2).to({

                x: 50,
                angle: -360
            }, 2000, Phaser.Easing.Cubic.Out, true)

            openingTween.onComplete.addOnce(function() {
                this.player.restartGame(this.game.width - 200, 0);
                this.chaseTween = this.game.add.tween(this.baddie2).to({

                    x: "-20",
                    y: "-30",
                    angle: 360
                }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
            }, this);
            // openingTween.start();

            this.arrow.reset(this.player.x, 40);
            this.helpplatform.visible = true;


            this.game.add.tween(this.helpplatform).to({

                alpha: 0
            }, 150, Phaser.Easing.Cubic.InOut, true, 0, 10, true).onComplete.addOnce(function() {
                this.arrow.kill();
                this.helpplatform.visible = false;
            }, this);

            var openingTween = this.game.add.tween(this.arrow).to({

                alpha: 0
            }, 300, Phaser.Easing.Cubic.InOut, true, 0, 5, true).onComplete.addOnce(function() {
                this.arrow.kill();
                this.helpText.visible = false;
            }, this);

            // this.addBaddie();
        },

        increaseScore: function() {
            this.score++;
            this.scoreText.text = this.score;

            this.playerPos = this.playerPos - 2;
        },
        playerGameOver: function() {
            this.player.kill();
            this.baddie.kill();
            this.emitter.on = false
            //this.baddie2.kill();

            //this.startButton.visible = true;
            this.finalScoreText.visible = true;
            //this.gameOverBoard.y=-300;
            this.gameOverBoard.visible = true;

            this.boardText.frameName = 'textGameOver.png';

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

            this.finalScoreText.visible = true;
            this.finalScoreText.text = " High Score: " + localStorage['highscore'];

            this.currentLevel = 1;
        },

        playerNextLevel: function() {
            this.player.kill();
            this.baddie.kill();
            //this.baddie2.kill();

            //this.startButton.visible = true;
            this.finalScoreText.visible = true;
            //this.gameOverBoard.y=-300;
            this.gameOverBoard.visible = true;

            this.boardText.frameName = 'Stage-Clear.png';

            var boardBounce = this.game.add.tween(this.gameOverBoard);
            this.gameOverBoard.alpha = 1;
            boardBounce.from({
                y: -this.game.world.height,

            }, 1000, Phaser.Easing.Bounce.Out);
            boardBounce.start();

            this.currentLevel++;
            this.scrollVelocity = -200 - (this.currentLevel * 10);


            this.finalScoreText.visible = false;

            this.groundBG.autoScroll(this.scrollVelocity / 2, 0);
            this.groundFG.autoScroll(this.scrollVelocity, 0);
        },

        playerDeath: function(winner) {
            // Do not create anymore stuff, event off
            this.emitter.start(false, 1000, 250);


            this.stopGame();

            var deathTween = this.game.add.tween(this.player.body);
            deathTween.to({
                y: this.game.height + 100,
                x: -50
            }, 3000, Phaser.Easing.Cubic.In, true)
            deathTween.onComplete.addOnce(this.playerGameOver, this);

            this.game.add.tween(this.player).to({
                angle: "-50"
            }, 2000, Phaser.Easing.Cubic.In, true);
            //this.player.animations.play('killed', 10, false);

            this.chaseTween.stop();
            var openingTween = this.game.add.tween(this.baddie2).to({

                x: -50
            }, 2000, Phaser.Easing.Cubic.Out, true)

            this.splat.play();

        },

        stopGame: function() {
            this.scoreIncrementEvent.destroy();
            this.coinGeneratorEvent.destroy();
            this.obsticlesGeneratorEvent.destroy();
            this.obsticlesGeneratorEvent2.destroy();
            this.difficultyIncrementEvent.destroy();

            // ********* Should this all go in the player class???

            this.player.alive = false;
            this.player.body.allowGravity = false;

            this.canPlacePlatform = false;

            this.groundBG.autoScroll(0, 0);
            this.groundFG.autoScroll(0, 0);

            // stop everything from moving
            this.coinsGroup.setAll('body.velocity.x', 0);
            this.obsticlesGroup.setAll('body.velocity.x', 0);
            //this.baddie.set('body.velocity.x', 0);
            if (this.playerTween) {
                this.playerTween.pause();
            }

            this.game.tweens.removeAll();


        },
        createGameObjects: function() {
            // Coins
            for (var obsticlesNdx = 0; obsticlesNdx < 30; obsticlesNdx++) {
                var obsticle = new Obsticle(this.game, -100, -100);
                this.obsticlesGroup.add(obsticle);
            }

            for (var coinsNdx = 0; coinsNdx < 10; coinsNdx++) {
                var coin = new Coin(this.game, -100, -100);
                this.coinsGroup.add(coin);
            }
            // Barriers
            /* for (var barrierNdx = 0; barrierNdx < 5; barrierNdx++) {
                var barrier = new Barrier(this.game, -100, -100);
                this.barriersGroup.add(barrier);
            }
            // Platforms
            for (var platformNdx = 0; platformNdx < 3; platformNdx++) {
                var platform = new Platform(this.game, -100, -100);
                this.platformsGroup.add(platform);
            }*/
        },

        quitGame: function(pointer) {

            //  Here you should destroy anything you no longer need.
            //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

            //  Then let's go back to the main menu.

        },

        /* addOneBarrier: function() {
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


                barrier.body.velocity.x = this.scrollVelocity;
                barrier.checkWorldBounds = true;
                barrier.outOfBoundsKill = true;
                barrier.body.width = 32;
            }
        },*/

        generateObsticles: function() {
            var obsticle = this.obsticlesGroup.getFirstDead();
            var showObsticle = true;
            if (this.difficulty < 5) {
                showObsticle = this.game.rnd.between(0, 5 - this.difficulty) === 0;
            }

            if (obsticle && showObsticle) {
                var yOffest = this.game.rnd.integerInRange(25, this.game.height - 25);

                obsticle.regenerate(-25, yOffest, -this.scrollVelocity);
                var tweenYOffset = this.game.rnd.integerInRange(0, 5 + (this.difficulty * 5)).toString();
                if (obsticle.mytween) {
                    // obsticle.mytween.remove();
                }
                obsticle.mytween = this.game.add.tween(obsticle.body).to({
                    y: tweenYOffset
                }, this.game.rnd.integerInRange(1000 - this.difficulty, 2000 - this.difficulty), "Cubic.easeInOut", true, 0, -1, true);


            }
        },

        generateCoins: function() {
            var coin = this.coinsGroup.getFirstDead();

            if (coin) {
                var yOffest = this.game.rnd.integerInRange(25, this.game.height - 25);

                coin.regenerate(-25, yOffest, -this.scrollVelocity);

            }
        },

        goUp: function() {
            this.player.bounce();
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
                    this.score = this.score + 5;
                    this.scoreText.text = this.score;

                }, this);
                coinTween.start();

                obj2.isCollected = true;

                // this.playerPos+=10;
                //this.score++;

                var playerAccelerate = this.game.add.tween(this);
                playerAccelerate.to({
                    playerPos: "-10",
                }, 500, Phaser.Easing.Linear.None);
                playerAccelerate.start();

                this.coin.play();


            }

            return false;
        },


        addBaddie: function() {
            this.baddie.respawn(this.currentLevel);

        },

        /*addBaddie2: function() {
            this.baddie2.respawn();


        },*/

        increaseDifficulty: function() {
            this.difficulty++;
            console.log(this.difficulty);
            switch (this.difficulty) {

                case 4:
                    this.addBaddie();
                    break;

                default:
            }
        },


        gameWin: function() {
            this.stopGame();
            this.player.animations.play('explode', 10, false);
            this.baddie2.animations.play('explode', 10, false);
            this.playerGameOver();

        },

        update: function() {
            this.player.body.x = this.playerPos;
            this.emitter.x = this.player.x + 25;
            this.emitter.y = this.player.y;

            if (this.player.alive) {
                //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
                // this.game.physics.arcade.collide(this.player, this.platformsGroup, this.platformPlayerCollideHandler, null, this);
                //this.game.physics.arcade.collide(this.player, this.barriersGroup, this.playerDeath, null, this);
                this.game.physics.arcade.collide(this.player, this.baddie, this.playerDeath, null, this);
                this.game.physics.arcade.collide(this.player, this.baddie2, this.gameWin, null, this);
                this.game.physics.arcade.collide(this.player, this.obsticlesGroup, null, this.playerDeath, this);
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