import { get } from "lodash";
import { getWeaponSpritePosition } from "../weapon-poses";

//-----------------------------------------------------------------------------
// Sprite_CharacterWeapon
//
// The sprite for displaying a character's weapon.

function Sprite_CharacterWeapon() {
    this.initialize.apply(this, arguments);
}

Sprite_CharacterWeapon.prototype = Object.create(Sprite_Base.prototype);
Sprite_CharacterWeapon.prototype.constructor = Sprite_CharacterWeapon;

Object.defineProperties(Sprite_CharacterWeapon.prototype, {
    id: { get: function() { return this._character === $gamePlayer ? 143 : 0 }},
    _characterWeaponIconIndex: { get: function() { return get(this, '_character.weaponIconIndex', 0); }, configurable: false },
});

Sprite_CharacterWeapon.prototype.initialize = function(character, extendedSprite) {
    Sprite_Base.prototype.initialize.call(this);
    this.loadBitmap();
    this.setCharacter(character);
    this.z = character.screenZ(); // important; z-ordering wasn't working immediately while z began undefined
    this._iconIndex = 0;
    this._isCharacterWeapon = true;
    this._extendedSprite = extendedSprite; // this sprite is an "extension" of the extendedSprite
};

Sprite_CharacterWeapon._iconWidth  = 32;
Sprite_CharacterWeapon._iconHeight = 32;

Sprite_CharacterWeapon.prototype.loadBitmap = function() {
    this.bitmap = ImageManager.loadSystem('IconSet');
    this.setFrame(0, 0, 0, 0);
};

Sprite_CharacterWeapon.prototype.setCharacter = function(character) {
    this._character = character;
};

Sprite_CharacterWeapon.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
    this.updateIconIndex();
    this.updatePosition();
    this.updateAnimation();
};

Sprite_CharacterWeapon.prototype.updateIconIndex = function() {
    if (this._iconIndex !== this._characterWeaponIconIndex) {
        this._iconIndex = this._characterWeaponIconIndex;
        this.updateFrame();
    }
};

Sprite_CharacterWeapon.prototype.updateFrame = function() {
    Sprite_StateIcon.prototype.updateFrame.call(this);
};

Sprite_CharacterWeapon.prototype.updatePosition = function() {
    if (!this._iconIndex) return;

    // TODO: do we need to update every frame, or do we only update when the dependencies update and we memoize
    // - iconIndex
    // - weaponPose
    // - direction
    // - pattern

    // TODO: account for bushDepth, character currently goes partially opaque while weapon shows through
    // TODO: jitterfix
    const direction = this._character.direction();
    const { 
        anchorX, 
        anchorY, 
        rotation, 
        scaleX,
        scaleY,
        x: dx, 
        y: dy,
        z: dz,
     } = getWeaponSpritePosition(this._character.weaponPose, direction, this._character.pattern(), this._iconIndex);

    this.anchor.x = anchorX;
    this.anchor.y = anchorY;
    this.rotation = rotation;
    
    this.scale.x = scaleX;
    this.scale.y = scaleY;

    this.x = this._extendedSprite.x + dx; 
    this.y = this._extendedSprite.y + dy;
    this.z = this._extendedSprite.z;
    this.dz = dz; // influence placement above or below -only- its associated Sprite_Character
};

Sprite_CharacterWeapon.prototype.updateAnimation = function() {
    this.setupAnimation();
    if (!this.isAnimationPlaying()) {
        this._character.endAnimation();
    }
};

Sprite_CharacterWeapon.prototype.setupAnimation = function() {
    if (this._character.weaponAnimationId() > 0) {
        var animation = $dataAnimations[this._character.weaponAnimationId()];
        this.startAnimation(animation, false, 0);
        this._character.startWeaponAnimation();
    }
};

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

/**
 * @method _compareChildOrder
 * @param {Object} a
 * @param {Object} b
 * @private
 */
Tilemap.prototype._compareChildOrder = function(a, b) {
    let { z: aZ } = a;
    let { z: bZ } = b;

    if (a._character === b._character && (a._isCharacterWeapon || b._isCharacterWeapon)) {
        if (a._isCharacterWeapon) aZ += a.dz;
        if (b._isCharacterWeapon) bZ += b.dz;
    }

    if (aZ !== bZ) {
        return aZ - bZ;
    } else if (a.y !== b.y) {
        return a.y - b.y;
    } else {
        return a.spriteId - b.spriteId;
    }
};