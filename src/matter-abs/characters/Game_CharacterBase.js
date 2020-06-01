//-----------------------------------------------------------------------------
// Game_CharacterBase
//
// The superclass of Game_Character. It handles basic information, such as
// coordinates and images, shared by all characters.

import { squareInFrontOf } from "./utils";

Game_CharacterBase.prototype.squareInFrontOf = function(range) {
    return squareInFrontOf.call(this, range);
};