//-----------------------------------------------------------------------------
// Window_Target
//
// The window for displaying selected battler info.

const { updateShow, drawGaugeABS } = require("./util");

function Window_Target() {
    this.initialize.apply(this, arguments);
}

Window_Target.prototype = Object.create(Window_Base.prototype);
Window_Target.prototype.constructor = Window_Target;

Object.defineProperties(Window_Target.prototype, {
    target: { get: function() { return $gamePlayer.targetSelection; }, configurable: false },
});

Window_Target.GAUGE_HEIGHT = 8;

Window_Target.prototype.initialize = function() {
    const width = this.windowWidth();
    const x = (Graphics.boxWidth - width) / 2;
    const y = 0;
    const height = this.windowHeight();
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.setBackgroundType(1);
    this.close();
    this.contents.fontSize = 14;
    this._hpRateMem = 0;
};

Window_Target.prototype.windowWidth = function() {
    return 320;
};

Window_Target.prototype.windowHeight = function() {
    return this.fittingHeight(2);
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
    return $gamePlayer.targetSelection;
};

Window_Target.prototype.shouldHide = function() {
    return !$gamePlayer.targetSelection;
};

Window_Target.prototype.shouldRefresh = function() {
    return this.target && this._hpRateMem !== this.target.hpRate();
};

Window_Target.prototype.refresh = function() {
    if (this.isClosed()) return;
    this.contents.clear();
    if (!this.target) return;
    this.drawText(this.target.name(), 0, 0, this.contentsWidth(), 'center');
    this.drawHpGauge();
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

Window_Target.prototype.memorizeLastRefresh = function() {
    this._hpRateMem = this.target.hpRate();
};

global["Window_Target"] = Window_Target;