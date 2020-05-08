/*
    7   8   9
    4       6
    1   2   3
*/

export const isUp = dir => [ 7, 8, 9 ].includes(dir);
export const isRight = dir => [ 3, 6, 9 ].includes(dir);
export const isDown = dir => [ 1, 2, 3].includes(dir);
export const isLeft = dir => [ 1, 4, 7].includes(dir);

export const get8DirFromHorzVert = (horz, vert) => {
    if (isUp(vert)) {
        if (isLeft(horz)) return 7;
        else if (isRight(horz)) return 9;
        return vert;
    } else if (isDown(vert)) {
        if (isLeft(horz)) return 1;
        else if (isRight(horz)) return 3;
        return vert;
    } else {
        return horz;
    }
};