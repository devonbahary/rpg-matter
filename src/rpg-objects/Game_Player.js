//-----------------------------------------------------------------------------
// Game_Player
//
// The game object class for the player. It contains event starting
// determinants and map scrolling functions.

import { Bodies, Vector } from "matter-js";
import MATTER_PLUGIN from "../pluginParams";

Game_Player.prototype.initBodyParts = function() {
    return [ 
        ...Game_Character.prototype.initBodyParts.call(this),
        this.initSensorBody(),
    ];
};

Game_Player.prototype.initCharacterBodyOptions = function() {
    return {
        ...Game_Character.prototype.initCharacterBodyOptions.call(this),
        label: 'player',
    };
};

Game_Player.prototype.initSensorBody = function() {
    return Bodies.circle(0, 0, this.radius * 3, {
        density: 0.00001,
        isSensor: true,
        label: 'player-sensor',
    });
};

Game_Player.prototype.onCollisionStart = function(event) {
};

Game_Player.prototype.onCollisionActive = function(event) {
};

Game_Player.prototype.onCollisionEnd = function(event) {
};

Game_Player.prototype.moveByInput = function() {
    if (!this.canMove()) return;

    const direction = this.getInputDirection();
    if (direction) this.move(direction);
};

Game_Player.prototype.getInputDirection = function() {
    return Input.dir8; // overwrite
};

const _Game_Player_centerX = Game_Player.prototype.centerX;
Game_Player.prototype.centerX = function() {
    return _Game_Player_centerX.call(this) + this.width / 2;
};

const _Game_Player_centerY = Game_Player.prototype.centerY;
Game_Player.prototype.centerY = function() {
    return _Game_Player_centerY.call(this) + this.height / 2;
};

Game_Player.prototype.increaseSteps = function() {
    Game_Character.prototype.increaseSteps.call(this);
    if (this.isNormal()) {
        const magnitude = Vector.magnitude(this.body.velocity);
        const steps = magnitude / MATTER_PLUGIN.TILE_SIZE;
        $gameParty.increaseSteps(steps);
    }
};

// overwrite (this.isMoving()) early return
Game_Player.prototype.updateDashing = function() {
    if (this.canMove() && !this.isInVehicle() && !$gameMap.isDashDisabled()) {
        this._dashing = this.isDashButtonPressed() || $gameTemp.isDestinationValid();
    } else {
        this._dashing = false;
    }
};

Game_Player.prototype.updateScroll = function() {
    var x1 = this._lastScrolledX; // overwrite
    var y1 = this._lastScrolledY; // overwrite
    var x2 = this.scrolledX();
    var y2 = this.scrolledY();
    if (y2 > y1 && y2 > this.centerY()) {
        $gameMap.scrollDown(y2 - y1);
    }
    if (x2 < x1 && x2 < this.centerX()) {
        $gameMap.scrollLeft(x1 - x2);
    }
    if (x2 > x1 && x2 > this.centerX()) {
        $gameMap.scrollRight(x2 - x1);
    }
    if (y2 < y1 && y2 < this.centerY()) {
        $gameMap.scrollUp(y1 - y2);
    }
    this._lastScrolledX = this.scrolledX();
    this._lastScrolledY = this.scrolledY();
};