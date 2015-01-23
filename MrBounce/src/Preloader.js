define([
    'phaser'
], function(Phaser) {
    'use strict';

    function Preloader() {
        this.background = null;
        this.preloadBar = null;
        this.ready = false;
    }

    Preloader.prototype = {
        constructor: Preloader,

        preload: function() {

            //	These are the assets we loaded in Boot.js
            //	A nice sparkly background and a loading progress bar

            this.background = this.add.sprite(0, 0, 'preloaderBackground');
            this.preloadBar = this.add.sprite(300, 400, 'preloaderBar');

            //	This sets the preloadBar sprite as a loader sprite.
            //	What that does is automatically crop the sprite from 0 to full-width
            //	as the files below are loaded in.

            this.load.setPreloadSprite(this.preloadBar);

            //	Here we load the rest of the assets our game needs.

            this.load.image('bg', 'assets/background.png');
            this.load.image('ground', 'assets/ground.png');
            this.load.image('ground2', 'assets/ground2.png');
            this.load.image('barrier', 'assets/barrier.png');
            this.load.image('baddie1', 'assets/baddie1.png');
            this.load.image('font', 'assets/font.png');
            this.load.image('play', 'assets/play.png');
            this.load.spritesheet('startButton', 'assets/flixel-button.png', 80, 20, 3);
        this.load.atlasJSONHash('spritesheet', 'assets/spritesheet.png', 'assets/spritesheet.json');
            this.load.image('platform-particle','assets/platform-particle.png');



        },

        create: function() {

            this.state.start('Game');

        }
    };

    return Preloader;
});