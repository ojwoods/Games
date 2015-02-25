define([
    'phaser', 'Baddie2'
], function(Phaser, Baddie2) {
    'use strict';

    function MainMenu() {


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

    MainMenu.prototype = {
        constructor: MainMenu,

        preload: function() {


        },

        create: function() {

            this.game.stage.backgroundColor = '#71c5cf';
            this.game.renderer.renderSession.roundPixels = true;
            this.game.stage.smoothed = false;

            // background
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

            this.groundBG.autoScroll(-100, 0);
            this.groundFG.autoScroll(-200, 0);

            this.game.physics.arcade.enable(this.groundFG);

            this.groundFG.body.immovable = true;
            this.groundFG.body.allowGravity = false;


            this.startButton = this.game.add.button(this.game.world.centerX, 400, 'play', this.restartGame, this);
            this.startButton.anchor.set(0.5, 0);
            this.startButton.angle=-5;

            var buttonTween = this.game.add.tween(this.startButton);

            buttonTween.to({
                angle:5
            }, 2000, Phaser.Easing.Sinusoidal.InOut, true, 100, -1, true);


            var logo = this.game.add.sprite(this.game.world.centerX, 175,'logo');
            logo.anchor.set(0.5,0.5);

             var logoBounce = this.game.add.tween(logo.scale);

            logoBounce.to({
                'x': 0.8,
                'y':1.2
            }, 1000, Phaser.Easing.Sinusoidal.InOut, true, 100, -1, true);
           // logoBounce.start();

           this.baddie2 = new Baddie2(this.game, this.game.world.width / 2, (this.game.world.height / 2)+40, null);
            this.game.add.existing(this.baddie2);

            //this.gameOverBoard.add(this.startButton);
            //  this.gameOverBoard.visible = true;
        },


        restartGame: function() {
            this.state.start('Game');




        },


    };

    return MainMenu;
});