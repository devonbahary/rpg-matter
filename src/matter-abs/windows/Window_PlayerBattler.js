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

Window_PlayerBattler.prototype.initialize = function() {
    const width = this.windowWidth();
    const height = this.windowHeight();
    const y = Graphics.boxHeight - height;
    Window_Base.prototype.initialize.call(this, 0, y, width, height);
    this.setBackgroundType(1);
};

Window_PlayerBattler.prototype.windowWidth = function() {
    return 200;
};

Window_PlayerBattler.prototype.windowHeight = function() {
    return 48 + this.standardPadding() * 2;
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
    const characterHeight = 48;
    const y = this.contentsHeight() / 2 + characterHeight / 2;
    this.drawCharacter(this.battler.imageName, this.battler.imageIndex, this.standardPadding(), y);
    this.drawGauges();
    this.updateRefreshMem();
};

Window_PlayerBattler.prototype.updateRefreshMem = function() {
    this._refreshMem = this.refreshMem();
};

Window_PlayerBattler.prototype.refreshMem = function() {
    return JSON.stringify({
        battlerImageName: this.battler.imageName,
        battlerImageIndex: this.battler.imageIndex,
        hpRate: this.battler.hpRate(),
        mpRate: this.battler.mpRate(),
        tpRate: this.battler.tpRate(),
        expRate: this.battler.expRate(),
    });
};

Window_PlayerBattler.prototype.drawGauges = function() {
    const x = 48;
    const gaugeCount = 4;
    const gaugeH = Window_PlayerBattler.GAUGE_HEIGHT;
    const baseY = (this.contentsHeight() / 2 - gaugeH * gaugeCount / 2);
    this.drawGauge(x, baseY + gaugeH * 0, this.battler.hpRate(), this.hpGaugeColor1(), this.hpGaugeColor2());
    this.drawGauge(x, baseY + gaugeH * 1, this.battler.mpRate(), this.mpGaugeColor1(), this.mpGaugeColor2());
    this.drawGauge(x, baseY + gaugeH * 2, this.battler.tpRate(), this.tpGaugeColor1(), this.tpGaugeColor2());
    this.drawGauge(x, baseY + gaugeH * 3, this.battler.expRate(), this.expGaugeColor1(), this.expGaugeColor2());
};

Window_PlayerBattler.prototype.drawGauge = function(x, y, rate, color1, color2) {
    const width = this.contentsWidth() - x;
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
