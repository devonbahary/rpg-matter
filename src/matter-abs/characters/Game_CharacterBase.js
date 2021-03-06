//-----------------------------------------------------------------------------
// Game_CharacterBase
//
// The superclass of Game_Character. It handles basic information, such as
// coordinates and images, shared by all characters.

import { cloneDeep } from "lodash";

Object.defineProperties(Game_CharacterBase.prototype, {
    locationData: { get: function() { 
        return cloneDeep({ 
            bodyPos: this.bodyPos,
            body: {
                bounds: cloneDeep(this.body.bounds),
            },
            ...this.mapPos, 
            mapPos: this.mapPos, 
            radius: this.radius,
        }); 
    }, configurable: false },
});

const _Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
Game_CharacterBase.prototype.initMembers = function() {
    _Game_CharacterBase_initMembers.call(this);
    this._weaponAnimationId = 0;
    this._weaponAnimationPlaying = false;
    this._jumpHeight = 0;
};

Game_CharacterBase.prototype.addJump = function(height) {
    this._jumpHeight = Math.max(0, this._jumpHeight + height);
};

// overwrite
Game_CharacterBase.prototype.jumpHeight = function() {
    return this._jumpHeight;
};

const _Game_CharacterBase_requestAnimation = Game_CharacterBase.prototype.requestAnimation;
Game_CharacterBase.prototype.requestAnimation = function(animationId, rotateWithCharacter = false) {
    _Game_CharacterBase_requestAnimation.call(this, animationId);
    this._rotateAnimationWithCharacter = rotateWithCharacter;
};

Game_CharacterBase.prototype.requestWeaponAnimation = function(animationId, rotateWithCharacter = false) {
    this._weaponAnimationId = animationId;
    this._weaponRotateAnimationWithCharacter = rotateWithCharacter;
};

const _Game_CharacterBase_startAnimation = Game_CharacterBase.prototype.startAnimation;
Game_CharacterBase.prototype.startAnimation = function() {
    _Game_CharacterBase_startAnimation.call(this);
    this._rotateAnimationWithCharacter = false;
};

Game_CharacterBase.prototype.weaponAnimationId = function() {
    return this._weaponAnimationId;
};

const _Game_CharacterBase_isAnimationPlaying = Game_CharacterBase.prototype.isAnimationPlaying;
Game_CharacterBase.prototype.isAnimationPlaying = function() {
    return (
        _Game_CharacterBase_isAnimationPlaying.call(this) || 
        this._weaponAnimationId > 0 || 
        this._weaponAnimationPlaying
    );
};

Game_CharacterBase.prototype.startWeaponAnimation = function() {
    this._weaponAnimationId = 0;
    this._weaponAnimationPlaying = true;
    this._weaponRotateAnimationWithCharacter = false;
};

Game_CharacterBase.prototype.endWeaponAnimation = function() {
    this._weaponAnimationPlaying = false;
};

Game_CharacterBase.prototype.addToScene = function() {
    SceneManager._scene._spriteset.addCharacterToTilemap(this);
    $gameMap.addDynamicCharacter(this);
};

Game_CharacterBase.prototype.removeFromScene = function() {
    SceneManager._scene._spriteset.removeCharacterFromTilemap(this);
    $gameMap.removeDynamicCharacter(this);
};