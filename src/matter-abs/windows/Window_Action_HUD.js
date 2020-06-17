//-----------------------------------------------------------------------------
// Window_Action_HUD
//
// The window for displaying action slots.

function Window_Action_HUD() {
    this.initialize.apply(this, arguments);
}

Window_Action_HUD.prototype = Object.create(Window_Base.prototype);
Window_Action_HUD.prototype.constructor = Window_Action_HUD;

Object.defineProperties(Window_Action_HUD.prototype, {
    battler: { get: function() { return $gamePlayer.battler; }, configurable: false },
});

Window_Action_HUD.prototype.initialize = function() {
    const width = this.windowWidth();
    const height = this.windowHeight();
    const x = (Graphics.boxWidth - width) / 2;
    const y = Graphics.boxHeight - height;
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.setBackgroundType(1);
    this.contents.fontSize = 12;
    this.refresh();
};

Window_Action_HUD.NUM_SLOTS = 6;
Window_Action_HUD.ACTIVE_OPACITY = 255;
Window_Action_HUD.INACTIVE_OPACITY = 100;

Window_Action_HUD.prototype.slotWidth = function() {
    return Window_Base._iconWidth + this.borderThickness() * 2;
};

Window_Action_HUD.prototype.slotHeight = function() {
    return Window_Base._iconHeight + this.borderThickness() * 2;
};

Window_Action_HUD.prototype.borderThickness = function() {
    return 2;
};

Window_Action_HUD.prototype.slotGap = function() {
    return 12;
};

Window_Action_HUD.prototype.windowWidth = function() {
    return this.slotWidth() * Window_Action_HUD.NUM_SLOTS + this.slotGap() * (Window_Action_HUD.NUM_SLOTS) + this.standardPadding() * 2;
};

Window_Action_HUD.prototype.windowHeight = function() {
    return this.slotHeight() + this.standardPadding() * 2;
};

Window_Action_HUD.prototype.contentsWidth = function() {
    return this.width;
};

Window_Action_HUD.prototype.contentsHeight = function() {
    return this.height;
};

Window_Action_HUD.prototype.refresh = function() {
    this.contents.clear();
    
    const actionSlotMapEntries = Object.entries(this.playerActionSlotMap());
    
    for (let i = 0; i < actionSlotMapEntries.length; i++) {
        const [ keyName, action ] = actionSlotMapEntries[i];
        if (!action) continue;

        this.contents.paintOpacity = this.actionOpacity(action);

        const x = i * this.slotWidth() + (this.slotGap() * i);
        const iconIndex = this.actionIconIndex(action);

        this.drawBorder(x);
        this.drawIcon(iconIndex, x + this.borderThickness(), this.borderThickness());
        this.drawText(keyName, x + 4, -8);
        this.drawActionCost(x, action);
    }

    this._memSerializedPlayerActionSlotMap = this.serializedPlayerActionSlotMap();
};

Window_Action_HUD.prototype.actionOpacity = function(action) {
    if (this.playerCanUse(action)) return Window_Action_HUD.ACTIVE_OPACITY;
    return Window_Action_HUD.INACTIVE_OPACITY;
};

Window_Action_HUD.prototype.drawBorder = function(x) {
    const sw = this.slotWidth();
    const sh = this.slotHeight();
    const color = this.lineColor();

    this.contents.fillRect(x, 0, sw, 2, color);
    this.contents.fillRect(x + sw, 0, 2, sh, color);
    this.contents.fillRect(x, sh - 2, sw, 2, color);
    this.contents.fillRect(x, 0, 2, sh, color);
};

Window_Action_HUD.prototype.drawActionCost = function(x, action) {
    const y = 8;
    const width = this.slotWidth() - this.borderThickness();
    if (this.isTpAction(action)) {
        this.changeTextColor(this.tpCostColor());
        this.drawText(this.battler.skillTpCost(action.object()), x, y, width, 'right');
    } else if (this.isMpAction(action)) {
        this.changeTextColor(this.mpCostColor());
        this.drawText(this.battler.skillMpCost(action.object()), x, y, width, 'right');
    } else if (this.isItemAction(action)) {
        const numItems = $gameParty.numItems(action.object());
        if (numItems) this.drawText(numItems, x, y, width, 'right');
    }
    this.changeTextColor(this.normalColor());
};

Window_Action_HUD.prototype.isTpAction = function(action) {
    return this.battler.skillTpCost(action.object()) > 0;
};

Window_Action_HUD.prototype.isMpAction = function(action) {
    return this.battler.skillMpCost(action.object()) > 0;
};

Window_Action_HUD.prototype.isItemAction = function(action) {
    return DataManager.isItem(action.object());
};

Window_Action_HUD.prototype.playerActionSlotMap = function() {
    return this.battler.displayableActionSlotKeyMap();
};

Window_Action_HUD.prototype.serializedPlayerActionSlotMap = function() {
    const minimizedActionSlotMap = Object.entries(this.playerActionSlotMap()).reduce((acc, [ keyName, action ]) => {
        acc[keyName] = {
            canUse: this.playerCanUse(action),
            iconIndex: this.actionIconIndex(action),
        };
        return acc;
    }, {});
    return JSON.stringify(minimizedActionSlotMap);
};

Window_Action_HUD.prototype.actionIconIndex = function(action) {
    if (!action) return 0;
    if (action.isSkill() && action.itemId() === this.battler.attackSkillId()) {
        if (this.battler.weapon) return this.battler.weapon.iconIndex;
    }
    return action.iconIndex;
};

Window_Action_HUD.prototype.playerCanUse = function(action) {
    return action && !this.battler.hasAction() && this.battler.canUse(action.object());
};

Window_Action_HUD.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    if (this.shouldRefresh()) this.refresh();
};

Window_Action_HUD.prototype.shouldRefresh = function() {
    return this._memSerializedPlayerActionSlotMap !== this.serializedPlayerActionSlotMap();
};

Window_Action_HUD.prototype.lineColor = function() {
    return this.normalColor();
};

global["Window_Action_HUD"] = Window_Action_HUD;