//-----------------------------------------------------------------------------
// Window_GoldABS
//
// The window for displaying the party's gold.

function Window_GoldABS() {
    this.initialize.apply(this, arguments);
}

Window_GoldABS.prototype = Object.create(Window_Gold.prototype);
Window_GoldABS.prototype.constructor = Window_GoldABS;

Window_GoldABS.prototype.initialize = function() {
    const x = Graphics.boxWidth - this.windowWidth();
    const y = Graphics.boxHeight - this.windowHeight();
    Window_Gold.prototype.initialize.call(this, x, y);
    this.setBackgroundType(1);
    this.contents.fontSize = 18;
    this._goldMem = this.value();
    this.refresh();
};

Window_GoldABS.prototype.windowWidth = function() {
    return 120;
};

Window_GoldABS.prototype.refresh = function() {
    this.contents.clear();
    const textWidth = this.contentsWidth() - Window_Base._iconWidth;
    this.drawIcon(314, textWidth, 0);
    this.drawText(this._goldMem, 0, 0, textWidth, 'right');
};

Window_GoldABS.prototype.update = function() {
    if (this.shouldRefresh()) {
        this.updateValue();
        this.refresh();
    }
};

Window_GoldABS.prototype.shouldRefresh = function() {
    return this._goldMem !== this.value();
};

Window_GoldABS.prototype.updateValue = function() {
    if (this.value() > this._goldMem) this._goldMem++;
    else if (this.value() < this._goldMem) this._goldMem--;
};

global["Window_GoldABS"] = Window_GoldABS;