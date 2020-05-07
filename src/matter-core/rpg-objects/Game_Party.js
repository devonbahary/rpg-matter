//-----------------------------------------------------------------------------
// Game_Party
//
// The game object class for the party. Information such as gold and items is
// included.

Game_Party.prototype.steps = function() {
    return Math.floor(this._steps);
};

Game_Party.prototype.increaseSteps = function(steps) {
    const prevSteps = this._steps;
    this._steps += steps; // overwrite, used to just ++

    if (!$gameMap.isEventRunning()) { // onPlayerWalk() used to only be called from Game_Player during this condition
        for (let i = 0; i < Math.floor(this._steps) - Math.floor(prevSteps); i++) {
            this.onPlayerWalk();
        }
    }  
};