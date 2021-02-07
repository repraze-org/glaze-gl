import {Matrix4, Vector2} from "@math.gl/core";
import {RenderingContext} from "../rendering-context";
import {RenderPass} from "../processing/render-pass";
import {Camera} from "./camera";
import {Bound2} from "../math/bound2";
import {Scene} from "./scene";
import {SceneObject, SceneObjectType} from "./scene-object";
import {Mesh} from "./mesh";
import {FrameBuffer} from "../frame-buffer";
import {RenderTexture} from "../render-texture";
import {ShaderProgram} from "../shader-program";
import {buildPlaneGeometry} from "../geometry-builder";
import {AmbientLight} from "./lights/ambient-light";
// import {DirectionalLight} from "./lights/directional-light";
import {PointLight} from "./lights/point-light";

function isMesh(object: SceneObject): object is Mesh {
    return object.type === SceneObjectType.MESH;
}

function isAmbientLight(object: SceneObject): object is AmbientLight {
    return object.type === SceneObjectType.AMBIENT_LIGHT;
}

// function isDirectionalLight(object: SceneObject): object is DirectionalLight {
//     return object.type === SceneObjectType.POINT_LIGHT;
// }

function isPointLight(object: SceneObject): object is PointLight {
    return object.type === SceneObjectType.POINT_LIGHT;
}

const OUTPUT_PROJECTION = new Matrix4().ortho({left: -0.5, right: 0.5, top: 0.5, bottom: -0.5, near: -0.1, far: 0.1});

const OUTPUT_VERTEX_SHADER = `#version 300 es
uniform mat4 uOutputProjection;

in vec4 aVertex;
in vec2 aUv;

out vec2 vPosition;

void main() {
    vPosition = aUv;
    gl_Position = uOutputProjection * aVertex;
}
`;

const OUTPUT_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uInput;

in vec2 vPosition;

layout (location = 0) out vec4 oColor;

void main() {
    oColor = texture(uInput, vPosition);
}
`;

const AMBIENT_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uColor;

uniform vec3 uLightColor;
uniform float uLightIntensity;

in vec2 vPosition;

layout (location = 0) out vec4 oColor;

void main() {
    vec3 color = texture(uColor, vPosition).xyz;
    oColor = vec4(uLightColor * uLightIntensity * color, 1.0);
}
`;

const POINT_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform mat4 uProjectionViewInvert;
uniform float uFar;

uniform sampler2D uColor;
uniform sampler2D uNormal;
uniform sampler2D uDepth;

uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform float uLightDecay;

in vec2 vPosition;

layout (location = 0) out vec4 oColor;

vec3 toWorldPosition(vec2 screen, float depth, mat4 projectionViewInvert) {
    vec4 clipSpaceLocation = vec4(screen * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
    vec4 homogenousLocation = projectionViewInvert * clipSpaceLocation;
    return homogenousLocation.xyz / homogenousLocation.w;
}

void main() {
    vec3 color = texture(uColor, vPosition).xyz;
    vec3 normal = (texture(uNormal, vPosition).xyz) * 2.0 - 1.0;
    float depth = texture(uDepth, vPosition).x;
    // float depth = texture(uNormal, vPosition).w * 2.0 - 1.0;
    
    vec3 position = vec3(0.0);
    if(depth < 1.0){
        position = toWorldPosition(vPosition, depth, uProjectionViewInvert);
    }

    vec3 direction = normalize(uLightPosition - position);
    float cosTheta = max(dot(normal, direction), 0.0);
    float distance = distance(position, uLightPosition);
    float attenuation = 1.0 / (distance * distance);

    oColor = vec4(uLightColor * uLightIntensity * cosTheta * attenuation * color, 1.0);
    // oColor = vec4(position, 1.0);
}
`;

const OUTPUT_GEOMETRY = buildPlaneGeometry(new Vector2(1, 1));

const ROOT_POSITION = new Matrix4();

export class ScenePass extends RenderPass {
    public debug = false;

    private outputBuffer: FrameBuffer;
    public output: RenderTexture;
    private outputProgram: ShaderProgram;

    // light inner passes
    protected meshesBuffer: FrameBuffer;
    public color: RenderTexture;
    public normal: RenderTexture;
    public depth: RenderTexture;
    protected accumulationBuffer: FrameBuffer;
    public accumulation: RenderTexture;
    private ambientProgram: ShaderProgram;
    // private directionalProgram: ShaderProgram;
    private pointProgram: ShaderProgram;

    // render objects
    private meshes: Mesh[];
    private ambientLights: AmbientLight[];
    private directionalLights: Mesh[];
    private pointLights: PointLight[];

    constructor(context: RenderingContext) {
        super(context);

        const gl = context.gl;

        this.meshes = [];
        this.ambientLights = [];
        this.directionalLights = [];
        this.pointLights = [];

        this.outputBuffer = new FrameBuffer();
        this.output = this.createRenderTexture(gl.RGBA, gl.UNSIGNED_BYTE);
        this.outputBuffer.setAttachment(gl.COLOR_ATTACHMENT0, this.output);

        this.meshesBuffer = new FrameBuffer();
        this.color = this.createRenderTexture(gl.RGBA, gl.UNSIGNED_BYTE);
        this.meshesBuffer.setAttachment(gl.COLOR_ATTACHMENT0, this.color);
        this.normal = this.createRenderTexture(gl.RGBA, gl.UNSIGNED_BYTE);
        this.meshesBuffer.setAttachment(gl.COLOR_ATTACHMENT1, this.normal);
        this.depth = this.createRenderTexture(gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT);
        this.depth.internalFormat = gl.DEPTH_COMPONENT16;
        this.meshesBuffer.setAttachment(gl.DEPTH_ATTACHMENT, this.depth);
        this.meshesBuffer.setDrawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);

        this.accumulationBuffer = new FrameBuffer();
        this.accumulation = this.createRenderTexture(gl.RGBA, gl.UNSIGNED_BYTE);
        this.accumulationBuffer.setAttachment(gl.COLOR_ATTACHMENT0, this.accumulation);

        this.outputProgram = new ShaderProgram(context.gl, {vs: OUTPUT_VERTEX_SHADER, fs: OUTPUT_FRAGMENT_SHADER});

        this.ambientProgram = new ShaderProgram(context.gl, {vs: OUTPUT_VERTEX_SHADER, fs: AMBIENT_FRAGMENT_SHADER});
        // directionalProgram
        this.pointProgram = new ShaderProgram(context.gl, {vs: OUTPUT_VERTEX_SHADER, fs: POINT_FRAGMENT_SHADER});
    }
    private createRenderTexture(format: number, type: number): RenderTexture {
        const texture = new RenderTexture(256, 256);
        texture.format = format;
        texture.internalFormat = format;
        texture.type = type;
        return texture;
    }
    render(scene: Scene, camera: Camera, target?: Bound2): void {
        const gl = this.context.gl;

        // object pass
        const viewport = this.viewport || this.context.viewport;
        const width = viewport.width - viewport.x;
        const height = viewport.height - viewport.y;

        // resize output
        this.output.setSize(width, height);
        this.color.setSize(width, height);
        this.normal.setSize(width, height);
        this.depth.setSize(width, height);
        this.accumulation.setSize(width, height);

        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

        this.updateScene(scene, camera);

        // set rendering target rect
        if (target !== undefined) {
            gl.enable(gl.SCISSOR_TEST);
            gl.scissor(target.x * width, target.y * height, target.w * width, target.h * height);
        }
        this.renderMeshes(scene, camera);
        if (target !== undefined) {
            gl.disable(gl.SCISSOR_TEST);
        }

        this.renderLight(camera);

        // output

        // const glFramebuffer = this.context.state.getFrameBuffer(this.outputBuffer);
        // gl.bindFramebuffer(gl.FRAMEBUFFER, glFramebuffer);

        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.disable(gl.DEPTH_TEST);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.outputProgram.use();
        this.outputProgram.uniforms["uOutputProjection"].setMat4(OUTPUT_PROJECTION);
        this.outputProgram.attributes["aVertex"].setVec4(OUTPUT_GEOMETRY.getAttribute("vertex"));
        this.outputProgram.attributes["aUv"].setVec2(OUTPUT_GEOMETRY.getAttribute("uv"));

        const vx = viewport.x;
        const vy = viewport.y;
        const vw = viewport.width;
        const vh = viewport.height;

        if (this.debug) {
            gl.viewport(vx, vy, vw / 2, vh / 2);
            this.outputProgram.uniforms["uInput"].setSampler2D(this.color);
            this.outputProgram.update(this.context.state);
            gl.drawArrays(gl.TRIANGLES, 0, OUTPUT_GEOMETRY.count);

            gl.viewport(vx + vw / 2, vy, vw / 2, vh / 2);
            this.outputProgram.uniforms["uInput"].setSampler2D(this.normal);
            this.outputProgram.update(this.context.state);
            gl.drawArrays(gl.TRIANGLES, 0, OUTPUT_GEOMETRY.count);

            gl.viewport(vx, vy + vh / 2, vw / 2, vh / 2);
            this.outputProgram.uniforms["uInput"].setSampler2D(this.depth);
            this.outputProgram.update(this.context.state);
            gl.drawArrays(gl.TRIANGLES, 0, OUTPUT_GEOMETRY.count);

            gl.viewport(vx + vw / 2, vy + vh / 2, vw / 2, vh / 2);
            this.outputProgram.uniforms["uInput"].setSampler2D(this.accumulation);
            this.outputProgram.update(this.context.state);
            gl.drawArrays(gl.TRIANGLES, 0, OUTPUT_GEOMETRY.count);
        } else {
            gl.viewport(vx, vy, vw, vh);
            this.outputProgram.uniforms["uInput"].setSampler2D(this.accumulation);
            this.outputProgram.update(this.context.state);
            gl.drawArrays(gl.TRIANGLES, 0, OUTPUT_GEOMETRY.count);
        }

        this.outputProgram.unuse();

        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    private updateScene(object: SceneObject, camera: Camera) {
        this.meshes.length = 0;
        this.ambientLights.length = 0;
        this.directionalLights.length = 0;
        this.pointLights.length = 0;

        // bucket and update all model positions
        object.forEachVisible((object) => {
            const parentModelMatrix = object.parent !== null ? object.parent.modelMatrix : ROOT_POSITION; // change to world and apply camera after
            object.modelMatrix.copy(object.matrix).multiplyLeft(parentModelMatrix);

            // object
            if (isMesh(object)) {
                this.meshes.push(object);
            } else if (isAmbientLight(object)) {
                this.ambientLights.push(object);
            } else if (isPointLight(object)) {
                this.pointLights.push(object);
            }
        });

        // update camera matrix from position if not in scene
        if (camera.parent === null) {
            camera.modelMatrix.copy(camera.matrix);
        }
        camera.viewMatrix.copy(camera.modelMatrix).invert();

        // update mesh matrix
        for (let i = 0; i < this.meshes.length; i++) {
            const mesh = this.meshes[i];
            mesh.modelViewMatrix.copy(mesh.modelMatrix).multiplyLeft(camera.viewMatrix);
            // mesh.normalMatrix.copy(mesh.modelViewMatrix).invert().transpose(); // view space normal
            mesh.normalMatrix.copy(mesh.modelMatrix).invert().transpose(); // world space normal
        }
    }
    private renderMeshes(scene: Scene, camera: Camera) {
        const gl = this.context.gl;

        const glFramebuffer = this.context.state.getFrameBuffer(this.meshesBuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, glFramebuffer);

        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        const clearColor = scene.clearColor;
        gl.clearColor(clearColor.x, clearColor.y, clearColor.z, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (let i = 0; i < this.meshes.length; i++) {
            const mesh = this.meshes[i];
            mesh.material.program.use();
            // mesh specific uniforms / attributes based on shader
            mesh.material.bind(mesh, camera);
            mesh.material.program.update(this.context.state);
            gl.drawArrays(gl.TRIANGLES, 0, mesh.geometry.count);
            mesh.material.program.unuse();
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    private renderLight(camera: Camera) {
        const gl = this.context.gl;

        const glFramebuffer = this.context.state.getFrameBuffer(this.accumulationBuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, glFramebuffer);

        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.ALWAYS);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const viewport = this.viewport || this.context.viewport;
        const vx = viewport.x;
        const vy = viewport.y;
        const vw = viewport.width;
        const vh = viewport.height;

        gl.viewport(vx, vy, vw, vh);

        // ambient lights
        if (this.ambientLights.length > 0) {
            this.ambientProgram.use();
            this.ambientProgram.uniforms["uOutputProjection"].setMat4(OUTPUT_PROJECTION);
            this.ambientProgram.attributes["aVertex"].setVec4(OUTPUT_GEOMETRY.getAttribute("vertex"));
            this.ambientProgram.attributes["aUv"].setVec2(OUTPUT_GEOMETRY.getAttribute("uv"));

            this.ambientProgram.uniforms["uColor"].setSampler2D(this.color);
            for (let i = 0; i < this.ambientLights.length; i++) {
                const light = this.ambientLights[i];
                this.ambientProgram.uniforms["uLightColor"].setVec3(light.color);
                this.ambientProgram.uniforms["uLightIntensity"].setFloat(light.intensity);
                this.ambientProgram.update(this.context.state);
                gl.drawArrays(gl.TRIANGLES, 0, OUTPUT_GEOMETRY.count);
            }
            this.ambientProgram.unuse();
        }

        // directional lights

        // point lights
        if (this.pointLights.length > 0) {
            this.pointProgram.use();
            this.pointProgram.uniforms["uOutputProjection"].setMat4(OUTPUT_PROJECTION);
            this.pointProgram.uniforms["uProjectionViewInvert"]?.setMat4(
                camera.projectionMatrix.clone().multiplyRight(camera.viewMatrix).invert(),
            ); // TODO: invert inside camera
            this.pointProgram.attributes["aVertex"].setVec4(OUTPUT_GEOMETRY.getAttribute("vertex"));
            this.pointProgram.attributes["aUv"].setVec2(OUTPUT_GEOMETRY.getAttribute("uv"));

            this.pointProgram.uniforms["uColor"]?.setSampler2D(this.color);
            this.pointProgram.uniforms["uNormal"]?.setSampler2D(this.normal);
            this.pointProgram.uniforms["uDepth"]?.setSampler2D(this.depth);
            for (let i = 0; i < this.pointLights.length; i++) {
                const light = this.pointLights[i];
                this.pointProgram.uniforms["uLightPosition"]?.setVec3(light.modelMatrix.getTranslation());
                this.pointProgram.uniforms["uLightColor"]?.setVec3(light.color);
                this.pointProgram.uniforms["uLightIntensity"]?.setFloat(light.intensity);
                this.pointProgram.uniforms["uLightDecay"]?.setFloat(light.decay);
                this.pointProgram.update(this.context.state);
                gl.drawArrays(gl.TRIANGLES, 0, OUTPUT_GEOMETRY.count);
            }
            this.pointProgram.unuse();
        }

        gl.disable(gl.BLEND);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}
