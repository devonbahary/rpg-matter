//-----------------------------------------------------------------------------
// Game_CharacterBase
//
// The superclass of Game_Character. It handles basic information, such as
// coordinates and images, shared by all characters.

import { squareInFrontOf } from "./utils";

const _Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
Game_CharacterBase.prototype.initMembers = function() {
    _Game_CharacterBase_initMembers.call(this);
    this._weaponAnimationId = 0;
    this._weaponAnimationPlaying = false;
};

Game_CharacterBase.prototype.requestWeaponAnimation = function(animationId) {
    this._weaponAnimationId = animationId;
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
};

Game_CharacterBase.prototype.endWeaponAnimation = function() {
    this._weaponAnimationPlaying = false;
};

Game_CharacterBase.prototype.squareInFrontOf = function(range) {
    return squareInFrontOf.call(this, range);
};