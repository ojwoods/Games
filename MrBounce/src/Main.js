(function() {
    'use strict';

    requirejs.config({
        baseUrl: "src/",

        paths: {
            phaser: 'lib/phaser',
        },

        shim: {
            'phaser': {
                exports: 'Phaser'
            }
        }
    });

    require(['phaser', 'Boot', 'Preloader', 'Game'], function(Phaser, Boot, Preloader, Game) {
        var game = new Phaser.Game(640, 480, Phaser.AUTO, '');
        var bootState = new Boot();

        game.state.add('Boot', bootState);
        game.state.add('Preloader', new Preloader());
        // game.state.add('MainMenu', BasicGame.MainMenu);
        game.state.add('Game', new Game());

        //  Now start the Boot state.
        game.state.start('Boot');
    });
}());