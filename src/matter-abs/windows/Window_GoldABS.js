//-----------------------------------------------------------------------------
// Window_GoldABS
//
// The window for displaying the party's gold.

import { updateShow } from "./util";

function Window_GoldABS() {
    this.initialize.apply(this, arguments);
}

Window_GoldABS.prototype = Object.create(Window_Gold.prototype);
Window_GoldABS.prototype.constructor = Window_GoldABS;

Window_GoldABS.prototype.initialize = function(drawValue) {
    const x = Graphics.boxWidth - this.windowWidth();
    const y = Graphics.boxHeight - this.windowHeight();
    Window_Gold.prototype.initialize.call(this, x, y);
    this.setBackgroundType(1);
    this.contents.fontSize = 18;
    this.initMembers(drawValue);
    this.refresh();
};

Window_GoldABS.prototype.initMembers = function(drawValue) {
    if (drawValue) {
        this._isChild = true;
        this._drawValue = drawValue;
        this._ghostDuration = this.ghostDuration();
    } else {
        this._drawValue = this._valueMem = this.value();
        this._childSprites = [];
    }
};

Window_GoldABS.prototype.windowWidth = function() {
    return 120;
};

Window_GoldABS.prototype.refresh = function() {
    this.contents.clear();
    const textWidth = this.contentsWidth() - Window_Base._iconWidth;
    this.drawIcon(314, textWidth, 0);
    
    let valueText = this._drawValue;
    if (this._isChild) {
        const isPositive = this._drawValue >= 0;
        this.changeTextColor(isPositive ? this.textColor(3) : this.textColor(2));
        if (this._drawValue >= 0) valueText = `+${valueText}`;
    }

    this.drawText(valueText, 0, 0, textWidth, 'right');
    this.changeTextColor(this.normalColor());
};

Window_GoldABS.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    this.updateShow();
    if (this._isChild) {
        this.updateGhostSprite();
    } else {
        if (this.shouldRefresh()) {
            this.updateGoldMem();
            this.updateValue();
            this.refresh();
        }
        this.updateChildSprites();
    }
};

Window_GoldABS.prototype.updateShow = function() {
    updateShow.call(this);
};

Window_GoldABS.prototype.shouldRefresh = function() {
    return this._drawValue !== this.value();
};

Window_GoldABS.prototype.updateGoldMem = function() {
    if (this._valueMem === this.value()) return;
  
    const diff = this.value() - this._drawValue;
    const goldSprite = new Window_GoldABS(diff);
    this._childSprites.push(goldSprite);
    this.parent.addChild(goldSprite);
    this._valueMem = this.value();
};

Window_GoldABS.prototype.updateValue = function() {
    if (this.value() > this._drawValue) this._drawValue++;
    else if (this.value() < this._drawValue) this._drawValue--;
};

Window_GoldABS.prototype.updateChildSprites = function() {
    for (const sprite of this._childSprites.slice()) {
        sprite.y -= 1;
        if (!sprite.isPlaying()) {
            this.parent.removeChild(sprite);
            this._childSprites = this._childSprites.filter(goldSprite => goldSprite !== sprite);
        }
    }
};

Window_GoldABS.prototype.updateGhostSprite = function() {
    if (this.isClosed()) return;
    this._ghostDuration--;
    const opacity = this.childOpacityThisFrame();
    this._dimmerSprite.opacity = opacity;
    this.contentsOpacity = opacity;
};

Window_GoldABS.prototype.ghostDuration = function() {
    return 120;
};

Window_GoldABS.prototype.childOpacityThisFrame = function() {
    return 255 * this._ghostDuration / this.ghostDuration();
};

Window_GoldABS.prototype.isPlaying = function() {
    return this._ghostDuration;
};

global["Window_GoldABS"] = Window_GoldABS;