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

            this.background = this.add.sprite(0, 0, 'loader');
            this.preloadBar = this.add.sprite((this.game.width/2)-100, 450, 'preloaderBar');

            //	This sets the preloadBar sprite as a loader sprite.
            //	What that does is automatically crop the sprite from 0 to full-width
            //	as the files below are loaded in.

            this.load.setPreloadSprite(this.preloadBar);

            //	Here we load the rest of the assets our game needs.

            this.load.image('font', 'assets/font.png');
            this.load.image('play', 'assets/play.png');
            this.load.image('logo', 'assets/logo.png');
            this.load.image('bg', 'assets/background.png');


            this.load.atlasJSONHash('spritesheet', 'assets/spritesheet.png', 'assets/spritesheet.json');
            this.load.image('platform-particle', 'assets/platform-particle.png');

            this.game.load.audio('bounce', ['assets/bounce.mp3']);
            this.game.load.audio('coin', ['assets/collectBonus.mp3']);
            this.game.load.audio('splat', ['assets/wrong.mp3']);
            this.game.load.audio('button', ['assets/button.mp3']);

        },

        create: function() {

            this.state.start('MainMenu');

        }
    };

    return Preloader;
});