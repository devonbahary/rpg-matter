export const BODY_LABELS = {
    EVENT: 'event',
    PLAYER: 'player',
    PLAYER_SENSOR: 'player-sensor',
};

export const COLLISION_BITFIELDS = {
    BELOW_CHARACTER:    0b00000001,
    SAME_AS_CHARACTER:  0b00000010,
    ABOVE_CHARACTER:    0b00000100,
    TILE:               0b00000111,
};

export const PRIORITY_TYPE_TO_COLLISION_BITFIELD = {
    0: COLLISION_BITFIELDS.BELOW_CHARACTER,
    1: COLLISION_BITFIELDS.SAME_AS_CHARACTER,
    2: COLLISION_BITFIELDS.ABOVE_CHARACTER,
};