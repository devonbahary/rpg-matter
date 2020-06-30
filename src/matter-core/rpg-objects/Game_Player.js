//-----------------------------------------------------------------------------
// Game_Player
//
// The game object class for the player. It contains event starting
// determinants and map scrolling functions.

import { Vector } from "matter-js";
import { BODY_LABELS } from "../constants";
import MATTER_CORE from "../pluginParams";

Game_Player.prototype.initCharacterBodyOptions = function() {
    return {
        ...Game_Character.prototype.initCharacterBodyOptions.call(this),
        label: BODY_LABELS.PLAYER,
    };
};

Game_Player.prototype.moveByInput = function() {
    if (!this.canMove()) return;

    const direction = this.getInputDirection();
    if (direction) {
        if (this.hasDestination()) this.clearPathfinding();
        this.moveInDirection(direction);
    }
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

Game_Player.prototype.stepsThisFrame = function() {
    if (!this.isNormal()) return 0;
    return Vector.magnitude(this.body.velocity) / MATTER_CORE.TILE_SIZE;
};  

Game_Player.prototype.increaseSteps = function() {
    Game_Character.prototype.increaseSteps.call(this);
    $gameParty.increaseSteps(this.stepsThisFrame());
};

// overwrite (this.isMoving()) early return
Game_Player.prototype.updateDashing = function() {
    if (this.canMove() && !this.isInVehicle() && !$gameMap.isDashDisabled()) {
        this._dashing = this.isDashButtonPressed() || (MATTER_CORE.IS_CLICK_TO_MOVE_DASH && $gameTemp.isDestinationValid());
    } else {
        this._dashing = false;
    }
};

const _Game_Player_update = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive) {
    this.updateClosestActionButtonEvent();
    _Game_Player_update.call(this, sceneActive);
    this.triggerAction();
    this.updateOnMoving();
};

Game_Player.prototype.updateClosestActionButtonEvent = function() {
    const actionButtonEventsInRange = $gameMap.characterBodiesInBoundingBox(this.squareInFrontOf()).reduce((acc, characterBody) => {
        if (characterBody.character.isActionEvent) acc.push(characterBody.character);
        return acc;
    }, []);

    const actionButtonEventsByRange = actionButtonEventsInRange.sort((a, b) => this.distanceFrom(a) - this.distanceFrom(b));
    this.closestActionButtonEvent = actionButtonEventsByRange.length ? actionButtonEventsByRange[0] : null;
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

Game_Player.prototype.updateNonmoving = function(wasMoving) {
    /* note: 
        - used to $gameParty.onPlayerWalk() here, but is now handled in $gameParty.increaseSteps()
        - used to check event trigger, but that's handled through Matter Events
        - used to triggerAction(), but that happens every frame now
        - used to update encounter count here, but that's handled through updateOnMoving() 
    */
    return; // overwrite; nothing happening here should not occur while in motion 
};

Game_Player.prototype.updateOnMoving = function() {
    if (this.isMoving() && !$gameMap.isEventRunning()) {
        this.updateEncounterCount();
    }
};

Game_Player.prototype.clearDestination = function() {
    Game_Character.prototype.clearDestination.call(this);
    if (!this.hasDestination()) $gameTemp.clearDestination();
};

// overwrite to remove non-collision based event checks, triggerTouchAction(), and odd return boolean
Game_Player.prototype.triggerAction = function() {
    if (this.canMove()) this.triggerButtonAction();
};

// overwrite to remove non-collision based event checks and odd return boolean
Game_Player.prototype.triggerButtonAction = function() {
    if (!Input.isTriggered('ok') || this.getOnOffVehicle() || !this.canStartLocalEvents()) return;
    
    if (this.closestActionButtonEvent) this.closestActionButtonEvent.start();
};

Game_Player.prototype.encounterProgressValue = function() {
    const baseValue = this.stepsThisFrame();
    var value = $gameMap.isBush(this.x, this.y) ? 2 * baseValue : baseValue; // used to be only 2 or 1
    if ($gameParty.hasEncounterHalf()) {
        value *= 0.5;
    }
    if (this.isInShip()) {
        value *= 0.5;
    }
    return value;
};