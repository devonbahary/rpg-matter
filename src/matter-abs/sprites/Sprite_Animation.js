//-----------------------------------------------------------------------------
// Sprite_Animation
//
// The sprite for displaying an animation.

const _Sprite_Animation_setupDuration = Sprite_Animation.prototype.setupDuration;
Sprite_Animation.prototype.setupDuration = function() {
    _Sprite_Animation_setupDuration.call(this);
    this._totalDuration = this._duration;
};

const _Sprite_Animation_update = Sprite_Animation.prototype.update;
Sprite_Animation.prototype.update = function() {
    if (this.shouldUpdate()) _Sprite_Animation_update.call(this);
};

Sprite_Animation.prototype.shouldUpdate = function() {
    return !this.isAnimationPaused() || this._duration === this._totalDuration;
};

Sprite_Animation.prototype.isAnimationPaused = function() {
    return this._target.isAnimationPaused();
};