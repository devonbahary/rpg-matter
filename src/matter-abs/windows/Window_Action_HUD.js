//-----------------------------------------------------------------------------
// Window_Action_HUD
//
// The window for displaying the player action slots.

import { updateShow } from "./window-utils";

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
    this.initMembers();
    this.refresh();
};

Window_Action_HUD.NUM_SLOTS = 6;

Window_Action_HUD.prototype.initMembers = function() {
    this.setBackgroundType(1);
    this.contents.fontSize = 12;
};

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

Window_Action_HUD.prototype.translucentOpacity = function() {
    return 100;
};

Window_Action_HUD.prototype.windowWidth = function() {
    const slotWidth = this.slotWidth() * Window_Action_HUD.NUM_SLOTS;
    const gapWidth = this.slotGap() * (Window_Action_HUD.NUM_SLOTS - 1);
    return slotWidth + gapWidth + this.standardPadding() * 2;
};

Window_Action_HUD.prototype.windowHeight = function() {
    return this.slotHeight() + this.standardPadding() * 2;
};

Window_Action_HUD.prototype.refresh = function() {
    this.contents.clear();
    this.drawActionHUD();
    this.memorizeLastRefresh();
};

Window_Action_HUD.prototype.drawActionHUD = function() {
    this.drawActions();
};

Window_Action_HUD.prototype.drawActions = function() {
    const actionSlotMapEntries = Object.entries(this.playerActionSlotMap());
    
    for (let i = 0; i < actionSlotMapEntries.length; i++) {
        const [ keyName, action ] = actionSlotMapEntries[i];
        if (!action) continue;
        
        const dataItem = action.object();
        const x = i * this.slotWidth() + this.slotGap() * i;
        const iconIndex = this.actionIconIndex(action);
        this.changePaintOpacity(this.playerCanUse(dataItem));
        this.drawAction(x, dataItem, iconIndex, keyName, true);
    }
};

Window_Action_HUD.prototype.memorizeLastRefresh = function() {
    this._memSerializedPlayerActionSlotMap = this.serializedPlayerActionSlotMap();
};

Window_Action_HUD.prototype.drawAction = function(x, dataItem, iconIndex, text, withBorder = false) {
    if (withBorder) this.drawBorder(x);
    this.drawCooldown(x, dataItem);
    this.drawIcon(iconIndex, x + this.borderThickness(), this.borderThickness());
    if (text) this.drawText(text, x + 4, -8);
    this.drawActionCost(x, dataItem);
};

Window_Action_HUD.prototype.drawBorder = function(x) {
    const sw = this.slotWidth();
    const sh = this.slotHeight();
    const color = this.lineColor();
    const bt = this.borderThickness();

    this.contents.fillRect(x, 0, sw, bt, color);
    this.contents.fillRect(x + sw - bt, 0, bt, sh, color);
    this.contents.fillRect(x, sh - bt, sw, bt, color);
    this.contents.fillRect(x, 0, bt, sh, color);
};

Window_Action_HUD.prototype.drawCooldown = function(x, dataItem) {
    const bt = this.borderThickness();
    const cooldownRate = this.battler.cooldownRate(dataItem);
    if (cooldownRate === 1) return;
    const width = cooldownRate * (this.slotWidth() - bt)
    this.contents.fillRect(x + bt, bt, width, this.slotHeight() - bt * 2, this.normalColor());
};

Window_Action_HUD.prototype.drawActionCost = function(x, dataItem) {
    const y = 8;
    const width = this.slotWidth() - this.borderThickness();
    if (this.isTpAction(dataItem)) {
        this.changeTextColor(this.tpCostColor());
        this.drawText(this.battler.skillTpCost(dataItem), x, y, width, 'right');
    } else if (this.isMpAction(dataItem)) {
        this.changeTextColor(this.mpCostColor());
        this.drawText(this.battler.skillMpCost(dataItem), x, y, width, 'right');
    } else if (this.isItemAction(dataItem)) {
        const numItems = $gameParty.numItems(dataItem);
        if (numItems) this.drawText(numItems, x, y, width, 'right');
    }
    this.changeTextColor(this.normalColor());
};

Window_Action_HUD.prototype.isTpAction = function(dataItem) {
    return this.battler.skillTpCost(dataItem) > 0;
};

Window_Action_HUD.prototype.isMpAction = function(dataItem) {
    return this.battler.skillMpCost(dataItem) > 0;
};

Window_Action_HUD.prototype.isItemAction = function(dataItem) {
    return DataManager.isItem(dataItem);
};

Window_Action_HUD.prototype.playerActionSlotMap = function() {
    return this.battler.displayableActionSlotKeyMap();
};

Window_Action_HUD.prototype.serializedPlayerActionSlotMap = function() {
    const minimizedActionSlotMap = Object.entries(this.playerActionSlotMap()).reduce((acc, [ keyName, action ]) => {
        if (!action) return acc;
        acc[keyName] = {
            canUse: this.playerCanUse(action.object()),
            iconIndex: this.actionIconIndex(action),
            cooldownRate: this.battler.cooldownRate(action.object()),
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

Window_Action_HUD.prototype.playerCanUse = function(dataItem) {
    return dataItem && !this.battler.hasAction() && this.battler.canUse(dataItem);
};

Window_Action_HUD.prototype.update = function() {
    this.updateShow();
    Window_Base.prototype.update.call(this);
    if (this.shouldRefresh()) this.refresh();
};

Window_Action_HUD.prototype.updateShow = function() {
    updateShow.call(this);
};

Window_Action_HUD.prototype.shouldRefresh = function() {
    return this._memSerializedPlayerActionSlotMap !== this.serializedPlayerActionSlotMap();
};

Window_Action_HUD.prototype.lineColor = function() {
    return this.normalColor();
};

global["Window_Action_HUD"] = Window_Action_HUD;