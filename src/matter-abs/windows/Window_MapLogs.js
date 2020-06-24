import { updateShow } from "./window-utils";

//-----------------------------------------------------------------------------
// Window_MapLogs
//
// The window for displaying map logs.

function Window_MapLogs() {
    this.initialize.apply(this, arguments);
}

Window_MapLogs.prototype = Object.create(Window_Base.prototype);
Window_MapLogs.prototype.constructor = Window_MapLogs;

Window_MapLogs.prototype.initialize = function(goldWindow) {
    const width = this.windowWidth();
    const height = this.windowHeight();
    const x = Graphics.boxWidth - width;
    const y = Graphics.boxHeight - goldWindow.height;
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.setBackgroundType(2);
    this._logsLengthMem = $gameMap.logs.length;
    this._logSprites = [];
};

Window_MapLogs.prototype.windowWidth = function() {
    return 320;
};

Window_MapLogs.prototype.windowHeight = function() {
    return 1;
};

Window_MapLogs.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    if (this.isOpen()) {
        this.updateLogMem();
        this.updateChildSprites();
    }
};

Window_MapLogs.prototype.updateLogMem = function() {
    if (!$gameMap.logs.length && this._logsLengthMem) {
        this._logsLengthMem = 0;
    } else if ($gameMap.logs.length > this._logsLengthMem) {
        for (let i = this._logsLengthMem; i < $gameMap.logs.length; i++) {
            this.createLog($gameMap.logs[i]);
        }
        this._logsLengthMem = $gameMap.logs.length;
    }
};

Window_MapLogs.prototype.updateChildSprites = function() {
    for (const sprite of this._logSprites.slice()) {
        if (!sprite.isPlaying()) {
            this._logSprites = this._logSprites.filter(logSprite => logSprite !== sprite);
            this.removeChild(sprite);
        }
    }
    for (let i = 0; i < this._logSprites.length; i++) {
        const sprite = this._logSprites[i];
        const destinationY = this.childSpriteDestinationY(i);
        sprite.y += Math.min(destinationY - sprite.y, 3);
    }
};

Window_MapLogs.prototype.createLog = function(log) {
    const sprite = new Window_MapLog(log);
    sprite.y = this.childSpriteDestinationY(this._logSprites.length);
    this._logSprites.push(sprite);
    this.addChild(sprite);
};

Window_MapLogs.prototype.childSpriteDestinationY = function(index) {
    return -(index + 1) * Window_MapLog.prototype.windowHeight()
}; 

Window_MapLogs.prototype.hasLogs = function() {
    return $gameMap.hasLogs();
};

//-----------------------------------------------------------------------------
// Window_MapLog
//
// The window for displaying a map log.

function Window_MapLog() {
    this.initialize.apply(this, arguments);
}

Window_MapLog.prototype = Object.create(Window_Base.prototype);
Window_MapLog.prototype.constructor = Window_MapLog;

Window_MapLog.prototype.initialize = function(log) {
    const width = this.windowWidth();
    const height = this.windowHeight();
    Window_Base.prototype.initialize.call(this, 0, 0, width, height);
    this.setBackgroundType(1);
    this.contents.fontSize = 14;
    this.initMembers(log);
    this.refresh();
    this.setOpacity(0);
};

Window_MapLog.prototype.standardPadding = function() {
    return 4;
};

Window_MapLog.prototype.initMembers = function(log) {
    const { iconIndex, message } = log;
    this._iconIndex = iconIndex;
    this._message = message;
    this._duration = this.duration();
};

Window_MapLog.prototype.windowWidth = function() {
    return Window_MapLogs.prototype.windowWidth.call(this);
};

Window_MapLog.prototype.windowHeight = function() {
    return this.fittingHeight(1);
};

Window_MapLog.prototype.update = function() {
    this.updateShow();
    Window_Base.prototype.update.call(this);
    if (this.isClosed()) return;
    this._duration--;
    this.updateOpacity();
};

Window_MapLog.prototype.updateShow = function() {
    updateShow.call(this);
};

Window_MapLog.prototype.updateOpacity = function() {
    if (this._duration >= this.duration() - this.transitionOpacityDuration()) {
        const opacity = 255 * ((this.duration() - this._duration) / this.transitionOpacityDuration());
        this.setOpacity(opacity);
    } else if (this._duration < this.transitionOpacityDuration()) {
        const opacity = 255 * this._duration / this.transitionOpacityDuration();
        this.setOpacity(opacity);
    }
};

Window_MapLog.prototype.setOpacity = function(opacity) {
    this._dimmerSprite.opacity = opacity;
    this.contentsOpacity = opacity;
}

Window_MapLog.prototype.refresh = function() {
    this.contents.clear();
    if (this._iconIndex) {
        this.contents.paintOpacity = this.iconOpacity();
        this.drawIcon(this._iconIndex, 0, 0);
        this.contents.paintOpacity = 255;
    }
    const x = this._iconIndex ? Window_Base._iconWidth + 2 : 0;
    this.drawText(this.convertEscapeCharacters(this._message), x, 0);
};

Window_MapLog.prototype.duration = function() {
    return 60 * 5;
};

Window_MapLog.prototype.isPlaying = function() {
    return this._duration;
};

Window_MapLog.prototype.transitionOpacityDuration = function() {
    return 60;
};

Window_MapLog.prototype.iconOpacity = function() {
    return 200;
};

global["Window_MapLogs"] = Window_MapLogs;