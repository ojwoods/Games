BasicGame.Game = function(game) {

    //	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game; //	a reference to the currently running game
    this.add; //	used to add sprites, text, groups, etc
    this.camera; //	a reference to the game camera
    this.cache; //	the game cache
    this.input; //	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load; //	for preloading assets
    this.math; //	lots of useful common math operations
    this.sound; //	the sound manager - add a sound, play one, set-up markers, etc
    this.stage; //	the game stage
    this.time; //	the clock
    this.tweens; //	the tween manager
    this.world; //	the game world
    this.particles; //	the particle manager
    this.physics; //	the physics manager
    this.rnd; //	the repeatable random number generator

    //	You can use any of these from any function within this State.
    //	But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.
    this.PLAYER_TOP_OFFSET = 0;
};

BasicGame.Game.prototype = {
    GRIDSIZE: 32,
    GRIDSIZE_STR: "32",
    GRID_HEIGHT: 8,
    GRID_WIDTH: 6,
    PLAYER_SCROLL_HEIGHT: 4,
    PLAYER_TOP_OFFSET: 0,
    MINE_TILE: 1,
    tilesprite: null,
    map: null,
    mapLayer1: null,
    cursors: null,
    player: null,
    currentMove: {},
    proximityCount: 0,
    score: 0,
    collision: false,
    currentRow: 0,
    playerGridRef: 0,
    doMovePlayer: false,
    marker: {},
    thing:0,



    create: function() {

        this.GRID_HEIGHT = (this.stage.height / this.GRIDSIZE);
        this.GRID_WIDTH = (this.stage.width / this.GRIDSIZE);
        this.PLAYER_TOP_OFFSET = this.GRIDSIZE * 14 + this.GRIDSIZE / 2;

        this.game.stage.backgroundColor = '#2d2d2d';
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        console.log(">>>>>>" + this.stage.height);
        this.game.world.setBounds(0, 0, this.stage.width, this.stage.height * 2);
        this.game.camera.y = this.stage.height;
        // this.grid = this.game.add.tileSprite(0, 0, 700, 1000, 'grid');
        //  Creates a blank tilemap
        this.map = this.game.add.tiledmap('my-tiledmap');
        this.map.setPreventRecalculate(true);

        //  Add a Tileset image to the map
        //this.map.addTilesetImage('test', 'grid', this.GRIDSIZE, this.GRIDSIZE);

        //  Creates a new blank layer and sets the map dimensions.
        // this.mapLayer1 = this.map.create('mainMap', this.GRID_WIDTH, (this.GRID_HEIGHT * 2), this.GRIDSIZE, this.GRIDSIZE);
        //this.map.fill(1, 0, 0, this.GRID_WIDTH, this.GRID_HEIGHT * 2);

        //  Resize the world
        //   this.mapLayer1=this.map.getTilelayerIndex(0);

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.player = this.game.add.sprite(((this.GRID_WIDTH / 2) * this.GRIDSIZE) + this.GRIDSIZE / 2, this.stage.height + this.PLAYER_TOP_OFFSET, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        this.game.physics.arcade.enable(this.player);


        this.minesGroup = this.game.add.group();

        // this.screenMoving = false;

        var proximityStyle = {
            font: "25px Arial",
            fill: "#fff",
            align: "center"
        };
        this.proximityText = this.game.add.text(this.game.world.centerX, 20, "Proximity: " + this.proximityCount + " - Score: " + this.score, proximityStyle);
        this.proximityText.anchor.set(0.5, 0);
        this.proximityText.fixedToCamera = true;

        this.currentRow = this.getGridRef(this.game.camera).y;

        this.currentMove.screenUp = false;
        this.currentMove.screenDown = false;
        this.currentMove.playerMoving = false;

        this.playerGridRef = this.getGridRef(this.player);

        this.drawNextRow();
        this.addMarkerTile();

        this.input.onUp.add(this.movePlayer, this);

        //this.game.camera.follow(this.player);

    },



    update: function() {
        /*  if (this.cursors.up.isDown) {
            this.game.add.tween(this.player).to({
                y: "-" + this.GRIDSIZE_STR
            }, 250, Phaser.Easing.Cubic.InOut, true);

        }*/


        this.currentRow = this.getGridRef(this.game.camera).y;
        this.playerGridRef = this.getGridRef(this.player);

        if (!this.currentMove.playerMoving) {
            if (this.touchedTile) {
                if (this.touchedTile.y / 32 < this.playerGridRef.y - 1) {
                    this.moveUp();
                } else if (this.touchedTile.y / 32 > this.playerGridRef.y - 1) {
                    this.moveDown();
                } else if (this.touchedTile.x / 32 < this.playerGridRef.x - 1) {
                    this.moveHorizontal(true);
                } else if (this.touchedTile.x / 32 > this.playerGridRef.x - 1) {
                    this.moveHorizontal(false);
                }
                this.touchedTile = null;
            } else if (this.cursors.up.isDown) {
                this.moveUp();
            } else if (this.cursors.down.isDown) {
                this.moveDown();
            } else if (this.cursors.left.isDown) {

                this.moveHorizontal(true);
            } else if (this.cursors.right.isDown) {

                this.moveHorizontal(false);
            }
        }
        if (this.currentMove.screenUp) {
            this.game.camera.y = this.player.y - this.PLAYER_TOP_OFFSET;
        }
    },
    render: function() {

        // this.game.debug.cameraInfo(this.game.camera, 0, 32);
        //this.game.debug.spriteCoords(this.player, 32, 32);

    },

    movePlayer: function() {
        // this.marker.x = this.mapLayer1.getTileX(this.game.input.activePointer.worldX,0) * this.GRIDSIZE;
        // this.marker.y = this.mapLayer1.getTileY(this.game.input.activePointer.worldY,0) * this.GRIDSIZE;
        this.touchedTile = this.map.getTileWorldXY(this.game.input.activePointer.worldX, this.game.input.activePointer.worldY, 32, 32, 0);



        // this.touchedTile = this.map.getTile(this.mapLayer1.getTileX(this.marker.x), this.mapLayer1.getTileY(this.marker.y), 0);
    },

    moveUp: function() {
        if (this.game.camera.y === 0) {
            this.player.y += this.stage.height;
            this.game.camera.y = this.stage.height;
            this.currentRow = this.getGridRef(this.game.camera).y;
            this.playerGridRef = this.getGridRef(this.player);
            this.drawNextRow();
        }

        this.game.add.tween(this.player).to({

            y: "-" + this.GRIDSIZE_STR
        }, 250, Phaser.Easing.Cubic.InOut, true).onComplete.addOnce(function() {
            this.drawNextRow();
            this.currentMove.playerMoving = false;
            if (this.currentMove.screenUp) {
                this.updateScore();
            }
            this.currentMove.screenUp = false;
            this.currentMove.screenDown = false;
            this.updateProximityCount();
            this.addMarkerTile();
        }, this);
        this.currentMove.playerMoving = true;
        this.currentMove.screenDown = false;
        console.log(this.playerGridRef.relativeY);
        if (this.playerGridRef.relativeY <= this.GRID_HEIGHT - 3) {
            this.currentMove.screenUp = true;

        }
    },

    moveDown: function() {
        if (this.playerGridRef.relativeY <= this.GRID_HEIGHT - 1) {

            this.game.add.tween(this.player).to({

                y: this.GRIDSIZE_STR
            }, 250, Phaser.Easing.Cubic.InOut, true).onComplete.addOnce(function() {
                this.currentMove.playerMoving = false;
                this.currentMove.screenUp = false;
                this.currentMove.screenDown = false;
                this.updateProximityCount();

                this.addMarkerTile();
            }, this);
            this.currentMove.playerMoving = true;
            this.currentMove.screenUp = false;
            this.currentMove.screenDown = true;
        }
    },
    moveHorizontal: function(left) {
        var moveVector = 0;
        if (left) {
            moveVector = "-" + this.GRIDSIZE_STR;
        } else {
            moveVector = this.GRIDSIZE_STR;
        }

        this.game.add.tween(this.player).to({

            x: moveVector
        }, 250, Phaser.Easing.Cubic.InOut, true).onComplete.addOnce(function() {
            this.currentMove.playerMoving = false;
            this.currentMove.screenUp = false;
            this.currentMove.screenDown = false;
            this.updateProximityCount();

            this.addMarkerTile();
        }, this);
        this.currentMove.playerMoving = true;
        this.currentMove.screenUp = false;
        this.currentMove.screenDown = false;
    },

    quitGame: function(pointer) {

        //	Here you should destroy anything you no longer need.
        //	Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //	Then let's go back to the main menu.
        this.state.start('MainMenu');

    },

    getGridRef: function(object) {
        var gridPosition = {}; // This may be inefficient

        gridPosition.x = Phaser.Math.roundAwayFromZero(object.x / this.GRIDSIZE);
        gridPosition.y = Phaser.Math.roundAwayFromZero(object.y / this.GRIDSIZE);
        gridPosition.relativeY = gridPosition.y - this.currentRow;
        return gridPosition;
    },

    drawNextRow: function() {
        console.log("this.currentRow: " + this.currentRow);
        // work out which row to paint
        if (this.currentRow < 0) {
            this.currentRow = this.GRID_HEIGHT;
        }

        // Crude clear row (temporary)
        for (var ndx = 0; ndx < this.GRID_WIDTH; ndx++) {
            var tile = this.map.putTile(85, ndx, this.currentRow - 1, 0);
            if (tile && tile.properties) {
                tile.properties.isMine = 0;
            } else {
                console.log("WHY DOES THIS HAPPEN?!!!!!!*********");

            }
        }
        var xTile = this.game.rnd.integerInRange(1, this.GRID_WIDTH - 1);
        var mineTile = this.map.putTile(2, xTile, this.currentRow - 1, 0)
        if (mineTile && mineTile.properties) {
            mineTile.properties.isMine = this.thing++;
            console.log("set mine to true");
        } else {
            console.log("WHY DOES THIS HAPPEN?!!!!!!*********");

        }
        //this.map.putTile(1, 1, this.currentRow +this.GRID_HEIGHT) ;

        for (ndx = 0; ndx < this.GRID_WIDTH; ndx++) {
            var copyTile = this.map.getTile(ndx, this.currentRow, 0)
            if (copyTile) {
                  //this.map.putTile(copyTile, ndx, this.currentRow + this.GRID_HEIGHT, 0);
            }
        }
        // copy new tile to mirror
        //var cloneRow = this.map.copy(0, this.currentRow, 2, 1);
        //this.map.paste(0, 5, cloneRow);
        // this.map.putTile(1, 0, this.currentRow - 1 + 8);
    },

    addMarkerTile: function() {
        var mirrorRow = this.playerGridRef.y - 1 + this.GRID_HEIGHT * 2;

        this.map.putTile(0, this.playerGridRef.x - 1, this.playerGridRef.y - 1, 0);

        if ((this.playerGridRef.y === this.GRID_HEIGHT) || (this.playerGridRef.y === this.GRID_HEIGHT - 1) || (this.playerGridRef.y === this.GRID_HEIGHT - 2) || (this.playerGridRef.y === this.GRID_HEIGHT - 3)) {
            this.map.putTile(0, this.playerGridRef.x - 1, this.playerGridRef.y - 1 + this.GRID_HEIGHT, 0);
        }
        console.log(this.playerGridRef.relativeY, this.playerGridRef.y);
    },
    updateScore: function() {
        this.score++;
        this.proximityText.text = "Proximity: " + this.proximityCount + " - Score: " + this.score;

    },
    updateProximityCount: function() {
        this.proximityCount = 0;
        this.collision = false;
        var currentTile = null;
        for (var xNdx = -2; xNdx < 1; xNdx++) {
            for (var yNdx = -2; yNdx < 1; yNdx++) {
                currentTile = this.map.getTile(this.playerGridRef.x + xNdx, this.playerGridRef.y + yNdx, 0);
                if (currentTile && currentTile.properties) {
                    console.log(this.playerGridRef.x + xNdx, this.playerGridRef.y + yNdx, currentTile.properties.isMine);

                    console.dir(currentTile);
                    if (currentTile.properties.isMine) {
                        this.proximityCount++;
                    }
                }
            }
        }

        // Left middle
        currentTile = this.map.getTile(this.playerGridRef.x - 1, this.playerGridRef.y - 1, 0);


        console.log(">> " + currentTile);
        if (currentTile.properties && currentTile.properties.isMine) {
            this.collision = true;
        }
        if (this.collision) {
            this.proximityText.text = "GAME OVER";
        } else {
            this.proximityText.text = "Proximity: " + this.proximityCount + " - Score: " + this.score;
        }
    },

    /*  updateGridPosition: function(object) {
        if (!object.gridPosition) {
            object.gridPosition = {};
        }

        object.gridPosition.x = Phaser.Math.roundAwayFromZero(object.x / this.GRIDSIZE);
        object.gridPosition.y = this.GRID_HEIGHT - Phaser.Math.roundAwayFromZero(object.y / this.GRIDSIZE) + 1;

    },*/

};