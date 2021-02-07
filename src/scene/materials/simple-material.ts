import {Color} from "../../color";
import {ShaderProgram} from "../../shader-program";
import {Texture} from "../../texture";
import {Camera} from "../camera";
import {Mesh} from "../mesh";
import {Material} from "./material";

const VERTEX_SHADER = `
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;

attribute vec4 aVertex;
attribute vec2 aUv;
attribute vec4 aNormal;

varying vec2 vUv;
varying vec4 vNormal;

// vec3 pack() {}

void main() {
    vUv = aUv;
    vNormal = (uNormalMatrix * aNormal) * 0.5 + 0.5;
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertex;
}
`;

const FRAGMENT_SHADER = `
#extension GL_EXT_draw_buffers : require
precision highp float;

uniform vec3 uColor;
uniform bool uEnableMap;
uniform sampler2D uMap;

varying vec2 vUv;
varying vec4 vNormal;

void main(){
    vec3 color = uColor;
    if(uEnableMap) {
        color *= texture2D(uMap, vUv).xyz;
    }
    gl_FragData[0] = vec4(color, 1.0);
    gl_FragData[1] = vNormal;
}
`;

export class SimpleMaterial extends Material {
    public color: Color;
    public map?: Texture; // TODO: rename map

    constructor(gl: WebGLRenderingContext) {
        gl.getExtension("EXT_frag_depth"); // TODO: remove when packing depth into normal texture
        super(new ShaderProgram(gl, {vs: VERTEX_SHADER, fs: FRAGMENT_SHADER}));
        this.color = new Color(0xffffff);
    }
    bind(mesh: Mesh, camera: Camera): void {
        // uniforms
        this.program.uniforms["uProjectionMatrix"].setMat4(camera.projectionMatrix);
        this.program.uniforms["uModelViewMatrix"].setMat4(mesh.modelViewMatrix);
        this.program.uniforms["uNormalMatrix"].setMat4(mesh.normalMatrix);

        this.program.uniforms["uColor"].setVec3(this.color);
        this.program.uniforms["uEnableMap"].setBool(this.map !== undefined);
        if (this.map !== undefined) {
            this.program.uniforms["uMap"].setSampler2D(this.map);
        }

        // attributes
        this.program.attributes["aVertex"].setVec4(mesh.geometry.getAttribute("vertex"));
        this.program.attributes["aNormal"].setVec4(mesh.geometry.getAttribute("normal"));
        this.program.attributes["aUv"].setVec2(mesh.geometry.getAttribute("uv"));
    }
}
