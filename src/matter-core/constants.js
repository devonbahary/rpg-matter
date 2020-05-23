export const BODY_LABELS = {
    EVENT: 'event',
    PLAYER: 'player',
    PLAYER_SENSOR: 'player-sensor',
};

export const EVENT_COMMAND_CODES = {
    NULL: 0,
    // FLOW CONTROL
    COMMENT: 108,
    COMMENT_CTD: 408, // succeeds 108 when multiple lines are present
};

export const EVENT_TRIGGERS = {
    ACTION_BUTTON: 0,
    PLAYER_TOUCH: 1,
    EVENT_TOUCH: 2,
    AUTO_RUN: 3,
    PARALLEL: 4,
};
