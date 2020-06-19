//=============================================================================
// MatterABSMenuAction
//=============================================================================

/*:
 * @plugindesc Matter ABS Menu Action Plugin
 * Requires MatterActionBattleSystem.js plugin.
 * 
 * @help
 * 
 * Creates a menu scene for equipping actions to actor action slots.
 * 
 * 
*/

//-----------------------------------------------------------------------------
// Scene_Action
//
// The scene class of the action screen.

function Scene_Action() {
    this.initialize.apply(this, arguments);
}

Scene_Action.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Action.prototype.constructor = Scene_Action;

Scene_Action.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Action.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createHelpWindow();
    this.createSkillTypeWindow();
    this.createStatusWindow();
    this.createSlotWindow();
    this.createItemWindow();
    this.refreshActor();
    
    this._skillTypeWindow.deactivate();
    this._skillTypeWindow.deselect();

    this._slotWindow.activate();
    this._slotWindow.select(0);
};

Scene_Action.prototype.createStatusWindow = function() {
    const wy = this._helpWindow.height;
    this._statusWindow = new Window_ActionStatus(0, wy, this._skillTypeWindow.height);
    this._statusWindow.reserveFaceImages();
    this.addWindow(this._statusWindow);
};

Scene_Action.prototype.createSlotWindow = function() {
    const wx = this._statusWindow.width;
    const wy = this._helpWindow.height;
    const ww = Graphics.boxWidth - wx - this._skillTypeWindow.width;
    const wh = this._skillTypeWindow.height;
    this._slotWindow = new Window_ActionSlot(wx, wy, ww, wh);
    this._slotWindow.setHelpWindow(this._helpWindow);
    this._slotWindow.setHandler('ok',       this.onSlotOk.bind(this));
    this._slotWindow.setHandler('cancel',   this.popScene.bind(this));
    this._slotWindow.setHandler('pagedown', this.nextActor.bind(this));
    this._slotWindow.setHandler('pageup',   this.previousActor.bind(this));
    this.addWindow(this._slotWindow);
};

Scene_Action.prototype.createSkillTypeWindow = function() {
    const wy = this._helpWindow.height;
    this._skillTypeWindow = new Window_SkillType(0, wy);
    const { width, height } = this._skillTypeWindow;
    this._skillTypeWindow.move(Graphics.boxWidth - width, wy, width, height);
    this._skillTypeWindow.setHelpWindow(this._helpWindow);
    this._skillTypeWindow.setHandler('skill',    this.onSkillTypeOk.bind(this));
    this._skillTypeWindow.setHandler('cancel',   this.onSkillTypeCancel.bind(this));
    this.addWindow(this._skillTypeWindow);
};

Scene_Action.prototype.createItemWindow = function() {
    const wy = this._statusWindow.y + this._statusWindow.height;
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight - wy;
    this._itemWindow = new Window_SkillList(0, wy, ww, wh);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this._skillTypeWindow.setSkillWindow(this._itemWindow);
    this.addWindow(this._itemWindow);
};

Scene_Action.prototype.refreshActor = function() {
    const actor = this.actor();
    this._statusWindow.setActor(actor);
    this._slotWindow.setActor(actor);
    this._skillTypeWindow.setActor(actor);
    this._itemWindow.setActor(actor);
};

Scene_Action.prototype.onSlotOk = function() {
    this._skillTypeWindow.activate();
    this._skillTypeWindow.select(0);
};

Scene_Action.prototype.onSkillTypeOk = function() {
    this._skillTypeWindow.deactivate();
    this._itemWindow.activate();
    this._itemWindow.select(0);
};

Scene_Action.prototype.onSkillTypeCancel = function() {
    this._skillTypeWindow.deselect();
    this._slotWindow.activate();
};

Scene_Action.prototype.onItemOk = function() {
    this.actor().setActionSlot(this._slotWindow._index, this.item());
    this._itemWindow.deselect();
    this._slotWindow.activate();
    this._slotWindow.refresh();
};

Scene_Action.prototype.item = function() {
    return this._itemWindow.item();
};

Scene_Action.prototype.onItemCancel = function() {
    this._itemWindow.deselect();
    this._skillTypeWindow.activate();
};

Scene_Action.prototype.onActorChange = function() {
    this.refreshActor();
    this._slotWindow.activate();
};


//-----------------------------------------------------------------------------
// Scene_Menu
//
// The scene class of the menu screen.

const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
    _Scene_Menu_createCommandWindow.call(this);
    this._commandWindow.setHandler('action',   this.commandAction.bind(this));
};

Scene_Menu.prototype.commandAction = function() {
    SceneManager.push(Scene_Action);
};

//-----------------------------------------------------------------------------
// Window_ActionSlot
//
// The window for selecting an action slot on the action screen.

function Window_ActionSlot() {
    this.initialize.apply(this, arguments);
}

Window_ActionSlot.prototype = Object.create(Window_Selectable.prototype);
Window_ActionSlot.prototype.constructor = Window_ActionSlot;

Window_ActionSlot.prototype.initialize = function(x, y, width, height) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._actor = null;
    this.refresh();
};

Window_ActionSlot.prototype.setActor = function(actor) {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
    }
};

Window_ActionSlot.prototype.maxItems = function() {
    return this._actor ? this._actor.actionSlots.length : 0;
};

Window_ActionSlot.prototype.item = function() {
    const actionSlot = this._actor ? this._actor.actionSlots[this.index()] : null;
    return actionSlot ? actionSlot.object() : null;
};

Window_ActionSlot.prototype.drawItem = function(index) {
    const actionSlot = this.actionSlot(index);
    if (this._actor) {
        const rect = this.itemRectForText(index);
        this.drawActionSlot(actionSlot, rect.x, rect.y);
    }
};

Window_ActionSlot.prototype.actionSlot = function(index) {
    return this._actor.actionSlots[index];
};

// borrowed from Window_Base
Window_ActionSlot.prototype.drawActionSlot = function(action, x, y, width) {
    let iconIndex, name;
    if (action) {
        const dataItem = action.object();
        iconIndex = dataItem.iconIndex;
        name = dataItem.name;
    } else {
        iconIndex = 0;
        name = '- - -';
    }
    
    const iconBoxWidth = Window_Base._iconWidth + 4;
    this.resetTextColor();
    this.drawIcon(iconIndex, x + 2, y + 2);
    this.drawText(name, x + iconBoxWidth, y, width - iconBoxWidth);
};

Window_ActionSlot.prototype.updateHelp = function() {
    Window_Selectable.prototype.updateHelp.call(this);
    this.setHelpWindowItem(this.item());
};

//-----------------------------------------------------------------------------
// Window_ActionStatus
//
// The window for displaying the action user's status on the action screen.

function Window_ActionStatus() {
    this.initialize.apply(this, arguments);
}

Window_ActionStatus.prototype = Object.create(Window_Base.prototype);
Window_ActionStatus.prototype.constructor = Window_ActionStatus;

Window_ActionStatus.prototype.initialize = function(x, y, height) {
    Window_Base.prototype.initialize.call(this, x, y, this.windowWidth(), height);
    this._actor = null;
};

Window_ActionStatus.prototype.setActor = function(actor) {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
    }
};

Window_ActionStatus.prototype.windowWidth = function() {
    return 148 + this.standardPadding() * 2;
}

Window_ActionStatus.prototype.refresh = function() {
    this.contents.clear();
    if (this._actor) {
        var h = this.height - this.padding * 2;
        this.drawActorFace(this._actor, 0, 0, 144, h);
    }
};


//-----------------------------------------------------------------------------
// Window_MenuCommand
//
// The window for selecting a command on the menu screen.

const _Window_MenuCommand_addMainCommands = Window_MenuCommand.prototype.addMainCommands;
Window_MenuCommand.prototype.addMainCommands = function() {
    const enabled = this.areMainCommandsEnabled();
    _Window_MenuCommand_addMainCommands.call(this);
    if (this.needsCommand('action')) {
        this.addCommand('Action', 'action', enabled);
    }
};

const _Window_MenuCommand_needsCommand = Window_MenuCommand.prototype.needsCommand;
Window_MenuCommand.prototype.needsCommand = function(name) {
    if (name === 'action') return true;
    return _Window_MenuCommand_needsCommand.call(this, name);
};