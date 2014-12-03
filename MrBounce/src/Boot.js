define([
    'phaser'
], function(Phaser) {
    'use strict';

    function Boot() {
        console.log('Booting the Game');
    }

    Boot.prototype = {
        constructor: Boot,

        init: function() {
            //  Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
            this.input.maxPointers = 1;

            //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
            this.stage.disableVisibilityChange = true;
 //  Or across the whole stage, like this:
    this.game.stage.smoothed = false;
            if (this.game.device.desktop) {
                this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.scale.setMinMax(480, 260, 1024, 768);
                this.scale.pageAlignHorizontally = true;
                this.scale.pageAlignVertically = true;
                this.scale.setScreenSize(true);
                this.scale.refresh();
            } else {
                this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.scale.setMinMax(480, 260, 1024, 768);
                this.scale.pageAlignHorizontally = true;
                this.scale.pageAlignVertically = true;
                this.scale.forceOrientation(true, false);
                //this.scale.setResizeCallback(this.gameResized, this);
                ////this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
                //this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
                this.scale.setScreenSize(true);
                this.scale.refresh();
            }
        },

        preload: function() {

            //  Here we load the assets required for our preloader (in this case a background and a loading bar)
            this.load.image('preloaderBackground', 'images/preloader_background.jpg');
            this.load.image('preloaderBar', 'images/preloadr_bar.png');

        },

        create: function() {

            //  By this point the preloader assets have loaded to the cache, we've set the game settings
            //  So now let's start the real preloader going
            this.state.start('Preloader');

        }
    };

    return Boot;
});