//-----------------------------------------------------------------------------
// Game_Player
//
// The game object class for the player. It contains event starting
// determinants and map scrolling functions.

Object.defineProperties(Game_Player.prototype, {
    battler: { get: function() { return $gameParty.leader(); }, configurable: false },
});