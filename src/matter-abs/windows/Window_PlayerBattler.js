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
    this.drawBasicInfo(-8);
    this.drawHpGauge(offsetX, 6);
    this.drawMpAndTpGauges(offsetX, 18);
    this.drawStates();
    this.updateRefreshMem();
};

Window_PlayerBattler.prototype.drawBasicInfo = function(y) {
    this.contents.fillRect(0, y + 22, this.contentsWidth(), 4, this.gaugeBackColor(), this.gaugeBackColor());
    this.contents.paintOpacity = 100;
    this.contents.gradientFillRect(0, y + 22, this.contentsWidth() * this.battler.expRate(), 4, this.expGaugeColor1(), this.expGaugeColor2());
    this.contents.paintOpacity = 255;
    this.changeTextColor(this.systemColor());
    let xFromStart = 0;
    this.drawText(TextManager.levelA, xFromStart, y);
    xFromStart += this.textWidth(TextManager.levelA);
    this.changeTextColor(this.normalColor());
    this.drawText(this.battler.level, 2 + xFromStart, y);
    xFromStart += this.textWidth(this.battler.level) + 2;
    this.drawText(this.battler.name(), 6 + xFromStart, y);
};

Window_PlayerBattler.prototype.drawHpGauge = function(x, y) {
    this.drawGauge(x, y + 18, this.contentsWidth() - x, this.battler.hpRate(), this.hpGaugeColor1(), this.hpGaugeColor2());
    this.changeTextColor(this.hpColor(this.battler));
    this.drawText(this.battler.hp, x, y, this.contentsWidth() - x, 'right');
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.hpA, x, y + 2);
    this.changeTextColor(this.normalColor());
};

Window_PlayerBattler.prototype.drawMpAndTpGauges = function(x, y) {
    // MP
    const mpGaugeWidth = (this.contentsWidth() - x) * 2 / 3;
    this.drawGauge(x, y + 18, mpGaugeWidth, this.battler.mpRate(), this.mpGaugeColor1(), this.mpGaugeColor2());
    this.changeTextColor(this.mpColor(this.battler));
    this.drawText(this.battler.mp, x, y, mpGaugeWidth, 'right');
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.mpA, x, y + 2);
    // TP
    const tpWidth = this.contentsWidth() - mpGaugeWidth;
    this.drawGauge(x + mpGaugeWidth, y + 18, tpWidth, this.battler.tpRate(), this.tpGaugeColor1(), this.tpGaugeColor2());
    this.changeTextColor(this.tpColor(this.battler));
    this.drawText(this.battler.tp, x, y, this.contentsWidth() - x, 'right');
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.tpA, x + mpGaugeWidth, y + 2);
    this.changeTextColor(this.normalColor());
};

Window_PlayerBattler.prototype.drawStates = function() {
    const states = this.battler.states();
    for (let i = 0; i < states.length; i++) {
        const width = Window_Base._iconWidth;
        const x = i * width;
        const y = this.contentsHeight() - Window_Base._iconHeight;
        const duration = Math.ceil(this.battler.stateDuration(states[i].id));
        this.drawIcon(states[i].iconIndex, x, y);
        this.drawText(duration, x, y + 4, width - 2, 'right');
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
        states: this.battler.states().map(state => ({
            id: state.id,
            duration: this.battler.stateDuration(state.id),
        })), 
    });
};

Window_PlayerBattler.prototype.drawGauge = function(x, y, width, rate, color1, color2) {
    const height = Window_PlayerBattler.GAUGE_HEIGHT;
    drawGaugeABS.call(this, x, y, width, height, rate, color1, color2);
};

Window_PlayerBattler.prototype.expGaugeColor1 = function() {
    return this.textColor(7);
};

Window_PlayerBattler.prototype.expGaugeColor2 = function() {
    return this.textColor(0);
};

global["Window_PlayerBattler"] = Window_PlayerBattler;
