//-----------------------------------------------------------------------------
// Game_Player
//
// The game object class for the player. It contains event starting
// determinants and map scrolling functions.

Object.defineProperties(Game_Player.prototype, {
    battler: { get: function() { return $gameParty.leader(); }, configurable: false },
});

const _Game_Player_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function() {
    return _Game_Player_canMove && !this.hasActionSequence();
};