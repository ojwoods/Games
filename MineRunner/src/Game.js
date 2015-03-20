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
    thing: 0,
    lastMineTile: null,
    greenTile: null,
    tracksTile: null,
    roadNdx: 5,
    weightedRoadDirection: [0, 1, 2, 3, 4],
    roadTurnValue: 0,
    lastRowHadTurn: false,



    create: function() {
        this.GRID_HEIGHT = (this.stage.height / this.GRIDSIZE);
        this.GRID_WIDTH = (this.stage.width / this.GRIDSIZE);
        this.PLAYER_TOP_OFFSET = this.GRIDSIZE * this.GRID_HEIGHT / 2 + this.GRIDSIZE / 2;

        this.game.stage.backgroundColor = '#009900';
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.game.world.setBounds(0, 0, this.stage.width, this.stage.height * 2);
        this.game.camera.y = this.stage.height;
        // this.grid = this.game.add.tileSprite(0, 0, 700, 1000, 'grid');
        //  Creates a blank tilemap
        this.map = this.game.add.tilemap('terrain');
        this.map.setPreventRecalculate(true);
        this.map.addTilesetImage('maptiles', 'maptiles');


        this.mapLayer1 = this.map.createLayer('Main');

        this.mapLayer1.resizeWorld();

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

        this.drawNextRow(false);
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
                if (this.touchedTile.y < this.playerGridRef.y - 1) {
                    this.moveUp();
                } else if (this.touchedTile.y > this.playerGridRef.y - 1) {
                    this.moveDown();
                } else if (this.touchedTile.x < this.playerGridRef.x - 1) {
                    this.moveHorizontal(true);
                } else if (this.touchedTile.x > this.playerGridRef.x - 1) {
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
        this.marker.x = this.mapLayer1.getTileX(this.game.input.activePointer.worldX, 0) * this.GRIDSIZE;
        this.marker.y = this.mapLayer1.getTileY(this.game.input.activePointer.worldY, 0) * this.GRIDSIZE;
        // this.touchedTile = this.map.getTileWorldXY(this.game.input.activePointer.worldX, this.game.input.activePointer.worldY, 32, 32, 0);



        this.touchedTile = this.map.getTile(this.mapLayer1.getTileX(this.marker.x), this.mapLayer1.getTileY(this.marker.y), 0);
    },

    moveUp: function() {
        /* if (this.game.camera.y === 0) {
            this.player.y += this.stage.height;
            this.game.camera.y = this.stage.height;
            this.currentRow = this.getGridRef(this.game.camera).y;
            this.playerGridRef = this.getGridRef(this.player);
            this.drawNextRow();
        }*/
        var aboveTile = this.map.getTile(this.playerGridRef.x - 1, this.playerGridRef.y - 2);
        if (aboveTile.properties.hasOwnProperty("canLayMine") && aboveTile.properties.canLayMine === false) {
            return;
        }

        this.game.add.tween(this.player).to({

            y: "-" + this.GRIDSIZE_STR,
            angle:0
        }, 350, Phaser.Easing.Cubic.InOut, true).onComplete.addOnce(function() {
            this.checkScreenSwap();

            this.drawNextRow(false);

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

        if (this.playerGridRef.relativeY <= this.GRID_HEIGHT / 2 + 1) {
            this.currentMove.screenUp = true;

        }
    },

    moveDown: function() {
        var belowTile = this.map.getTile(this.playerGridRef.x - 1, this.playerGridRef.y);
        if (belowTile.properties.hasOwnProperty("canLayMine") && belowTile.properties.canLayMine === false) {
            return;
        }

        if (this.playerGridRef.relativeY <= this.GRID_HEIGHT - 1) {

            this.game.add.tween(this.player).to({

                y: this.GRIDSIZE_STR,
                angle: 180
            }, 350, Phaser.Easing.Cubic.InOut, true).onComplete.addOnce(function() {
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
        var nextTile = null;

        if (left) {
            nextTile = this.map.getTile(this.playerGridRef.x - 2, this.playerGridRef.y - 1);
            moveVector = "-" + this.GRIDSIZE_STR;
        } else {
            nextTile = this.map.getTile(this.playerGridRef.x, this.playerGridRef.y - 1);
            moveVector = this.GRIDSIZE_STR;
        }

        if (nextTile.properties.hasOwnProperty("canLayMine") && nextTile.properties.canLayMine === false) {
            return;
        }

        this.game.add.tween(this.player).to({

            x: moveVector,
            angle: 90
        }, 350, Phaser.Easing.Cubic.InOut, true).onComplete.addOnce(function() {
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

    checkScreenSwap: function() {
        if (Phaser.Math.roundTo(this.game.camera.y,0) === 0) {
            this.drawNextRow(true);

            this.player.y += this.stage.height;
            this.game.camera.y = this.stage.height;
            this.currentRow = this.getGridRef(this.game.camera).y;
            this.playerGridRef = this.getGridRef(this.player);
            return true;
        }
        return false;
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

    drawNextRow: function(onlyCopy) {
        // work out which row to paint
        /*if (this.currentRow < 0) {
            this.currentRow = this.GRID_HEIGHT;
        }*/
        if (!onlyCopy) {
            if (!this.lastRowHadTurn) // Prevent 2 turns in a row
            {
                this.roadTurnValue = this.game.rnd.weightedPick(this.weightedRoadDirection);
                this.lastRowHadTurn = true;
            } else {
                this.roadTurnValue = 0;
                this.lastRowHadTurn = false;
            }
            var roadLeft = Phaser.Math.clamp(this.roadNdx - this.roadTurnValue, 0, this.GRID_WIDTH);
            var roadRight = Phaser.Math.clamp(this.roadNdx + this.roadTurnValue, 0, this.GRID_WIDTH - 1);

            var newRoadNdx = this.game.rnd.between(roadLeft, roadRight);

            roadLeft = Phaser.Math.min(newRoadNdx, this.roadNdx);
            roadRight = Phaser.Math.max(newRoadNdx, this.roadNdx);
            console.log(roadLeft, roadRight, this.roadNdx, newRoadNdx);
            this.roadNdx = newRoadNdx;

            // Crude clear row (temporary)
            for (var ndx = 0; ndx < this.GRID_WIDTH; ndx++) {
                // var tile = this.map.getTile(ndx, this.currentRow - 1, 0);
                //this.map.layers[0].data[this.currentRow - 1][ndx].index = 0;
                var tileNdx = 2;

                if (ndx >= roadLeft && ndx <= roadRight) {
                    tileNdx = 1;
                } else if (this.game.rnd.between(0, 6) == 0) {
                    tileNdx = 10;
                }
                var tile = this.map.putTile(tileNdx, ndx, this.currentRow - 1, 0);
                //this.map.layers[0].tileIds[tile.ndx]=0;

                if (tile && tile.properties) {
                    tile.properties.isMine = false;

                    if (tileNdx == 10) {
                        tile.properties.canLayMine = false;
                    } else {
                        tile.properties.canLayMine = true;
                    }
                } else {
                    console.log("1 WHY DOES THIS HAPPEN?!!!!!!*********");

                }
            }
            // this.map.layers[0].dirty = true;
            var xTile = this.game.rnd.between(0, this.GRID_WIDTH - 1);
            var mineTile = this.map.getTile(xTile, this.currentRow - 1, 0)
            if (mineTile && mineTile.properties && tile.properties.canLayMine) {
                mineTile.properties.isMine = true;
                console.log("set mine to true");
            } else {
                console.log("2WHY DOES THIS HAPPEN?!!!!!!*********");

            }
            //this.map.putTile(1, 1, this.currentRow +this.GRID_HEIGHT) ;
        }
        for (ndx = 0; ndx < this.GRID_WIDTH; ndx++) {
            var copyTile = this.map.getTile(ndx, this.currentRow, 0)
            if (copyTile) {
                this.map.putTile(copyTile, ndx, this.currentRow + this.GRID_HEIGHT, 0);
            }
        }
        // copy new tile to mirror
        //var cloneRow = this.map.copy(0, this.currentRow, 2, 1);
        //this.map.paste(0, 5, cloneRow);
        // this.map.putTile(1, 0, this.currentRow - 1 + 8);
    },

    addMarkerTile: function() {
        var mirrorRow = this.playerGridRef.y - 1 + this.GRID_HEIGHT * 2;

        this.map.putTile(3 + this.proximityCount, this.playerGridRef.x - 1, this.playerGridRef.y - 1, 0);

        // if ((this.playerGridRef.y === this.GRID_HEIGHT) || (this.playerGridRef.y === this.GRID_HEIGHT - 1) || (this.playerGridRef.y === this.GRID_HEIGHT - 2) || (this.playerGridRef.y === this.GRID_HEIGHT - 3)) {
        this.map.putTile(3 + this.proximityCount, this.playerGridRef.x - 1, this.playerGridRef.y - 1 + this.GRID_HEIGHT, 0);
        //}
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
                    if (currentTile.properties.isMine) {
                        this.proximityCount++;
                    }
                }
            }
        }

        // Left middle
        currentTile = this.map.getTile(this.playerGridRef.x - 1, this.playerGridRef.y - 1, 0);


        if (currentTile.properties && currentTile.properties.isMine) {
            this.collision = true;
        }
        if (this.collision) {
            this.proximityText.text = "GAME OVER";
        } else {
            this.proximityText.text = "Proximity: " + this.proximityCount + " - Score: " + this.score;
        }
    },

    gameOver: function() {

    },

    /*  updateGridPosition: function(object) {
        if (!object.gridPosition) {
            object.gridPosition = {};
        }

        object.gridPosition.x = Phaser.Math.roundAwayFromZero(object.x / this.GRIDSIZE);
        object.gridPosition.y = this.GRID_HEIGHT - Phaser.Math.roundAwayFromZero(object.y / this.GRIDSIZE) + 1;

    },*/

};