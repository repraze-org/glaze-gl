import {Matrix4, Vector3, Vector2} from "@math.gl/core";
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
import {DirectionalLight} from "./lights/directional-light";
import {PointLight} from "./lights/point-light";

function isMesh(object: SceneObject): object is Mesh {
    return object.type === SceneObjectType.MESH;
}

function isAmbientLight(object: SceneObject): object is AmbientLight {
    return object.type === SceneObjectType.AMBIENT_LIGHT;
}

function isDirectionalLight(object: SceneObject): object is DirectionalLight {
    return object.type === SceneObjectType.DIRECTIONAL_LIGHT;
}

function isPointLight(object: SceneObject): object is PointLight {
    return object.type === SceneObjectType.POINT_LIGHT;
}

const OUTPUT_PROJECTION = new Matrix4().ortho({left: -0.5, right: 0.5, top: 0.5, bottom: -0.5, near: -0.1, far: 0.1});

const OUTPUT_VERTEX_SHADER = `#version 300 es
uniform mat4 uOutputMatrix;

in vec4 aVertex;
in vec2 aUv;

out vec2 vPosition;

void main() {
    vPosition = aUv;
    gl_Position = uOutputMatrix * aVertex;
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

const DIRECTIONAL_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform mat4 uProjectionViewMatrixInverse;
uniform float uFar;

uniform sampler2D uColor;
uniform sampler2D uNormal;
uniform sampler2D uDepth;

uniform mat4 uLightViewProjectionMatrix;
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform bool uLightEnableShadow;
uniform sampler2D uLightShadow;

in vec2 vPosition;

layout (location = 0) out vec4 oColor;

vec3 toWorldPosition(vec2 screen, float depth, mat4 projectionViewInvert) {
    vec4 clipSpaceLocation = vec4(screen * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
    vec4 homogenousLocation = projectionViewInvert * clipSpaceLocation;
    return homogenousLocation.xyz / homogenousLocation.w;
}

float getShadowFactor(vec3 position, float cosTheta) {
    vec4 lightPosition = uLightViewProjectionMatrix * vec4(position, 1.0);
    vec3 projCoords = (lightPosition.xyz / lightPosition.w) * 0.5 + 0.5;

    float value = 1.0;
    float bias = 0.001 * tan(acos(cosTheta)); // TODO: check if needed, pass as uniform
    if(texture(uLightShadow, projCoords.xy).r < projCoords.z - bias) {
        value = 0.0;
    }
    return value;
}

void main() {
    vec3 color = texture(uColor, vPosition).xyz;
    vec3 normal = (texture(uNormal, vPosition).xyz) * 2.0 - 1.0;
    float depth = texture(uDepth, vPosition).x;
    
    vec3 position = vec3(0.0);
    if(depth < 1.0){
        position = toWorldPosition(vPosition, depth, uProjectionViewMatrixInverse);
    }

    vec3 direction = normalize(uLightPosition);
    float cosTheta = max(dot(normal, direction), 0.0);

    float shadow = 1.0;
    if(uLightEnableShadow) {
        shadow = getShadowFactor(position, cosTheta);
    }

    oColor = vec4(uLightColor * uLightIntensity * cosTheta * shadow * color, 1.0);
    //oColor = texture(uLightShadow, vPosition);
}
`;

const POINT_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform mat4 uProjectionViewMatrixInverse;
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
    
    vec3 position = vec3(0.0);
    if(depth < 1.0){
        position = toWorldPosition(vPosition, depth, uProjectionViewMatrixInverse);
    }

    vec3 direction = normalize(uLightPosition - position);
    float cosTheta = max(dot(normal, direction), 0.0);
    float distance = distance(position, uLightPosition);
    float attenuation = 1.0 / pow(distance, uLightDecay);

    oColor = vec4(uLightColor * uLightIntensity * cosTheta * attenuation * color, 1.0);
}
`;

const SHADOW_VERTEX_SHADER = `#version 300 es
uniform mat4 uLightViewProjectionMatrix;
uniform mat4 uModelMatrix;

in vec4 aVertex;

void main() {
    gl_Position = uLightViewProjectionMatrix * uModelMatrix * aVertex;
}
`;

const SHADOW_FRAGMENT_SHADER = `#version 300 es
precision highp float;

void main() {}
`;

const OUTPUT_GEOMETRY = buildPlaneGeometry(new Vector2(1, 1));

const ROOT_POSITION = new Matrix4();

const SHADOW_SIZE = 1024; // TODO: move

export class ScenePass extends RenderPass {
    public debug = false;

    // output pass
    private outputBuffer: FrameBuffer;
    public output: RenderTexture;
    private outputProgram: ShaderProgram;

    // object pass
    protected meshesBuffer: FrameBuffer;
    public color: RenderTexture;
    public normal: RenderTexture;
    public depth: RenderTexture;

    // shadow pass
    private shadowProgram: ShaderProgram;
    private shadowBuffer: FrameBuffer;
    private shadow: RenderTexture;

    // light pass
    private ambientProgram: ShaderProgram;
    private directionalProgram: ShaderProgram;
    private pointProgram: ShaderProgram;
    private accumulationBuffer: FrameBuffer;
    public accumulation: RenderTexture;

    // render lists
    private meshes: Mesh[];
    private ambientLights: AmbientLight[];
    private directionalLights: DirectionalLight[];
    private pointLights: PointLight[];

    constructor(context: RenderingContext) {
        super(context);

        const gl = context.gl;

        // output pass init

        this.outputBuffer = new FrameBuffer();
        this.output = this.createRenderTexture(gl.RGBA, gl.UNSIGNED_BYTE);
        this.outputBuffer.setAttachment(gl.COLOR_ATTACHMENT0, this.output);
        this.outputProgram = new ShaderProgram(context.gl, {vs: OUTPUT_VERTEX_SHADER, fs: OUTPUT_FRAGMENT_SHADER});

        // object pass init

        this.meshesBuffer = new FrameBuffer();
        this.color = this.createRenderTexture(gl.RGBA, gl.UNSIGNED_BYTE);
        this.meshesBuffer.setAttachment(gl.COLOR_ATTACHMENT0, this.color);
        this.normal = this.createRenderTexture(gl.RGBA, gl.UNSIGNED_BYTE);
        this.meshesBuffer.setAttachment(gl.COLOR_ATTACHMENT1, this.normal);
        this.depth = this.createRenderTexture(gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT);
        this.depth.internalFormat = gl.DEPTH_COMPONENT16;
        this.meshesBuffer.setAttachment(gl.DEPTH_ATTACHMENT, this.depth);
        this.meshesBuffer.setDrawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);

        // shadow pass init

        this.shadowProgram = new ShaderProgram(context.gl, {vs: SHADOW_VERTEX_SHADER, fs: SHADOW_FRAGMENT_SHADER});
        this.shadowBuffer = new FrameBuffer();
        this.shadow = this.createRenderTexture(gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT);
        this.shadow.internalFormat = gl.DEPTH_COMPONENT16;
        this.shadow.setSize(SHADOW_SIZE, SHADOW_SIZE);
        this.shadowBuffer.setAttachment(gl.DEPTH_ATTACHMENT, this.shadow);
        this.shadowBuffer.setDrawBuffers([]); // no other output then depth // TODO: nuke

        // light pass init

        this.accumulationBuffer = new FrameBuffer();
        this.accumulation = this.createRenderTexture(gl.RGBA, gl.UNSIGNED_BYTE);
        this.accumulationBuffer.setAttachment(gl.COLOR_ATTACHMENT0, this.accumulation);

        this.ambientProgram = new ShaderProgram(context.gl, {vs: OUTPUT_VERTEX_SHADER, fs: AMBIENT_FRAGMENT_SHADER});
        this.directionalProgram = new ShaderProgram(context.gl, {
            vs: OUTPUT_VERTEX_SHADER,
            fs: DIRECTIONAL_FRAGMENT_SHADER,
        });
        this.pointProgram = new ShaderProgram(context.gl, {vs: OUTPUT_VERTEX_SHADER, fs: POINT_FRAGMENT_SHADER});

        // lists init

        this.meshes = [];
        this.ambientLights = [];
        this.directionalLights = [];
        this.pointLights = [];
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
        this.outputProgram.uniforms["uOutputMatrix"].setMat4(OUTPUT_PROJECTION);
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
            } else if (isDirectionalLight(object)) {
                this.directionalLights.push(object);
            } else if (isPointLight(object)) {
                this.pointLights.push(object);
            }
        });

        // update camera matrix from position if not in scene
        if (camera.parent === null) {
            camera.modelMatrix.copy(camera.matrix);
        }
        camera.viewMatrix.copy(camera.modelMatrix).invert();
        camera.projectionViewMatrixInverse.copy(camera.projectionMatrix).multiplyRight(camera.viewMatrix).invert();

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

        const glAccumulationFramebuffer = this.context.state.getFrameBuffer(this.accumulationBuffer);
        const glShadowFramebuffer = this.context.state.getFrameBuffer(this.shadowBuffer);

        gl.bindFramebuffer(gl.FRAMEBUFFER, glAccumulationFramebuffer);

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
            this.ambientProgram.uniforms["uOutputMatrix"].setMat4(OUTPUT_PROJECTION);
            this.ambientProgram.attributes["aVertex"].setVec4(OUTPUT_GEOMETRY.getAttribute("vertex"));
            this.ambientProgram.attributes["aUv"].setVec2(OUTPUT_GEOMETRY.getAttribute("uv"));

            this.ambientProgram.uniforms["uColor"].setSampler2D(this.color);
            for (let i = 0; i < this.ambientLights.length; i++) {
                // accumulation
                const light = this.ambientLights[i];
                this.ambientProgram.uniforms["uLightColor"].setVec3(light.color);
                this.ambientProgram.uniforms["uLightIntensity"].setFloat(light.intensity);
                this.ambientProgram.update(this.context.state);
                gl.drawArrays(gl.TRIANGLES, 0, OUTPUT_GEOMETRY.count);
            }
            this.ambientProgram.unuse();
        }

        // directional lights
        if (this.directionalLights.length > 0) {
            this.directionalProgram.use();
            this.directionalProgram.uniforms["uOutputMatrix"].setMat4(OUTPUT_PROJECTION);
            this.directionalProgram.uniforms["uProjectionViewMatrixInverse"].setMat4(
                camera.projectionViewMatrixInverse,
            );
            this.directionalProgram.attributes["aVertex"].setVec4(OUTPUT_GEOMETRY.getAttribute("vertex"));
            this.directionalProgram.attributes["aUv"].setVec2(OUTPUT_GEOMETRY.getAttribute("uv"));

            this.directionalProgram.uniforms["uColor"]?.setSampler2D(this.color);
            this.directionalProgram.uniforms["uNormal"]?.setSampler2D(this.normal);
            this.directionalProgram.uniforms["uDepth"]?.setSampler2D(this.depth);
            for (let i = 0; i < this.directionalLights.length; i++) {
                const light = this.directionalLights[i];
                // shadow
                if (light.enableShadows) {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, glShadowFramebuffer);
                    this.shadowProgram.use();
                    gl.clear(gl.DEPTH_BUFFER_BIT);
                    gl.viewport(0, 0, SHADOW_SIZE, SHADOW_SIZE); // TODO, shadow size
                    gl.depthFunc(gl.LEQUAL);
                    const scale = 10;
                    // TODO: clean once working into light itself
                    const lightProjection = new Matrix4().ortho({
                        left: scale,
                        right: -scale,
                        top: -scale,
                        bottom: scale,
                        near: 0.5,
                        far: 20, // TODO 500 ?
                    });
                    const lightView = new Matrix4().lookAt(light.position, new Vector3(0, 0, 0), new Vector3(0, 0, 1));
                    // Matrix4f lightProjection = Matrix4f.orthographic(-scale, scale, -scale, scale, -10, 20);
                    // Matrix4f lightView = Matrix4f.lookAt(direction, new Vector3f(0.f, 0.f, 0.f), new Vector3f(0.f, 1.f, 0.f));
                    const lightViewProjection = lightView.multiplyLeft(lightProjection);
                    this.shadowProgram.uniforms["uLightViewProjectionMatrix"].setMat4(lightViewProjection);

                    for (let i = 0; i < this.meshes.length; i++) {
                        const mesh = this.meshes[i];
                        this.shadowProgram.uniforms["uModelMatrix"].setMat4(mesh.modelMatrix);
                        this.shadowProgram.attributes["aVertex"].setVec4(mesh.geometry.getAttribute("vertex"));
                        this.shadowProgram.update(this.context.state);
                        gl.drawArrays(gl.TRIANGLES, 0, mesh.geometry.count);
                    }

                    // reverse bind
                    gl.bindFramebuffer(gl.FRAMEBUFFER, glAccumulationFramebuffer);
                    gl.viewport(vx, vy, vw, vh);
                    gl.depthFunc(gl.ALWAYS);
                    this.directionalProgram.use();
                    this.directionalProgram.uniforms["uLightViewProjectionMatrix"].setMat4(lightViewProjection);
                    this.directionalProgram.uniforms["uLightEnableShadow"]?.setBool(true);
                    this.directionalProgram.uniforms["uLightShadow"]?.setSampler2D(this.shadow);
                } else {
                    // disable shadow in shader
                    this.directionalProgram.uniforms["uLightEnableShadow"]?.setBool(false);
                }

                // accumulation
                this.directionalProgram.uniforms["uLightPosition"]?.setVec3(light.position);
                this.directionalProgram.uniforms["uLightColor"]?.setVec3(light.color);
                this.directionalProgram.uniforms["uLightIntensity"]?.setFloat(light.intensity);
                this.directionalProgram.update(this.context.state);
                gl.drawArrays(gl.TRIANGLES, 0, OUTPUT_GEOMETRY.count);
            }
            this.directionalProgram.unuse();
        }

        // point lights
        if (this.pointLights.length > 0) {
            this.pointProgram.use();
            this.pointProgram.uniforms["uOutputMatrix"].setMat4(OUTPUT_PROJECTION);
            this.pointProgram.uniforms["uProjectionViewMatrixInverse"].setMat4(camera.projectionViewMatrixInverse);
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
