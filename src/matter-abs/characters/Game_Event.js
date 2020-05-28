//-----------------------------------------------------------------------------
// Game_Event
//
// The game object class for an event. It contains functionality for event page
// switching and running parallel process events.

import { battlerFromPage } from "./utils";

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
    const battler = battlerFromPage.call(this);
    this.setBattler(battler);
};