//-----------------------------------------------------------------------------
// Game_Party
//
// The game object class for the party. Information such as gold and items is
// included.

Game_Party.prototype.gainExp = function(exp) {
    for (const actor of this.allMembers()) {
        actor.gainExp(exp);
    }
};