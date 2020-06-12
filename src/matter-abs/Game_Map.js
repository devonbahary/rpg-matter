//-----------------------------------------------------------------------------
// Game_Map
//
// The game object class for a map. It contains scrolling and passage
// determination functions.

import MATTER_ABS from "./MatterActionBattleSystem";

const _Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
    $gameTroop.clear();
    _Game_Map_setup.call(this, mapId);
    this._hitStopZoomTarget = null;
};

const _Game_Map_update = Game_Map.prototype.update;
Game_Map.prototype.update = function(sceneActive) {
    _Game_Map_update.call(this, sceneActive);
    if (!sceneActive) return;
    this.updateUnits();
    this.updateHitStopZoom();
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