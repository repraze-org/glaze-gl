import {Matrix4} from "@math.gl/core";
import {Bound2} from "./math/bound2";

export interface Camera {
    projection: Matrix4;
    viewport: Bound2;
}
