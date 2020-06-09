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
    this.updateZoom();
};

Game_Map.prototype.updateUnits = function() {
    $gameParty.update();
    $gameTroop.update();
};

Game_Map.prototype.unitMembers = function() {
    return [
        ...$gameParty.members(),
        ...$gameTroop.members(),
    ];
};

Game_Map.prototype.battlersInBoundingBox = function(bounds) {
    return this.characterBodiesInBoundingBox(bounds).reduce((battlers, characterBody) => {
        const battler = characterBody.character.battler;
        if (battler) battlers.push(battler);
        return battlers;
    }, []);
};

Game_Map.prototype.updateZoom = function() {
    const duration = MATTER_ABS.HIT_STOP_ZOOM.DURATION;
    if (!this._hitStopZoomTarget) {
        for (const battler of this.unitMembers()) {
            if (battler.isHitStopTarget()) {
                const scale = MATTER_ABS.HIT_STOP_ZOOM.SCALE;
                $gameScreen.startZoom(battler.character.x0, battler.character.y0, scale, duration);
                this._hitStopZoomTarget = battler.character;
            }
        }
    } else if (!this._hitStopZoomTarget.isHitStopTarget()) {
        this._hitStopZoomTarget = null;
        $gameScreen.startZoom(0, 0, 1, duration); // reset
    }
};