//-----------------------------------------------------------------------------
// Game_CharacterBase
//
// The superclass of Game_Character. It handles basic information, such as
// coordinates and images, shared by all characters.

import { WEAPON_POSES } from "../weapon-poses";


Object.defineProperties(Game_CharacterBase.prototype, {
    weaponIconIndex: { get: function() { return this.battler ? this.battler.weaponIconIndex : 0; }, configurable: false },
});

const _Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
Game_CharacterBase.prototype.initMembers = function() {
    _Game_CharacterBase_initMembers.call(this);
    this.weaponPose = WEAPON_POSES.IDLE;
}; 