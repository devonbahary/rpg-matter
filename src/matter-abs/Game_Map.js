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

Game_Map.prototype.battlersInBoundingBox = function(bounds) {
    return this.characterBodiesInBoundingBox(bounds).reduce((battlers, characterBody) => {
        const battler = characterBody.character.battler;
        if (battler) battlers.push(battler);
        return battlers;
    }, []);
};

Game_Map.prototype.updateZoom = function() {
    const duration = MATTER_ABS.CRITICAL_HIT_ZOOM.DURATION;
    if (!this._hitStopZoomTarget) {
        for (const enemy of $gameTroop.members()) {
            if (enemy.isHitStopTarget()) {
                const scale = MATTER_ABS.CRITICAL_HIT_ZOOM.SCALE;
                $gameScreen.startZoom(enemy.character.centerX, enemy.character.centerY, scale, duration);
                this._hitStopZoomTarget = enemy.character;
            }
        }
    } else if (!this._hitStopZoomTarget.isHitStopTarget()) {
        this._hitStopZoomTarget = null;
        $gameScreen.startZoom(0, 0, 1, duration); // reset
    }
};