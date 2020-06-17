//-----------------------------------------------------------------------------
// Game_Party
//
// The game object class for the party. Information such as gold and items is
// included.

Object.defineProperties(Game_Party.prototype, {
    isInAction: { get: function() { return this.members().some(m => m.hasAction()); }, configurable: false },
    isInBattle: { get: function() { return this.hasAggro(); }, configurable: false },
});

Game_Party.prototype.gainExp = function(exp) {
    for (const actor of this.allMembers()) {
        actor.gainExp(exp);
    }
};

Game_Party.prototype.opponentsUnit = function() {
    return $gameTroop;
};