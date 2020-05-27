//-----------------------------------------------------------------------------
// Game_Enemy
//
// The game object class for an enemy.

Game_Enemy.prototype.isFriendWith = function(battler) {
    return battler.isEnemy();
};