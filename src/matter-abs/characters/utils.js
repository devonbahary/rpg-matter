export function squareInFrontOf(range = 1) {
    let minX, maxX, minY, maxY;
    switch (this._direction) {
        case 2:
            minX = this.x - (this.width / 2);
            maxX = this.x + (this.width / 2);
            minY = this.y;
            maxY = this.y + range;
            break;
        case 4: 
            minX = this.x - range;
            maxX = this.x;
            minY = this.y - (this.height / 2);
            maxY = this.y + (this.height / 2);
            break;
        case 6:
            minX = this.x;
            maxX = this.x + range;
            minY = this.y - (this.height / 2);
            maxY = this.y + (this.height / 2);
            break;
        case 8:
            minX = this.x - (this.width / 2);
            maxX = this.x + (this.width / 2);
            minY = this.y - range;
            maxY = this.y;
            break;
    }
    return {
        min: {
            x: minX,
            y: minY,
        }, 
        max: {
            x: maxX,
            y: maxY,
        },
    };
};

export function squareAround(range = 1) {
    const d = range / 2;
    return {
        min: {
            x: this.x - d,
            y: this.y - d,
        },
        max: {
            x: this.x + d,
            y: this.y + d,
        },
    };
};