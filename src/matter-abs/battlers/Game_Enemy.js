//-----------------------------------------------------------------------------
// Game_Enemy
//
// The game object class for an enemy.

Object.defineProperties(Game_Enemy.prototype, {
    data: { get: function() { return this.enemy(); }, configurable: false },
    imageName: { get: function() { return this.data.meta.characterName; }, configurable: false },
    imageIndex: { get: function() { return parseInt(this.data.meta.characterIndex); }, configurable: false },
});

Game_Enemy.prototype.isFriendWith = function(battler) {
    return battler.isEnemy();
};

Game_Enemy.prototype.isEnemyWith = function(battler) {
    return battler.isActor();
};

Game_Enemy.prototype.die = function() {
    Game_Battler.prototype.die.call(this);
    this.performCollapse();
};

Game_Enemy.prototype.isEventErasable = function() {
    return this._effectTypeFulfilled;
};