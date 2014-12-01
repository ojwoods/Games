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

            this.load.image('player', 'assets/player.png');
            this.load.image('ground', 'assets/ground.png');
            this.load.image('platform', 'assets/platform.png');
            this.load.image('barrier', 'assets/barrier.png');
            this.load.image('coin', 'assets/coin.png');

        },

        create: function() {

            this.state.start('Game');

        }
    };

    return Preloader;
});