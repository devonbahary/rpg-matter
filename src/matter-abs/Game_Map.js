//-----------------------------------------------------------------------------
// Game_Map
//
// The game object class for a map. It contains scrolling and passage
// determination functions.

const _Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
    $gameTroop.clear();
    _Game_Map_setup.call(this, mapId);
};

const _Game_Map_update = Game_Map.prototype.update;
Game_Map.prototype.update = function(sceneActive) {
    _Game_Map_update.call(this, sceneActive);
    if (sceneActive) this.updateUnits();
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