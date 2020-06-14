//-----------------------------------------------------------------------------
// Spriteset_Map
//
// The set of sprites on the map screen.

const _Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;
Spriteset_Map.prototype.createCharacters = function() {
    _Spriteset_Map_createCharacters.call(this);
    for (const characterSprite of this._characterSprites.slice()) {
        const sprite = new Sprite_CharacterWeapon(characterSprite._character, characterSprite);
        this._characterSprites.push(sprite);
        this._tilemap.addChild(sprite);
    }
};
