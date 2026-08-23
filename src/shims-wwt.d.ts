/* eslint-disable @typescript-eslint/naming-convention */

import "@wwtelescope/engine";

declare module "@wwtelescope/engine" {


  namespace Coordinates {
    function parse(data: string): number;
    function parseRA(ra: string, degrees: true): number;
    function parseDec(dec: string): number;
  }

  interface Matrix3d {
    clone(): Matrix3d;
    invert(): void;
  }

  namespace Matrix3d {
    function multiplyMatrix(matrix1: Matrix3d, matrix2: Matrix3d): Matrix3d;
    function rotationYawPitchRoll(yaw: number, pitch: number, roll: number): Matrix3d;
    function lookAtLH(cameraPosition: Vector3d, cameraTarget: Vector3d, cameraUpVector: Vector3d): Matrix3d;
  }

  interface Vector3d {}

  namespace Vector3d {
    function create(x: number, y: number, z: number): Vector3d;
  }

  interface SimpleLineList {
    pure2D: boolean;
    viewTransform: Matrix3d;
    set_depthBuffered(buffered: boolean): void;
    addLine(pt1: Vector3d, pt2: Vector3d): void;
    drawLines(context: RenderContext, opacity: number, color: Color): void;
    clear(): void;
  }

  interface RenderContext {
    makeFrustum(): void;
    set_projection(mat: Matrix3d): void;
    set_view(mat: Matrix3d): void;
    set_world(mat: Matrix3d): void;
    set_worldBase(mat: Matrix3d): void;
    get_projection(): Matrix3d;
    get_view(): Matrix3d;
    get_world(): Matrix3d;
    get_worldBase(): Matrix3d;
  }
}
