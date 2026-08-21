/* eslint-disable @typescript-eslint/naming-convention */

import "@wwtelescope/engine";

declare module "@wwtelescope/engine" {

  interface Coordinates {
    static parse(data: string): number;
    static parseRA(ra: string, degrees: true): number;
    static parseDec(dec: string): number;
    static raDecTo3d(ra: number, dec: number): Vector3d;
  }

  interface Matrix3d {
    clone(): Matrix3d;
    setIdentity(): void;
    set(matrix: Matrix3d): void;
    scale(value: Vector3d): void;
    translate(value: Vector3d): void;
    transform(vector: Vector3d): Vector3d;
    transformArray(points: Vector3d[]): void;
    get_determinant(): number;
    invert(): void;
    transpose(): void;
    multiplyVector(vector: Vector3d): void;
  
    get_m11(): number;
    get_m12(): number;
    get_m13(): number;
    get_m14(): number;
    get_m21(): number;
    get_m22(): number;
    get_m23(): number;
    get_m24(): number;
    get_m31(): number;
    get_m32(): number;
    get_m33(): number;
    get_m34(): number;
    get_m41(): number;
    get_m42(): number;
    get_m43(): number;
    get_m44(): number;
    get_offsetX(): number;
    get_offsetY(): number;
    get_offsetZ(): number;
  
    set_m11(value: number): number;
    set_m12(value: number): number;
    set_m13(value: number): number;
    set_m14(value: number): number;
    set_m21(value: number): number;
    set_m22(value: number): number;
    set_m23(value: number): number;
    set_m24(value: number): number;
    set_m31(value: number): number;
    set_m32(value: number): number;
    set_m33(value: number): number;
    set_m34(value: number): number;
    set_m41(value: number): number;
    set_m42(value: number): number;
    set_m43(value: number): number;
    set_m44(value: number): number;
    set_offsetX(value: number): number;
    set_offsetY(value: number): number;
    set_offsetZ(value: number): number;
  }

  namespace Matrix3d {
    function create(
      m11: number, m12: number, m13: number, m14: number,
      m21: number, m22: number, m23: number, m24: number,
      m31: number, m32: number, m33: number, m34: number,
      offsetX: number, offsetY: number, offsetZ: number, m44: number,
    ): Matrix3d;
    function get_identity(): Matrix3d;
    function multiplyMatrix(matrix1: Matrix3d, matrix2: Matrix3d): Matrix3d;
    function equals(matrix1: Matrix3d, matrix2: Matrix3d): boolean;
    function rotationYawPitchRoll(heading: number, pitch: number, roll: number): Matrix3d;
    function invertMatrix(matrix: Matrix3d): Matrix3d;
    function translation(vector: Vector3d): Matrix3d;
  }

  interface Vector3d {
    x: number;
    y: number;
    z: number;
  }

  namespace Vector3d {
    function cross(left: Vector3d, right: Vector3d): Vector3d;
    function dot(left: Vector3d, right: Vector3d): number;
    function getLength(v: Vector3d): number;
    function getLengthSq(v: Vector3d): number;
    function scale(v: Vector3d, factor: number): Vector3d;
    function normalize(): void;
  }

  class SimpleLineList {
    pure2D: boolean;
    viewTransform: Matrix3d;
    set_depthBuffered(buffered: boolean): void;
    addLine(pt1: Vector3d, pt2: Vector3d): void;
    drawLines(context: RenderContext, opacity: number, color: Color): void;
    clear(): void;
  }

  class Dates {
    constructor(start: number, end: number);
  }

  class TriangleList {
    pure2D: boolean | undefined;
    depthBuffered: boolean;
    addTriangle(v1: Vector3d, v2: Vector3d, v3: Vector3d, color: Color, date: Dates): void;
    addSubdividedTriangles(v1: Vector3d, v2: Vector3d, v3: Vector3d, color: Color, date: Dates, subdivisions: number): void;
    draw(renderContext: RenderContext, opacity: number, cull: boolean): void;
    clear(): void;
  }
}
