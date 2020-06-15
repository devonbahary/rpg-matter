//-----------------------------------------------------------------------------
// Spriteset_Map
//
// The set of sprites on the map screen.

import { v4 as uuidv4 } from "uuid";

const _Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;
Spriteset_Map.prototype.createCharacters = function() {
    _Spriteset_Map_createCharacters.call(this);
    for (const characterSprite of this._characterSprites.slice()) {
        const spritesetMapId = uuidv4(); // we want to identify a character with its sprites to remove later

        const weaponSprite = new Sprite_CharacterWeapon(characterSprite._character, characterSprite);
        weaponSprite.spritesetMapId = spritesetMapId;
        characterSprite.spritesetMapId = spritesetMapId;
        characterSprite._character.spritesetMapId = spritesetMapId;
        
        this._characterSprites.push(weaponSprite);
        this._tilemap.addChild(weaponSprite);
    }
};

Spriteset_Map.prototype.addCharacterToTilemap = function(character) {
    const characterSprite = new Sprite_Character(character);
    const weaponSprite = new Sprite_CharacterWeapon(character, characterSprite);
    
    const spritesetMapId = uuidv4(); // we want to identify a character with its sprites to remove later
    
    for (const sprite of [ characterSprite, weaponSprite ]) {
        sprite.spritesetMapId = spritesetMapId;
        character.spritesetMapId = (spritesetMapId);
        
        this._characterSprites.push(sprite);
        this._tilemap.addChild(sprite);
    }
};

Spriteset_Map.prototype.removeCharacterFromTilemap = function(character) {
    if (!character.spritesetMapId) return;
    
    const removeChildren = this._tilemap.children.filter(c => c.spritesetMapId === character.spritesetMapId);
    for (const child of removeChildren) {
        this._tilemap.removeChild(child);
    }
};