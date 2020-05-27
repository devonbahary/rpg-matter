//-----------------------------------------------------------------------------
// Game_Actor
//
// The game object class for an actor.

Object.defineProperties(Game_Actor.prototype, {
    weaponIconIndex: { get: function() { return this.weapons().length ? this.weapons()[0].iconIndex : 0; }, configurable: false },
});

Game_Actor.prototype.isFriendWith = function(battler) {
    return battler.isActor();
};