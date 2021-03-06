//-----------------------------------------------------------------------------
// Game_Map
//
// The game object class for a map. It contains scrolling and passage
// determination functions.

import Blackboard from "./behavior-tree/Blackboard";
import MATTER_ABS from "./MatterActionBattleSystem";

const _Game_Map_initialize = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function() {
    _Game_Map_initialize.call(this);
    this.initBlackboard();
};

const _Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
    $gameTroop.clear();
    this.initBlackboard();
    _Game_Map_setup.call(this, mapId);
    this._hitStopZoomTarget = null;
    this.setSelectionMode(false);
    this.logs = [];
};

Game_Map.prototype.initBlackboard = function() {
    this.blackboard = new Blackboard();
};

Game_Map.prototype.hasLogs = function() {
    return this.logs.length;
};

Game_Map.prototype.addLog = function(log) {
    this.logs.push(log);
};

const _Game_Map_update = Game_Map.prototype.update;
Game_Map.prototype.update = function(sceneActive) {
    _Game_Map_update.call(this, sceneActive);
    if (!sceneActive || this.isMapPaused() || this.isEventRunning() || $gameMessage.isBusy()) return;
    this.updateUnits();
    this.updateHitStopZoom();
};

const _Game_Map_shouldUpdateEngine = Game_Map.prototype.shouldUpdateEngine;
Game_Map.prototype.shouldUpdateEngine = function(sceneActive) {
    return _Game_Map_shouldUpdateEngine.call(this, sceneActive) && !this.isSelectionMode;
};

const _Game_Map_updateEvents = Game_Map.prototype.updateEvents;
Game_Map.prototype.updateEvents = function() {
    if (!this.isMapPaused()) _Game_Map_updateEvents.call(this);
};

const _Game_Map_updateVehicles = Game_Map.prototype.updateVehicles;
Game_Map.prototype.updateVehicles = function() {
    if (!this.isMapPaused()) _Game_Map_updateVehicles.call(this);
};

Game_Map.prototype.updateUnits = function() {
    $gameParty.update();
    $gameTroop.update();
};

Game_Map.prototype.battlersInBoundingBox = function(bounds) {
    return this.characterBodiesInBoundingBox(bounds).reduce((battlers, characterBody) => {
        const battler = characterBody.character.battler;
        if (battler) battlers.push(battler);
        return battlers;
    }, []);
};

Game_Map.prototype.updateHitStopZoom = function() {
    if (!this._hitStopZoomTarget || this._hitStopZoomTarget.isHitStopTarget()) return;
    $gameScreen.startZoom(0, 0, 1, MATTER_ABS.HIT_STOP_ZOOM.DURATION); // reset
    this._hitStopZoomTarget = null;
};

Game_Map.prototype.setHitStopZoomTarget = function(character, zoomScale) {
    this._hitStopZoomTarget = character;
    $gameScreen.startZoom(
        character.screenX(), 
        character.screenY(), 
        zoomScale, 
        MATTER_ABS.HIT_STOP_ZOOM.DURATION,
    );
};

Game_Map.prototype.setSelectionMode = function(isSelectionMode) {
    this.isSelectionMode = isSelectionMode;
    if (isSelectionMode) {
        $gameScreen.startPlayerSelectionTint();
    } else {
        $gameScreen.endPlayerSelectionTint();
    }
};

const _Game_Map_updateEngineTiming = Game_Map.prototype.updateEngineTiming;
Game_Map.prototype.updateEngineTiming = function() {
    if (!this.isMapPaused()) _Game_Map_updateEngineTiming.call(this);
};

Game_Map.prototype.isMapPaused = function() {
    return this.isSelectionMode;
};