//-----------------------------------------------------------------------------
// Game_Event
//
// The game object class for an event. It contains functionality for event page
// switching and running parallel process events.

Object.defineProperties(Game_Event.prototype, {
    _pageActorId: { get: function() { return parseInt(this._pageMeta.actorId); }, configurable: false },
    _pageEnemyId: { get: function() { return parseInt(this._pageMeta.enemyId); }, configurable: false },
});

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
    this.setupBattlerSettings();
};

Game_Event.prototype.battlerFromPage = function() {
    if (this._pageActorId && this._pageEnemyId) {
        throw new Error(`found both actorId ${this._pageActorId} and enemyId ${this._pageEnemyId} on single page for eventId ${this.eventId()}`);
    }
    
    if (this._pageActorId) return new Game_Actor(this._pageActorId);
    if (this._pageEnemyId) return new Game_Enemy(this._pageEnemyId);
    return null;
};

Game_Event.prototype.setupBattlerSettings = function() {
    if (this.battler) this.setMass(Game_CharacterBase.DEFAULT_MASS);
};

const _Game_Event_update = Game_Event.prototype.update;
Game_Event.prototype.update = function() {
    this.updateEraseOnBattlerDeath();
    _Game_Event_update.call(this);
};

Game_Event.prototype.updateEraseOnBattlerDeath = function() {
    if (this.battler && this.battler.isDead() && this.battler.isEventErasable()) this.erase();
};