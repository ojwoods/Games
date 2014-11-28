define([
    'phaser', 'player', 'Platform'
], function(Phaser, Player, Platform) {
    'use strict';

    function Game() {


        //  You can use any of these from any function within this State.
        //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.
        this.player = null;
        this.platformsGroup = null;
        this.ground = null;
    }

    Game.prototype = {
        constructor: Game,

        preload: function() {


        },

        create: function() {

            //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
            this.game.stage.backgroundColor = '#71c5cf';

            // Set the physics system
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.physics.arcade.enableBody(this);

            // Display the bird on the screen
            this.player = new Player(this.game, 100, 50, null);
            this.game.add.existing(this.player);

            // Gropund
                        this.ground2 = this.game.add.tileSprite(0, 400, 640, 64, 'ground');

            this.ground = this.game.add.tileSprite(0, 416, 640, 64, 'ground');
            this.ground.autoScroll(-200, 0);
            this.ground2.autoScroll(-100, 0);

            // Add gravity to the player to make it fall
            this.game.physics.arcade.enable(this.ground);

            this.ground.body.immovable = true;
            this.ground.body.allowGravity = false;

            this.input.onUp.add(this.addPlatform, this);

            this.platformsGroup = this.game.add.group();

        },

        update: function() {

            //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
            this.game.physics.arcade.collide(this.player, this.ground);
            this.game.physics.arcade.collide(this.player, this.platformsGroup, this.platformCollideHandler, null, this);

            this.player.body.x=100;

        },

        quitGame: function(pointer) {

            //  Here you should destroy anything you no longer need.
            //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

            //  Then let's go back to the main menu.
            this.state.start('MainMenu');

        },

        addPlatform: function() {
            var platform = this.platformsGroup.getFirstExists(false);
            if (!platform) {
                platform = new Platform(this.game);
                this.game.add.existing(platform);
                console.log("NEw platform");
                this.platformsGroup.add(platform);
            }
            platform.reset(this.game.input.x, this.game.input.y);
            platform.body.velocity.x = -200;

        },

        platformCollideHandler: function() {
           this.player.body.velocity.y = -600;
           this.game.add.tween(this.player).from({ angle: 0 }, 1000).start();
        },
    };

    return Game;
});