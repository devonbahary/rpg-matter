//-----------------------------------------------------------------------------
// Game_Event
//
// The game object class for an event. It contains functionality for event page
// switching and running parallel process events.

Game_Event.prototype.bodyOptions = function() {
    const bodyOptions = Game_Character.prototype.bodyOptions.call(this);
    return {
        ...bodyOptions,
        isStatic: true,
    };
};