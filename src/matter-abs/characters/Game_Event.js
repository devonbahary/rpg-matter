//-----------------------------------------------------------------------------
// Game_Event
//
// The game object class for an event. It contains functionality for event page
// switching and running parallel process events.

const _Game_Event_clearPageSettings = Game_Event.prototype.clearPageSettings;
Game_Event.prototype.clearPageSettings = function() {
    _Game_Event_clearPageSettings.call(this);
    this.battler = null;
};

const _Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function() {
    _Game_Event_setupPageSettings.call(this);
    this.setupBattler();
    /*
        page settings that could be overridden by battler settings
        - setImage
        - setDirection
        - setPattern
        - setMoveSpeed (would be handled by battler anyway?)
        - setMoveFrequency
        - setPriorityType
        - setWalkAnime 
        - setStepAnime (stepping enemies are engaged with the user?)
        - setDirectionFix
        - setThrough
        - setMoveRoute (define move pattern based on Game_Enemy?)
        - _moveType ^
        - _trigger (should be none, except maybe for NPC actors?)
        - 
    */
};

Game_Event.prototype.setupBattler = function() {
    const battler = this.battlerFromPage();
    this.setBattler(battler);
};

Game_Event.prototype.battlerFromPage = function() {
    const actorId = this._pageMeta.actorId;
    const enemyId = this._pageMeta.enemyId;
    
    if (actorId && enemyId) {
        throw new Error(`found both actorId ${actorId} and enemyId ${enemyId} on single page for eventId ${this.eventId()}`);
    }
    
    if (actorId) return new Game_Actor(actorId);
    if (enemyId) return new Game_Enemy(enemyId);
    return null;
};

const _Game_Event_update = Game_Event.prototype.update;
Game_Event.prototype.update = function() {
    this.updateEraseOnBattlerDeath();
    _Game_Event_update.call(this);
};

Game_Event.prototype.updateEraseOnBattlerDeath = function() {
    if (this.battler && this.battler.isDead() && this.battler.isEventErasable()) this.erase();
};