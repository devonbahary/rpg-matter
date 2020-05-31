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

Game_Map.prototype.battlersInBoundingBox = function(bounds) {
    return this.characterBodiesInBoundingBox(bounds).reduce((battlers, characterBody) => {
        const battler = characterBody.character.battler;
        if (battler) battlers.push(battler);
        return battlers;
    }, []);
};