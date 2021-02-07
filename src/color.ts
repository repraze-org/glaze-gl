import {Vector3} from "@math.gl/core";

export interface RGBValue {
    r: number;
    g: number;
    b: number;
}

export interface HSLValue {
    h: number;
    s: number;
    l: number;
}

export interface HSVValue {
    h: number;
    s: number;
    v: number;
}

// constants

const HEX_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i;
const HEX6_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
const HEX8_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

// utilities
function pad(str: string, char: string, len: number): string {
    return (char.repeat(len) + str).slice(-len);
}
function pad2(str: string): string {
    return pad(str, "0", 2);
}
function floatToHex(d: number): string {
    return Math.round(d * 255).toString(16);
}
function hexToFloat(h: string): number {
    return parseInt(h, 16) / 255;
}

// conversions

function HSLToRGB(h: number, s: number, l: number): RGBValue {
    let r;
    let g;
    let b;

    function hue2rgb(p: number, q: number, t: number) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {r, g, b};
}

function RGBToHSL(r: number, g: number, b: number): HSLValue {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h;
    let s;
    const l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
            default:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return {h, s, l};
}

export class Color extends Vector3 {
    constructor();
    constructor(color: number | string);
    constructor(r: number, g: number, b: number);

    constructor(...args: Array<any>) {
        // default to black
        super(0, 0, 0);

        if (args.length === 1) {
            const hex = args[0];
            if (typeof hex === "number") {
                this.setHex(hex);
            } else {
                this.setHexString(hex);
            }
        } else if (args.length >= 3) {
            this.setRGB(args[0], args[1], args[2]);
        }
    }

    // renaming
    get r(): number {
        return this.x;
    }
    set r(value: number) {
        this.x = value;
    }
    get g(): number {
        return this.y;
    }
    set g(value: number) {
        this.y = value;
    }
    get b(): number {
        return this.z;
    }
    set b(value: number) {
        this.z = value;
    }

    // utilities
    static isHex(value: string): boolean {
        return HEX_REGEX.test(value);
    }
    static isHex6(value: string): boolean {
        return HEX6_REGEX.test(value);
    }
    static isHex8(value: string): boolean {
        return HEX8_REGEX.test(value);
    }

    // methods
    setHex(hex: number): this {
        hex = Math.floor(hex);

        this.x = ((hex >> 16) & 255) / 255;
        this.y = ((hex >> 8) & 255) / 255;
        this.z = (hex & 255) / 255;

        return this;
    }
    getHex(): number {
        return ((this.x * 255) << 16) ^ ((this.y * 255) << 8) ^ ((this.z * 255) << 0);
    }
    setHexString(hex: string): this {
        const match = HEX_REGEX.exec(hex);
        if (match) {
            this.x = hexToFloat(match[1]);
            this.y = hexToFloat(match[2]);
            this.z = hexToFloat(match[3]);
            return this;
        }
        throw new TypeError(`Invalid hex value "${hex}"`);
    }
    getHexString(): string {
        const rh = pad2(floatToHex(this.x));
        const gh = pad2(floatToHex(this.y));
        const bh = pad2(floatToHex(this.z));
        return `#${rh}${gh}${bh}`;
    }
    setRGB(r: number, g: number, b: number): this {
        this.x = r;
        this.y = g;
        this.z = b;

        return this;
    }
    getRGB(): RGBValue {
        return {r: this.x, g: this.y, b: this.z};
    }
    setHSL(h: number, s: number, l: number): this {
        const rgb = HSLToRGB(h, s, l);

        this.x = rgb.r;
        this.y = rgb.g;
        this.z = rgb.b;

        return this;
    }
    getHSL(): HSLValue {
        return RGBToHSL(this.x, this.y, this.z);
    }
}
