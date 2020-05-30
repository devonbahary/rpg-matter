//-----------------------------------------------------------------------------
// Game_Player
//
// The game object class for the player. It contains event starting
// determinants and map scrolling functions.

const _Game_Player_refresh = Game_Player.prototype.refresh;
Game_Player.prototype.refresh = function() {
    _Game_Player_refresh.call(this);
    this.setBattler($gameParty.leader());
};

const _Game_Player_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function() {
    return _Game_Player_canMove.call(this) && !this.hasActionSequence();
};