//=============================================================================
// MatterABSGuard
//=============================================================================

/*:
 * @plugindesc Matter ABS Guard Plugin
 * Requires MatterActionBattleSystem.js plugin.
 * 
 * @help
 * This plugin expands on guarding in MatterActionBattleSystem.
 * 
 * It adds a Guard HP parameter to battlers that takes damage in place of HP
 * while the battler is guarding.
 * 
 * If the guard is broken (Guard HP <= 0), the difference in damage is applied
 * to the affected battler.
 * 
 * Battler GRD (GuaRD effect rate) will affect the amount of damage taken to
 * Guard HP while guarding, where Guard HP damage taken is equal to:
 * 
 * Original damage / GRD = Guard HP damage
 * 
 * (e.g., 10 damage to a guarding battler with 150% GRD results in 6.6 damage to
 * Guard HP)
 * 
 * (e.g., 10 damage to a guarding battler with 50% GRD results in 20 damage to 
 * Guard HP)
 * 
 * 
 * @param Battler
 * 
 * @param Guard HP
 * @parent Battler
 * @desc The fixed max Guard HP for battlers.
 * @type number
 * @min 0
 * @max 9999
 * @default 100
 * 
 * @param Battler HUD
 * 
 * @param Guard Gauge Color 1
 * @parent Battler HUD
 * @desc Color for guard gauge.
 * @type number
 * @min 0
 * @default 0
 * 
 * @param Guard Gauge Color 2
 * @parent Battler HUD
 * @desc Color for guard gauge.
 * @type number
 * @min 0
 * @default 0
 * 
 * @param Guard Gauge Opacity Active
 * @parent Battler HUD
 * @desc Opacity for guard gauge while active.
 * @type number
 * @min 0
 * @max 255
 * @default 255
 * 
 * @param Guard Gauge Opacity Inactive
 * @parent Battler HUD
 * @desc Opacity for guard gauge while active.
 * @type number
 * @min 0
 * @max 255
 * @default 150
 * 
*/

const MATTER_ABS_GUARD = {
    GUARD_HP: parseInt(PluginManager.parameters('MatterABSGuard')["Guard HP"]),
    GUARD_GAUGE_COLOR_1: parseInt(PluginManager.parameters('MatterABSGuard')["Guard Gauge Color 1"]),
    GUARD_GAUGE_COLOR_2: parseInt(PluginManager.parameters('MatterABSGuard')["Guard Gauge Color 2"]),
    GUARD_GAUGE_OPACITY_ACTIVE: parseInt(PluginManager.parameters('MatterABSGuard')["Guard Gauge Opacity Active"]),
    GUARD_GAUGE_OPACITY_INACTIVE: parseInt(PluginManager.parameters('MatterABSGuard')["Guard Gauge Opacity Inactive"]),
};

//-----------------------------------------------------------------------------
// Game_ActionABS
//
// The game object class for a battle action in the ABS context.

const _Game_ActionABS_executeHpDamage = Game_ActionABS.prototype.executeHpDamage;
Game_ActionABS.prototype.executeHpDamage = function(target, value) {
    if (!target.isGuard()) return _Game_ActionABS_executeHpDamage.call(this, target, value);

    const valueAfterGuard = value - Math.max(0, target.ghp);
    target.gainGhp(-value);
    if (valueAfterGuard > 0) _Game_ActionABS_executeHpDamage.call(this, target, valueAfterGuard);
};

//-----------------------------------------------------------------------------
// Game_BattlerBase
//
// The superclass of Game_Battler. It mainly contains parameters calculation.

Object.defineProperties(Game_BattlerBase.prototype, {
    ghp: { get: function() { return this._guardHp; }, configurable: false },
    gmhp: { get: function() { return this._guardMhp; }, configurable: false },
});

const _Game_BattlerBase_initMembers = Game_BattlerBase.prototype.initMembers;
Game_BattlerBase.prototype.initMembers = function() {
    _Game_BattlerBase_initMembers.call(this);
    this._guardHp = MATTER_ABS_GUARD.GUARD_HP;
    this._guardMhp = MATTER_ABS_GUARD.GUARD_HP;
};

const _Game_BattlerBase_isGuard = Game_BattlerBase.prototype.isGuard;
Game_BattlerBase.prototype.isGuard = function() {
    return _Game_BattlerBase_isGuard.call(this) && this._guardHp > 0;
};

Game_BattlerBase.prototype.setGhp = function(ghp) {
    this._guardHp = ghp;
    this.refresh();
};

const _Game_BattlerBase_refresh = Game_BattlerBase.prototype.refresh;
Game_BattlerBase.prototype.refresh = function() {
    _Game_BattlerBase_refresh.call(this);
    this._guardHp = this._guardHp.clamp(0, this.gmhp);
};

const _Game_BattlerBase_recoverAll = Game_BattlerBase.prototype.recoverAll;
Game_BattlerBase.prototype.recoverAll = function() {
    _Game_BattlerBase_recoverAll.call(this);
    this._guardHp = this.gmhp;
};

const _Game_BattlerBase_update = Game_BattlerBase.prototype.update;
Game_BattlerBase.prototype.update = function() {
    _Game_BattlerBase_update.call(this);
    this._guardHp += Math.min(0.2, this.gmhp - this.ghp);
};

Game_BattlerBase.prototype.ghpRate = function() {
    return this.gmhp > 0 ? this.ghp / this.gmhp : 0;
};

//-----------------------------------------------------------------------------
// Game_Battler
//
// The superclass of Game_Actor and Game_Enemy. It contains methods for sprites
// and actions.

Game_Battler.prototype.gainGhp = function(value) {
    if (value < 0) value = value / this.grd;
    this.setGhp(this.ghp + value);
};

//-----------------------------------------------------------------------------
// Sprite_Base
//
// The sprite class with a feature which displays animations.

Sprite_Base.prototype.drawWithOpacity = function(callback, opacity) {
    this.bitmap.paintOpacity = opacity;
    callback();
    this.bitmap.paintOpacity = 255;
};

//-----------------------------------------------------------------------------
// Sprite_BattlerParameters
//
// The sprite for displaying overhead battler parameters.

const _Sprite_BattlerParameters_initialize = Sprite_BattlerParameters.prototype.initialize;
Sprite_BattlerParameters.prototype.initialize = function(character) {
    _Sprite_BattlerParameters_initialize.call(this, character);
    Window_Base.prototype.loadWindowskin.call(this);
};

const _Sprite_BattlerParameters_initMembers = Sprite_BattlerParameters.prototype.initMembers;
Sprite_BattlerParameters.prototype.initMembers = function() {
    _Sprite_BattlerParameters_initMembers.call(this);
    this._ghp = 0;
    this._gmhp = 0;
};

const _Sprite_BattlerParameters_memorizeMembers = Sprite_BattlerParameters.prototype.memorizeMembers;
Sprite_BattlerParameters.prototype.memorizeMembers = function() {
    _Sprite_BattlerParameters_memorizeMembers.call(this);
    this._ghp = this._battler.ghp;
    this._gmhp = this._battler.gmhp;
    this._isGuard = this._battler.isGuard();
};

const _Sprite_BattlerParameters_drawGauge = Sprite_BattlerParameters.prototype.drawGauge;
Sprite_BattlerParameters.prototype.drawGauge = function() {
    _Sprite_BattlerParameters_drawGauge.call(this);
    if (this.shouldDrawGuardGauge()) this.drawGuardGauge();
};

Sprite_BattlerParameters.prototype.drawGuardGauge = function() {
    this._ghp = this._battler.ghp;
    this._mghp = this._battler.gmhp;
    const fillW = (this.width - 2) * this._battler.ghpRate();
    const opacity = this._isGuard ? MATTER_ABS_GUARD.GUARD_GAUGE_OPACITY_ACTIVE : MATTER_ABS_GUARD.GUARD_GAUGE_OPACITY_INACTIVE;
    this.drawWithOpacity(() => {
        this.bitmap.gradientFillRect(1, 1, fillW, (this.gaugeHeight() - 2) / 2, this.guardGaugeColor1(), this.guardGaugeColor2());
    }, opacity);
};

Sprite_BattlerParameters.prototype.shouldDrawGuardGauge = function() {
    return this._isGuard || this._battler.ghpRate() < 1;
};

const _Sprite_BattlerParameters_shouldUpdate = Sprite_BattlerParameters.prototype.shouldUpdate;
Sprite_BattlerParameters.prototype.shouldUpdate = function() {
    return (
        _Sprite_BattlerParameters_shouldUpdate.call(this) ||
        this._battler.ghp !== this._ghp ||
        this._battler.gmhp !== this._gmhp ||
        this._battler.isGuard() !== this._isGuard
    );
};

Sprite_BattlerParameters.prototype.guardGaugeColor1 = function() {
    return this.textColor(MATTER_ABS_GUARD.GUARD_GAUGE_COLOR_1);
};

Sprite_BattlerParameters.prototype.guardGaugeColor2 = function() {
    return this.textColor(MATTER_ABS_GUARD.GUARD_GAUGE_COLOR_2);
};

Sprite_BattlerParameters.prototype.textColor = function(n) {
    return Window_Base.prototype.textColor.call(this, n);
};