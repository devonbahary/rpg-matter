//=============================================================================
// MatterABSCommandMenu
//=============================================================================

/*:
 * @plugindesc Matter ABS Command Menu Plugin
 * Requires MatterActionBattleSystem.js plugin.
 * 
 * @help
 * This plugin introduces an extensive menu for accessing skills and items
 * from Scene_Map.
 * 
*/

/**
 * A hash table to convert from a virtual key code to a mapped key name.
 *
 * @static
 * @property keyMapper
 * @type Object
 */

Input.keyMapper = {
    ...Input.keyMapper,
    32: 'space',    // space
};


//-----------------------------------------------------------------------------
// Scene_Map
//
// The scene class of the map screen.

const _Scene_Map_terminate = Scene_Map.prototype.terminate;
Scene_Map.prototype.terminate = function() {
    _Scene_Map_terminate.call(this);
    this._actionHUDWindow.closeCommandMenu();
};

const _Scene_Map_isMenuEnabled = Scene_Map.prototype.isMenuEnabled;
Scene_Map.prototype.isMenuEnabled = function() {
    return _Scene_Map_isMenuEnabled.call(this) && !this._actionHUDWindow.isCommandMenuOpen;
};

//-----------------------------------------------------------------------------
// Window_Action_HUD
//
// The window for displaying the player action slots.

Object.defineProperties(Window_Action_HUD.prototype, {
    _currentCommand: { get: function() { return this._commands[this._currentIndex]; }, configurable: false },
});

const _Window_Action_HUD_initMembers = Window_Action_HUD.prototype.initMembers;
Window_Action_HUD.prototype.initMembers = function() {
    _Window_Action_HUD_initMembers.call(this);
    this.closeCommandMenu();
};

Window_Action_HUD.prototype.toggleCommandMenu = function() {
    if (this.isCommandMenuOpen) this.closeCommandMenu();
    else this.openCommandMenu();
    this._currentIndex = 0;
    this._cursorCount = 0;
};

Window_Action_HUD.prototype.closeCommandMenu = function() {
    this.isCommandMenuOpen = false;
    this.setCommands([]);
    $gameMap.setSelectionMode(false);
    this.refresh();
};

Window_Action_HUD.prototype.openCommandMenu = function() {
    SoundManager.playCursor();
    this.isCommandMenuOpen = true;
    this.setPrimaryCommands();
    $gameMap.setSelectionMode(true);
};

Window_Action_HUD.prototype.setCommands = function(commands) {
    this._commands = commands;
    this._onCommandOk = null;
    this._onCancel = null;
    this._currentIndex = 0;
};

Window_Action_HUD.prototype.setPrimaryCommands = function() {
    this.setCommands([{
        iconIndex: 208,
        name: TextManager.item,
        id: 1,
        onOk: () => this.setDataItemCommands($gameParty.items()),
    }, {
        iconIndex: 72,
        name: TextManager.skill,
        id: 2,
        onOk: () => this.setDataItemCommands($gamePlayer.battler.skills()),
    }]);

    this._onCommandOk = command => {
        SoundManager.playCursor();
        command.onOk();
    };
    this._onCancel = () => this.closeCommandMenu();
};

Window_Action_HUD.prototype.setDataItemCommands = function(dataItems) {
    this.setCommands(dataItems);
    
    this._onCommandOk = dataItem => {
        if (!this.canUse(dataItem)) return SoundManager.playBuzzer();
        SoundManager.playCursor();
        this.closeCommandMenu();
        $gamePlayer.battler.setAction(dataItem)
    };
    this._onCancel = () => this.setPrimaryCommands();
};

const _Window_Action_HUD_drawActionHUD = Window_Action_HUD.prototype.drawActionHUD;
Window_Action_HUD.prototype.drawActionHUD = function() {
    if (this.isCommandMenuOpen) return this.drawCommands();
    _Window_Action_HUD_drawActionHUD.call(this);
};

Window_Action_HUD.prototype.drawCommands = function() {
    const drawableCommands = this.drawableCommands();
    const commandsWidth = drawableCommands.length * this.slotWidth() + Math.max(0, (drawableCommands.length - 1) * this.slotGap());
    const baseX = this.contentsWidth() / 2 - commandsWidth / 2;
    
    for (let i = 0; i < drawableCommands.length; i++) {
        const command = drawableCommands[i];
        const { iconIndex, id } = command;
        
        const isActive = this.isActiveIndex(this._commands.findIndex(c => c.id === id));
        if (!this.canUse(command)) {
            this.changePaintOpacity(false);
        } else if (isActive) {
            const variableOpacity = Math.round(Math.sin(this._cursorCount) * (255 - this.translucentOpacity()) / 2);
            this.contents.paintOpacity = this.translucentOpacity() + variableOpacity;
        }

        const x = baseX + this.slotWidth() * i + this.slotGap() * i;
        this.drawAction(x, command, iconIndex);

        this.changePaintOpacity(true);
    }

    if (this._currentCommand) this.drawText(this._currentCommand.name, 0, -12, this.contentsWidth(), 'center');
};

Window_Action_HUD.prototype.drawableCommands = function() {
    const commandsList = this._commands;

    if (commandsList.length < 5) return commandsList;
    
    const getCommandCircular = index => {
        index = index % commandsList.length;
        if (index < 0) return commandsList[commandsList.length + index];
        return commandsList[index];
    };

    const pushCommandAtIndex = index => {
        const command = getCommandCircular(this._currentIndex + index);
        if (!command || drawableCommands.includes(command)) return;
        drawableCommands.push(command);
    };

    const unshiftCommandAtIndex = index => {
        const command = getCommandCircular(this._currentIndex + index);
        if (!command || drawableCommands.includes(command)) return;
        drawableCommands.unshift(command);
    };

    const drawableCommands = [];

    if (this._currentCommand) drawableCommands.push(this._currentCommand);
    pushCommandAtIndex(1);
    unshiftCommandAtIndex(-1);
    pushCommandAtIndex(2);
    unshiftCommandAtIndex(-2);

    return drawableCommands;
};

Window_Action_HUD.prototype.isActiveIndex = function(index) {
    return this._currentIndex === index;
};

const _Window_Action_HUD_update = Window_Action_HUD.prototype.update;
Window_Action_HUD.prototype.update = function() {
    _Window_Action_HUD_update.call(this);
    this.updateCommandInput();
    this._cursorCount += 0.1;
};

Window_Action_HUD.prototype.updateCommandInput = function() {
    if ($gameMap.isEventRunning() || this.isClosed()) return;

    if (Input.isTriggered('space') && !$gamePlayer.battler.hasAction()) this.toggleCommandMenu();    
    
    if (this.isCommandMenuOpen) {
        if (Input.isTriggered('left')) return this.cycleMenuIndexDown();
        if (Input.isTriggered('right')) return this.cycleMenuIndexUp();
        if (Input.isTriggered('ok')) return this.onCommandOk();
        if (Input.isTriggered('escape')) return this.onCommandCancel();
    }
};

Window_Action_HUD.prototype.cycleMenuIndexDown = function() {
    SoundManager.playCursor();
    if (this._currentIndex) this._currentIndex--;
    else this._currentIndex = this._commands.length - 1;
};

Window_Action_HUD.prototype.cycleMenuIndexUp = function() {
    SoundManager.playCursor();
    this._currentIndex++;
    if (this._currentIndex === this._commands.length) this._currentIndex = 0;
};

Window_Action_HUD.prototype.onCommandOk = function() {
    this._onCommandOk(this._currentCommand);
};

Window_Action_HUD.prototype.onCommandCancel = function() {
    SoundManager.playCancel();
    this._onCancel();
};

Window_Action_HUD.prototype.canUse = function(command) {
    if (!DataManager.isSkill(command) && !DataManager.isItem(command)) return true;
    return this.battler.canUse(command);
};

const _Window_Action_HUD_shouldRefresh = Window_Action_HUD.prototype.shouldRefresh;
Window_Action_HUD.prototype.shouldRefresh = function() {
    return _Window_Action_HUD_shouldRefresh.call(this) || this.isCommandMenuOpen;
};