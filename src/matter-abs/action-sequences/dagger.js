import { playSe, stepLock, weaponPose } from "./utils";
import { WEAPON_POSES } from "../weapon-poses";

const { 
    APPLY_EFFECT,
    ROUTE_DIR_FIX_ON: DIR_FIX_ON,
    ROUTE_DIR_FIX_OFF: DIR_FIX_OFF,
    ROUTE_MOVE_FORWARD: MOVE_FORWARD,
    ROUTE_MOVE_BACKWARD: MOVE_BACKWARD,
    ROUTE_MOVE_CHAR_L: MOVE_LEFT,
    ROUTE_MOVE_CHAR_R: MOVE_RIGHT,
    ROUTE_TURN_90D_L: TURN_90_L,
    ROUTE_TURN_90D_R: TURN_90_R,
    STEP_BACKWARD,
    STEP_FORWARD, 
    STEP_NEUTRAL, 
} = Game_Character;

const STAB = {
    1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.EXTEND) ],
    7: [ STEP_FORWARD, playSe('Wind7', 90, 150) ],
    9: [ APPLY_EFFECT ],
    15: [],    
};

export default {
    DAGGER: STAB,
};