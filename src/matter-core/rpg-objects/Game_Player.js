//-----------------------------------------------------------------------------
// Game_Player
//
// The game object class for the player. It contains event starting
// determinants and map scrolling functions.

import { Bodies, Events, Vector } from "matter-js";
import { getPartsFromBodies } from "../utils/bodies";
import { BODY_LABELS } from "../constants";
import { EVENT_TRIGGERS } from "../../common/constants";
import MATTER_CORE from "../pluginParams";

const BODY_EVENTS = {
    EVENT_ENTER_PLAYER_SENSOR: 'eventEnterPlayerSensor',
    EVENT_EXIT_PLAYER_SENSOR: 'eventExitPlayerSensor',
};

const _Game_Player_initMembers = Game_Player.prototype.initMembers;
Game_Player.prototype.initMembers = function() {
    _Game_Player_initMembers.call(this);
    this._actionButtonEventsInRange = [];
};

Game_Player.prototype.closestActionButtonEventInRange = function() {
    if (!this._actionButtonEventsInRange.length) return null;
    return this._actionButtonEventsInRange.sort((a, b) => this.distanceFrom(a) - this.distanceFrom(b))[0];
};

Game_Player.prototype.initBodyParts = function() {
    return [ 
        ...Game_Character.prototype.initBodyParts.call(this),
        this.initSensorBody(),
    ];
};

Game_Player.prototype.initCharacterBodyOptions = function() {
    return {
        ...Game_Character.prototype.initCharacterBodyOptions.call(this),
        label: BODY_LABELS.PLAYER,
    };
};

Game_Player.prototype.initSensorBody = function() {
    const length = this.radius * 2 * MATTER_CORE.INTERACTION_RADIUS;
    const options = {
        density: 0.00001,
        isSensor: true,
        label: BODY_LABELS.PLAYER_SENSOR,
    };
    return Bodies.polygon(length, 0, 3, length, options);
};

Game_Player.prototype.setupMatterEvents = function() {
    Game_Character.prototype.setupMatterEvents.call(this);
    Events.on(this.body, BODY_EVENTS.EVENT_ENTER_PLAYER_SENSOR, this.onEventEnterPlayerSensor.bind(this));  
    Events.on(this.body, BODY_EVENTS.EVENT_EXIT_PLAYER_SENSOR, this.onEventExitPlayerSensor.bind(this));  
};

Game_Player.prototype.onCollisionStart = function(event) {
    Game_Character.prototype.onCollisionStart.call(this, event);
    if (this.isEventOnSensorCollision(event)) Events.trigger(this.body, BODY_EVENTS.EVENT_ENTER_PLAYER_SENSOR, event);
};

Game_Player.prototype.onCollisionEnd = function(event) {
    Game_Character.prototype.onCollisionEnd.call(this, event);
    if (this.isEventOnSensorCollision(event)) Events.trigger(this.body, BODY_EVENTS.EVENT_EXIT_PLAYER_SENSOR, event);
};

Game_Player.prototype.isEventOnSensorCollision = function(event) {
    return event.source.label === BODY_LABELS.PLAYER_SENSOR && event.pair.label === BODY_LABELS.EVENT;
};

Game_Player.prototype.onEventEnterPlayerSensor = function(event) {
    const gameEvent = event.pair.character;
    if (gameEvent.isTriggerIn([ EVENT_TRIGGERS.ACTION_BUTTON ])) {
        this._actionButtonEventsInRange.push(gameEvent);
    }
};

Game_Player.prototype.onEventExitPlayerSensor = function(event) {
    const gameEvent = event.pair.character;
    if (gameEvent.isTriggerIn([ EVENT_TRIGGERS.ACTION_BUTTON ])) {
        this._actionButtonEventsInRange = this._actionButtonEventsInRange.filter(event => event !== gameEvent);
    }
};

Game_Player.prototype.onPathfindingDestination = function(pathfindingDestinationPos) {
    Game_Character.prototype.onPathfindingDestination.call(this, pathfindingDestinationPos);
    if (!this.canStartLocalEvents()) return;

    const characterBodiesAtDestination = getPartsFromBodies($gameMap.characterBodiesAtPoint(pathfindingDestinationPos));
    const actionEventBodiesAtDestination = characterBodiesAtDestination.filter(charBody => {
        return charBody.label === BODY_LABELS.EVENT && charBody.character.isTriggerIn([ EVENT_TRIGGERS.ACTION_BUTTON ]);
    });
    if (actionEventBodiesAtDestination.length) actionEventBodiesAtDestination[0].character.start();
};

Game_Player.prototype.moveByInput = function() {
    if (!this.canMove()) return;

    const direction = this.getInputDirection();
    if (direction) {
        if (this.hasDestination()) this.clearPathfinding();
        this.move(direction);
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
    _Game_Player_update.call(this, sceneActive);
    this.triggerAction();
    this.updateOnMoving();
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
    if (!Input.isTriggered('ok')) return;
    
    if (this.getOnOffVehicle()) return;
    
    const closestActionButtonEventInRange = this.closestActionButtonEventInRange();
    if (closestActionButtonEventInRange && this.canStartLocalEvents()) {
        closestActionButtonEventInRange.start();
    }
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