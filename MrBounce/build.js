({
        baseUrl: "src/",

        paths: {
            phaser: 'lib/phaser',
        },

        shim: {
            'phaser': {
                exports: 'Phaser'
            }
        },
        name: "Main",
        out:"birdie.js"
    })