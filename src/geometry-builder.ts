import {Vector2, Vector3} from "@math.gl/core";
import {Geometry} from "./geometry";
import {GeometryBuffer} from "./geometry-buffer";

function indexedRepeat<T>(data: T[], dataSize: number, index: number[]): T[] {
    const output: T[] = [];
    for (let i = 0; i < index.length; i++) {
        const dataIndex = index[i] * dataSize;
        for (let j = 0; j < dataSize; j++) {
            output.push(data[dataIndex + j]);
        }
    }
    return output;
}

export function buildPlaneGeometry(size: Vector2): Geometry {
    // plane
    // 0 ----- 1
    // |     / |
    // |   /   |
    // | /     |
    // 2-------3

    const geometry = new Geometry();

    const halfSizeX = size.x / 2;
    const halfSizeY = size.y / 2;

    const vertices: number[] = [];
    vertices.push(-halfSizeX, halfSizeY, 0); // 0
    vertices.push(halfSizeX, halfSizeY, 0); // 1
    vertices.push(-halfSizeX, -halfSizeY, 0); // 2
    vertices.push(halfSizeX, -halfSizeY, 0); // 3
    const vertexIndex = [0, 2, 1, 1, 2, 3];
    const finalVertex = indexedRepeat(vertices, 3, vertexIndex);
    geometry.setAttribute("vertex", new GeometryBuffer(new Float32Array(finalVertex), 3));

    const normals: number[] = [];
    normals.push(0, 0, 1); // 0
    const normalIndex = [0, 0, 0, 0, 0, 0];
    const finalNormal = indexedRepeat(normals, 3, normalIndex);
    geometry.setAttribute("normal", new GeometryBuffer(new Float32Array(finalNormal), 3));

    const uvs: number[] = [];
    uvs.push(0, 1); // 0
    uvs.push(1, 1); // 1
    uvs.push(0, 0); // 2
    uvs.push(1, 0); // 3
    const uvIndex = [0, 2, 1, 1, 2, 3];
    const finalUv = indexedRepeat(uvs, 2, uvIndex);
    geometry.setAttribute("uv", new GeometryBuffer(new Float32Array(finalUv), 2));

    return geometry;
}

export function buildGridGeometry(size: Vector3): Geometry {
    const geometry = new Geometry();

    // vertex
    // normal
    // color
    // uv

    return geometry;
}

export function buildBoxGeometry(size: Vector3): Geometry {
    const geometry = new Geometry();

    const halfSizeX = size.x / 2;
    const halfSizeY = size.y / 2;
    const halfSizeZ = size.z / 2;

    const vertices: number[] = [];
    vertices.push(-halfSizeX, halfSizeY, halfSizeZ); // 0
    vertices.push(halfSizeX, halfSizeY, halfSizeZ); // 1
    vertices.push(-halfSizeX, -halfSizeY, halfSizeZ); // 2
    vertices.push(halfSizeX, -halfSizeY, halfSizeZ); // 3
    vertices.push(-halfSizeX, halfSizeY, -halfSizeZ); // 4
    vertices.push(halfSizeX, halfSizeY, -halfSizeZ); // 5
    vertices.push(-halfSizeX, -halfSizeY, -halfSizeZ); // 6
    vertices.push(halfSizeX, -halfSizeY, -halfSizeZ); // 7
    const vertexIndex = [
        // front
        0,
        2,
        1,
        1,
        2,
        3,
        // right
        1,
        3,
        5,
        5,
        3,
        7,
        // back
        5,
        7,
        4,
        4,
        7,
        6,
        // left
        4,
        6,
        0,
        0,
        6,
        2,
        // top
        4,
        0,
        5,
        5,
        0,
        1,
        // bottom
        2,
        6,
        3,
        3,
        6,
        7,
    ];
    const finalVertex = indexedRepeat(vertices, 3, vertexIndex);
    geometry.setAttribute("vertex", new GeometryBuffer(new Float32Array(finalVertex), 3));

    const normals: number[] = [];
    normals.push(0, 0, 1); // 0 +z
    normals.push(1, 0, 0); // 1 +x
    normals.push(0, 0, -1); // 2 -z
    normals.push(-1, 0, 0); // 3 -x
    normals.push(0, 1, 0); // 4 +y
    normals.push(0, -1, 0); // 5 -y
    const normalIndex = [
        // front
        0,
        0,
        0,
        0,
        0,
        0,
        // right
        1,
        1,
        1,
        1,
        1,
        1,
        // back
        2,
        2,
        2,
        2,
        2,
        2,
        // left
        3,
        3,
        3,
        3,
        3,
        3,
        // top
        4,
        4,
        4,
        4,
        4,
        4,
        // bottom
        5,
        5,
        5,
        5,
        5,
        5,
    ];
    const finalNormal = indexedRepeat(normals, 3, normalIndex);
    geometry.setAttribute("normal", new GeometryBuffer(new Float32Array(finalNormal), 3));

    const uvs: number[] = [];
    uvs.push(0, 1); // 0
    uvs.push(1, 1); // 1
    uvs.push(0, 0); // 2
    uvs.push(1, 0); // 3
    const uvIndex = [
        // front
        0,
        2,
        1,
        1,
        2,
        3,
        // right
        0,
        2,
        1,
        1,
        2,
        3,
        // back
        0,
        2,
        1,
        1,
        2,
        3,
        // left
        0,
        2,
        1,
        1,
        2,
        3,
        // top
        0,
        2,
        1,
        1,
        2,
        3,
        // bottom
        0,
        2,
        1,
        1,
        2,
        3,
    ];
    const finalUv = indexedRepeat(uvs, 2, uvIndex);
    geometry.setAttribute("uv", new GeometryBuffer(new Float32Array(finalUv), 2));

    return geometry;

    return geometry;
}

export function buildSphereGeometry(size: Vector3): Geometry {
    const geometry = new Geometry();

    // vertex
    // normal
    // color
    // uv

    return geometry;
}

// simple obj loader
export function buildObjGeometry(objstr: string): Geometry {
    const geometry = new Geometry();

    const vertices: number[] = [];
    const vertexIndex: number[] = [];

    const normals: number[] = [];
    const normalIndex: number[] = [];

    const uvs: number[] = [];
    const uvIndex: number[] = [];

    // parse
    const lines = objstr.split(/\r?\n/);
    let line = "";
    for (let l = 0; l < lines.length; l++) {
        line = lines[l];
        // skips
        if (line.length === 0) {
            // empty
            continue;
        }
        if (line.startsWith("#")) {
            // comment
            continue;
        }
        // logic
        if (line.startsWith("v ")) {
            const data = line.split(/\s+/);
            vertices.push(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));
        } else if (line.startsWith("vn ")) {
            const data = line.split(/\s+/);
            normals.push(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));
        } else if (line.startsWith("vt ")) {
            const data = line.split(/\s+/);
            uvs.push(parseFloat(data[1]), parseFloat(data[2]));
        } else if (line.startsWith("f ")) {
            const data = line.split(/\s+/);
            for (let f = 1; f < data.length; f++) {
                const faceData = data[f].split("/");
                vertexIndex.push(parseInt(faceData[0], 10) - 1);
                normalIndex.push(parseInt(faceData[2], 10) - 1);
                uvIndex.push(parseInt(faceData[1], 10) - 1);
            }
        }
    }

    // finalize
    const finalVertex = indexedRepeat(vertices, 3, vertexIndex);
    geometry.setAttribute("vertex", new GeometryBuffer(new Float32Array(finalVertex), 3));
    const finalNormal = indexedRepeat(normals, 3, normalIndex);
    geometry.setAttribute("normal", new GeometryBuffer(new Float32Array(finalNormal), 3));
    const finalUv = indexedRepeat(uvs, 2, uvIndex);
    geometry.setAttribute("uv", new GeometryBuffer(new Float32Array(finalUv), 2));

    return geometry;
}
