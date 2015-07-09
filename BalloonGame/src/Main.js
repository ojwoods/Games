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

    require(['phaser', 'Boot', 'Preloader', 'Game', 'MainMenu'], function(Phaser, Boot, Preloader, Game, MainMenu) {
        var w = window.innerWidth * window.devicePixelRatio,
            h = window.innerHeight * window.devicePixelRatio,
            width = (h > w) ? h : w,
            height = (h > w) ? w : h;

        // Hack to avoid iPad Retina and large Android devices. Tell it to scale up.
     /*  if (window.innerWidth >= 1024 && window.devicePixelRatio >= 2) {
            width = Math.round(width / 2);
            height = Math.round(height / 2);
        }
        // reduce screen size by one 3rd on devices like Nexus 5
        if (window.devicePixelRatio === 3) {
            width = Math.round(width / 3) * 2;
            height = Math.round(height / 3) * 2;
        }*/

        var game = new Phaser.Game(800, 600, Phaser.AUTO);
        var bootState = new Boot();

        game.state.add('Boot', bootState);
        game.state.add('Preloader', new Preloader());
        game.state.add('MainMenu', new MainMenu());
        game.state.add('Game', new Game());

        //  Now start the Boot state.
        game.state.start('Boot');
    });
}());