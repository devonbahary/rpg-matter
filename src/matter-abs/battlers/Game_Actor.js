//-----------------------------------------------------------------------------
// Game_Actor
//
// The game object class for an actor.

Object.defineProperties(Game_Actor.prototype, {
    weapon: { get: function() { 
        return this._equips.reduce((weapon, item) => {
            if (weapon) return weapon;
            if (DataManager.isWeapon(item.object())) return item;
            return weapon;
        }, null);
    }, configurable: false },
    weaponIconIndex: { get: function() { return this.weapon ? this.weapon.object().iconIndex : 0; }, configurable: false },
});

Game_Actor.prototype.isFriendWith = function(battler) {
    return battler.isActor();
};