//-----------------------------------------------------------------------------
// Window_PlayerBattler
//
// The window for displaying the player battler.

import { drawGaugeABS, updateShow } from "./window-utils";

function Window_PlayerBattler() {
    this.initialize.apply(this, arguments);
}

Window_PlayerBattler.prototype = Object.create(Window_Base.prototype);
Window_PlayerBattler.prototype.constructor = Window_PlayerBattler;

Object.defineProperties(Window_PlayerBattler.prototype, {
    battler: { get: function() { return $gamePlayer.battler; }, configurable: false },
});

Window_PlayerBattler.GAUGE_HEIGHT = 8;
Window_PlayerBattler.FIT_ICON_LENGTH = 6;

Window_PlayerBattler.prototype.initialize = function() {
    const width = this.windowWidth();
    const height = this.windowHeight();
    const y = Graphics.boxHeight - height;
    Window_Base.prototype.initialize.call(this, 0, y, width, height);
    this.setBackgroundType(1);
    this.contents.fontSize = 14;
};

Window_PlayerBattler.prototype.windowWidth = function() {
    return Window_PlayerBattler.FIT_ICON_LENGTH * Window_Base._iconWidth + 2 * this.standardPadding();
};

Window_PlayerBattler.prototype.windowHeight = function() {
    return 48 + Window_Base._iconHeight + this.standardPadding() * 2;
};

Window_PlayerBattler.prototype.standardPadding = function() {
    return 8;
};

Window_PlayerBattler.prototype.update = function() {
    this.updateShow();
    Window_Base.prototype.update.call(this);
    if (this.shouldRefresh()) this.refresh();
};

Window_PlayerBattler.prototype.updateShow = function() {
    updateShow.call(this);
};

Window_PlayerBattler.prototype.shouldRefresh = function() {
    return this._refreshMem !== this.refreshMem();
}

Window_PlayerBattler.prototype.refresh = function() {
    this.contents.clear();
    const offsetX = 4;
    this.drawInfo()
    this.drawParameters();
    this.drawStates();
    this.updateRefreshMem();
};

Window_PlayerBattler.prototype.drawInfo = function() {
    this.drawText(this.battler.name(), 0, -4);
};

Window_PlayerBattler.prototype.drawParameters = function() {
    const y = 24;
    drawGaugeABS.call(this, 0, y, this.contentsWidth(), 8, this.battler.hpRate(), this.hpGaugeColor1(), this.hpGaugeColor2());
    drawGaugeABS.call(this, 0, y + 8, this.contentsWidth(), 8, this.battler.mpRate(), this.mpGaugeColor1(), this.mpGaugeColor2());
    drawGaugeABS.call(this, 0, y + 16, this.contentsWidth(), 8, this.battler.tpRate(), this.tpGaugeColor1(), this.tpGaugeColor2());
};

Window_PlayerBattler.prototype.drawStates = function() {
    const states = this.battler.states();
    for (let i = 0; i < states.length; i++) {
        const width = Window_Base._iconWidth;
        const x = i * width;
        const y = this.contentsHeight() - Window_Base._iconHeight;
        const duration = this.battler.stateDuration(states[i].id);
        if (duration < this.stateFadeOutDuration()) {
            this.contents.paintOpacity = 255 * duration / 3;
        }
        this.drawIcon(states[i].iconIndex, x, y);
        this.contents.paintOpacity = 255;
        if (duration !== Infinity) this.drawText(Math.ceil(duration), x, y + 4, width - 2, 'right');
    }
};

Window_PlayerBattler.prototype.updateRefreshMem = function() {
    this._refreshMem = this.refreshMem();
};

Window_PlayerBattler.prototype.refreshMem = function() {
    return JSON.stringify({
        hpRate: this.battler.hpRate(),
        mpRate: this.battler.mpRate(),
        tpRate: this.battler.tpRate(),
        expRate: this.battler.expRate(),
        name: this.battler.name(),
        level: this.battler.level,
        states: this.battler.states().map(state => {
            const duration = this.battler.stateDuration(state.id);
            return {
                id: state.id,
                duration: duration < this.stateFadeOutDuration() ? duration : Math.ceil(duration),
            };
        }), 
    });
};

Window_PlayerBattler.prototype.stateFadeOutDuration = function() {
    return 3; // begin fade out at 3s duration  
};

Window_PlayerBattler.prototype.expGaugeColor1 = function() {
    return this.textColor(7);
};

Window_PlayerBattler.prototype.expGaugeColor2 = function() {
    return this.textColor(0);
};

global["Window_PlayerBattler"] = Window_PlayerBattler;
