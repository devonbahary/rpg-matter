//-----------------------------------------------------------------------------
// Sprite_Base
//
// The sprite class with a feature which displays animations.

Sprite_Base.prototype.startAnimation = function(animation, mirror, delay, rotateWithCharacter = false) { // overwrite
    var sprite = new Sprite_Animation();
    sprite.setup(this._effectTarget, animation, mirror, delay, rotateWithCharacter); // overwrite
    this.parent.addChild(sprite);
    this._animationSprites.push(sprite);
};

//-----------------------------------------------------------------------------
// Sprite_Animation
//
// The sprite for displaying an animation.

const _Sprite_Animation_setup = Sprite_Animation.prototype.setup;
Sprite_Animation.prototype.setup = function(target, animation, mirror, delay, rotateWithCharacter) {
    _Sprite_Animation_setup.call(this, target, animation, mirror, delay);
    this._rotateAnimationWithCharacter = rotateWithCharacter;
};

const _Sprite_Animation_setupDuration = Sprite_Animation.prototype.setupDuration;
Sprite_Animation.prototype.setupDuration = function() {
    _Sprite_Animation_setupDuration.call(this);
    this._totalDuration = this._duration;
};

const _Sprite_Animation_update = Sprite_Animation.prototype.update;
Sprite_Animation.prototype.update = function() {
    if (this.shouldUpdate()) {
        _Sprite_Animation_update.call(this);
    } else {
        this.updatePosition();
    }
};

Sprite_Animation.prototype.shouldUpdate = function() {
    return !this.isAnimationPaused() || this._duration === this._totalDuration;
};

Sprite_Animation.prototype.isAnimationPaused = function() {
    return this._target.isAnimationPaused();
};

const _Sprite_Animation_updateCellSprite = Sprite_Animation.prototype.updateCellSprite;
Sprite_Animation.prototype.updateCellSprite = function(sprite, cell) {
    _Sprite_Animation_updateCellSprite.call(this, sprite, cell);
    this.updateCellWeaponSpriteAnimation(sprite, cell);
};

Sprite_Animation.prototype.updateCellWeaponSpriteAnimation = function(sprite, cell) {
    const pattern = cell[0];

    if (pattern >= 0 && this._rotateAnimationWithCharacter) {
        let mirror = this._mirror;

        const aliasedMirrorAndRotation = () => {
            if (cell[5]) {
                sprite.scale.x *= -1;
            }
            if (mirror) {
                sprite.x *= -1;
                sprite.rotation *= -1;
                sprite.scale.x *= -1;
            }
        };
        
        aliasedMirrorAndRotation();
    
        switch (this._target._character.direction()) {
            case 2:
                break;
            case 4:
                sprite.rotation += 90 * Math.PI / 180;
                sprite.x = -cell[2];
                sprite.y = cell[1];
                break;
            case 6:
                mirror = !mirror;
                sprite.rotation += 90 * Math.PI / 180;
                sprite.x = -cell[2];
                sprite.y = cell[1];
                break;
            case 8:
                sprite.rotation += 180 * Math.PI / 180;
                sprite.y = -cell[2];
                sprite.x = -cell[1];
                break;
        }
    
        aliasedMirrorAndRotation();
    }
};