//-----------------------------------------------------------------------------
// Game_Character
//
// The superclass of Game_Player, Game_Follower, GameVehicle, and Game_Event.

import { Vector } from "matter-js";
import { vectorFromAToB } from "../utils/vector";

Object.defineProperties(Game_Character.prototype, {
    isActionEvent: { get: function() { return false; }, configurable: false },
});

Game_Character.prototype.moveTowardCharacter = function(character) {
    const vectorToCharacter = vectorFromAToB(this.mapPos, character.mapPos);
    this.move(vectorToCharacter);
};

Game_Character.prototype.moveAwayFromCharacter = function(character) {
    const vectorToCharacter = vectorFromAToB(this.mapPos, character.mapPos);
    const oppositeVector = Vector.neg(vectorToCharacter);
    this.move(oppositeVector);
};

// overwrite to ensure direction is different
Game_Character.prototype.turnRandom = function() {
    let dir;
    while (dir === this.direction()) {
        dir = 2 + Math.randomInt(4) * 2;
    }
    this.setDirection(2 + Math.randomInt(4) * 2);
};