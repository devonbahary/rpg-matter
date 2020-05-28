//-----------------------------------------------------------------------------
// Game_Enemy
//
// The game object class for an enemy.

Game_Enemy.prototype.isFriendWith = function(battler) {
    return battler.isEnemy();
};

Game_Enemy.prototype.die = function() {
    Game_Battler.prototype.die.call(this);
    this.performCollapse();
};

Game_Enemy.prototype.isEventErasable = function() {
    return this._effectTypeFulfilled;
};