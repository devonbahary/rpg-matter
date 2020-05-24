import { get } from "lodash";
import { getWeaponSpritePosition } from "../weaponPoses";

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

Sprite_CharacterWeapon.prototype.initialize = function(character) {
    Sprite_Base.prototype.initialize.call(this);
    this.loadBitmap();
    this.setCharacter(character);
    this._iconIndex = 0;
    this.z = character.screenZ(); // important; z-ordering wasn't working immediately while z began undefined
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
    const direction = this._character.direction();
    const { 
        anchorX, 
        anchorY, 
        rotation, 
        scaleX,
        scaleY,
        x, 
        y,
     } = getWeaponSpritePosition(this._character.weaponPose, direction, this._character.pattern(), this._iconIndex);

    this.anchor.x = anchorX;
    this.anchor.y = anchorY;
    this.rotation = rotation;
    
    this.scale.x = scaleX;
    this.scale.y = scaleY;

    this.x = this._character.screenX() + x;
    this.y = this._character.screenY() + y;
    this.z = this._character.screenZ() + (this.shouldShowBehindCharacter() ? -1 : 1);
};

Sprite_CharacterWeapon.prototype.shouldShowBehindCharacter = function() {
    return [ 4, 8 ].includes(this._character.direction());
};

//-----------------------------------------------------------------------------
// Spriteset_Map
//
// The set of sprites on the map screen.

const _Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;
Spriteset_Map.prototype.createCharacters = function() {
    _Spriteset_Map_createCharacters.call(this);
    for (const event of $gameMap.events()) {
        const sprite = new Sprite_CharacterWeapon(event);
        this._characterSprites.push(sprite);
        this._tilemap.addChild(sprite);
    }
    $gamePlayer.followers().reverseEach(follower => {
        const sprite = new Sprite_CharacterWeapon(follower);
        this._characterSprites.push(sprite);
        this._tilemap.addChild(sprite);
    });
    const playerWeaponSprite = new Sprite_CharacterWeapon($gamePlayer);
    this._characterSprites.push(playerWeaponSprite);
    this._tilemap.addChild(playerWeaponSprite);
};