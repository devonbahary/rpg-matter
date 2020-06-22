//-----------------------------------------------------------------------------
// Window_Target
//
// The window for displaying selected battler info.

import { updateShow, drawGaugeABS } from "./window-utils";

function Window_Target() {
    this.initialize.apply(this, arguments);
}

Window_Target.prototype = Object.create(Window_Base.prototype);
Window_Target.prototype.constructor = Window_Target;

Object.defineProperties(Window_Target.prototype, {
    target: { get: function() { return $gamePlayer.targetSelection; }, configurable: false },
});

Window_Target.GAUGE_HEIGHT = 8;
Window_Target.FIT_ICON_LENGTH = 8;

Window_Target.prototype.initialize = function() {
    const width = this.windowWidth();
    const x = (Graphics.boxWidth - width) / 2;
    const y = 0;
    const height = this.windowHeight();
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.setBackgroundType(1);
    this.close();
    this.contents.fontSize = 14;
    this._refreshMem = null;
};

Window_Target.prototype.windowWidth = function() {
    return Window_Base._iconWidth * Window_Target.FIT_ICON_LENGTH + 2 * this.standardPadding();
};

Window_Target.prototype.windowHeight = function() {
    return this.fittingHeight(1) + Window_Target.GAUGE_HEIGHT + 2 + this.standardPadding() * 2;
};

Window_Target.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    this.updateShow();
    if (this.shouldRefresh()) this.refresh();
};

Window_Target.prototype.updateShow = function() {
    updateShow.call(this);
    Window_Base.prototype.update.call(this);
};

Window_Target.prototype.shouldShow = function() {
    return this.target;
};

Window_Target.prototype.shouldHide = function() {
    return !this.target;
};

Window_Target.prototype.shouldRefresh = function() {
    return this.isOpen() && this._refreshMem !== this.refreshMem();
};

Window_Target.prototype.refresh = function() {
    this.contents.clear();
    this.drawText(this.target.name(), 0, 0, this.contentsWidth(), 'center');
    this.drawHpGauge();
    this.drawStates();
    this.memorizeLastRefresh();
};

Window_Target.prototype.drawHpGauge = function() {
    const width = this.contentsWidth();
    const gaugeH = Window_Target.GAUGE_HEIGHT;
    const y = this.lineHeight();
    const rate = this.target.hpRate();
    drawGaugeABS.call(this, 0, y, width, gaugeH, rate, this.hpGaugeColor1(), this.hpGaugeColor2());
    this.drawText(this.target.hp, 0, 16, this.contentsWidth(), 'right');
};

Window_Target.prototype.drawStates = function() {
    const states = this.target.states();
    for (let i = 0; i < states.length; i++) {
        const iconIndex = states[i].iconIndex;
        const duration = Math.floor(this.target.stateDuration(states[i].id));
        const y = this.lineHeight() + Window_Target.GAUGE_HEIGHT + 2;
        const width = Window_Base._iconWidth;
        const x = width * i;
        this.drawIcon(iconIndex, x, y);
        this.drawText(duration, x, y + 6, width - 2, 'right');
    }
};

Window_Target.prototype.memorizeLastRefresh = function() {
    this._refreshMem = this.refreshMem();
};

Window_Target.prototype.refreshMem = function() {
    return this.target ? JSON.stringify({
        name: this.target.name(),
        hpRate: this.target.hpRate(),
        states: this.target.states().map(state => ({
            id: state.id,
            duration: this.target.stateDuration(state.id),
        })), 
    }) : null;
};

global["Window_Target"] = Window_Target;