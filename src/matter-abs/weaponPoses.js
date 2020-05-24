export const WEAPON_POSES = {
    IDLE: 'idle',
    EXTEND: 'extend',
};

export const getWeaponSpritePosition = (weaponPose, direction, pattern, iconIndex) => {
    const position = WEAPON_POSE_TO_POSITION[weaponPose][direction] || {};
    const anchor = ICON_INDEX_TO_ANCHOR[iconIndex] || {};

    let patternDx = 0;
    if (pattern === 0) patternDx = -1;
    else if (pattern === 2) patternDx = 2;
    
    if (direction === 8 || direction === 6) patternDx *= -1;
    
    return {
        anchorX: 0.5,
        anchorY: 1,
        ...anchor,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        ...position,
        x: position.x + patternDx,
    }
};

const WEAPON_POSE_TO_POSITION = {
    [WEAPON_POSES.IDLE]: {
        2: {
            x: -24,
            y: -2,
        },
        4: {
            x: -12,
            y: -2,
        }, 
        6: {
            x: 8,
            y: -2,
            scaleX: -1,
        },
        8: {
            x: 22,
            y: -2,
            scaleX: -1,
        },
    },
    [WEAPON_POSES.EXTEND]: {
        2: {
            x: 0,
            y: -2,
            rotation: -(Math.PI / 4 + Math.PI / 2),
        },
        4: {
            x: -12,
            y: -2,
        }, 
        6: {
            x: 8,
            y: -2,
        },
        8: {
            x: 0,
            y: -14,
            rotation: Math.PI / 4,
        },
    },
};

const ICON_INDEX_TO_ANCHOR = {
    96: {
        anchorX: 0.3,
        anchorY: 0.9,
    },
};