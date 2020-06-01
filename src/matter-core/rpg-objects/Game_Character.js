//-----------------------------------------------------------------------------
// Game_Character
//
// The superclass of Game_Player, Game_Follower, GameVehicle, and Game_Event.

import { Vector } from "matter-js";
import { vectorFromAToB } from "../utils/vector";

Game_Character.prototype.moveTowardCharacter = function(character) {
    const vectorToCharacter = vectorFromAToB(this.mapPos, character.mapPos);
    this.move(vectorToCharacter);
};

Game_Character.prototype.moveAwayFromCharacter = function(character) {
    const vectorToCharacter = vectorFromAToB(this.mapPos, character.mapPos);
    const oppositeVector = Vector.neg(vectorToCharacter);
    this.move(oppositeVector);
};