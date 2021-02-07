// https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid/21963136#21963136
const LUT: string[] = [];
for (let i = 0; i < 256; i++) {
    LUT[i] = (i < 16 ? "0" : "") + i.toString(16);
}
export function uuid(): string {
    const d0 = (Math.random() * 0xffffffff) | 0;
    const d1 = (Math.random() * 0xffffffff) | 0;
    const d2 = (Math.random() * 0xffffffff) | 0;
    const d3 = (Math.random() * 0xffffffff) | 0;
    const uuid =
        LUT[d0 & 0xff] +
        LUT[(d0 >> 8) & 0xff] +
        LUT[(d0 >> 16) & 0xff] +
        LUT[(d0 >> 24) & 0xff] +
        "-" +
        LUT[d1 & 0xff] +
        LUT[(d1 >> 8) & 0xff] +
        "-" +
        LUT[((d1 >> 16) & 0x0f) | 0x40] +
        LUT[(d1 >> 24) & 0xff] +
        "-" +
        LUT[(d2 & 0x3f) | 0x80] +
        LUT[(d2 >> 8) & 0xff] +
        "-" +
        LUT[(d2 >> 16) & 0xff] +
        LUT[(d2 >> 24) & 0xff] +
        LUT[d3 & 0xff] +
        LUT[(d3 >> 8) & 0xff] +
        LUT[(d3 >> 16) & 0xff] +
        LUT[(d3 >> 24) & 0xff];
    return uuid;
}

export function toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}

export function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}
