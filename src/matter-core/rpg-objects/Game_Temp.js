import { get } from "lodash";

//-----------------------------------------------------------------------------
// Game_Temp
//
// The game object class for temporary data that is not included in save data.

const _Game_Temp_isPlaytest = Game_Temp.prototype.isPlaytest;
Game_Temp.prototype.isPlaytest = function() {
    return _Game_Temp_isPlaytest.call(this) || ENV === 'development';
};

const _Game_Temp_setDestination = Game_Temp.prototype.setDestination;
Game_Temp.prototype.setDestination = function(x, y) {
    _Game_Temp_setDestination.call(this, x, y);
    const pathfindingLimit = Math.max($gamePlayer.centerX(), $gamePlayer.centerY());
    $gamePlayer.pathfindTo({ x, y }, pathfindingLimit);
};