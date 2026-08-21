/* eslint-disable */

import { Color, Coordinates, Dates, RenderContext, Settings, SimpleLineList, SpaceTimeController, TriangleList, Vector3d, WWTControl } from "@wwtelescope/engine";
import { horizontalToEquatorial } from "./utils";
import { D2H, D2R, H2D } from "@wwtelescope/astro";
import { TriangleList2D } from "./wwt-hacks";

type Point = [number, number];

const corners: Point[][] =
[[[359.99468507004264, -0.025734418244063445],
  [359.8697604874292, -0.02532585080625322],
  [359.8690372152699, 0.09753300218191625],
  [359.9946272589594, 0.09722905107223338]],
 [[359.99430742417394, -0.17073656197604314],
  [359.8703989672251, -0.17022256830886295],
  [359.8694740130912, -0.050015411384819866],
  [359.99423668169203, -0.05043959185160775]],
 [[359.9939308611184, -0.30015894545500804],
  [359.87113784994864, -0.29954686129850416],
  [359.87003658416296, -0.182280796141323],
  [359.99385188122193, -0.18281383014308028]],
 [[359.85919917761373, 0.0008717159243876052],
  [359.7347702484944, 0.0020197194509485776],
  [359.7334221644385, 0.12498574484005932],
  [359.858465820374, 0.12412723329933152]],
 [[359.8588061235196, -0.14461090368120644],
  [359.7353428987271, -0.14313864719666472],
  [359.73356768484314, -0.022688976154455823],
  [359.85784096014333, -0.023896507647423695]],
 [[359.858560426707, -0.2738559404630173],
  [359.73616267592683, -0.27211384792720544],
  [359.7340330316342, -0.15447757207517754],
  [359.857401952934, -0.15598648004431478]],
 [[359.72368753208247, 0.06597527851016441],
  [359.60020477574443, 0.06761799198068813],
  [359.5984993700447, 0.19096400888513884],
  [359.7224872093919, 0.18979136883949999]],
 [[359.72326492332786, -0.08051413267930431],
  [359.60063002014556, -0.07831510898186907],
  [359.5982699332742, 0.042824026947181036],
  [359.72160779540957, 0.04106943278459925]],
 [[359.72197531557146, -0.20892050496465397],
  [359.6002988201266, -0.20625883417316832],
  [359.59738475824554, -0.08763737770507561],
  [359.7199208506512, -0.08988847753122765]],
 [[0.13002342114600055, -0.025324406649288755],
  [0.0050861921166431125, -0.02572434477801389],
  [0.005083227632939621, 0.09723690724802268],
  [0.13068224785011007, 0.09755483636140437]],
 [[0.12946236467525013, -0.1702427165192665],
  [0.005539773122873044, -0.17074154981895506],
  [0.005551751591357874, -0.0504434881243945],
  [0.13033056028269144, -0.05002267638949978]],
 [[0.12877713497457535, -0.29957631199296897],
  [0.005969783780259347, -0.3001600640915767],
  [0.005989070875473647, -0.18281115562304665],
  [0.12982186268079818, -0.18230189096226004]],
 [[0.2650532923244187, 0.0020251576790862196],
  [0.14057759732746192, 0.0008736595679779733],
  [0.14124503766537916, 0.12414258017192059],
  [0.2663351946875176, 0.1250222293667824]],
 [[0.26454510571954704, -0.14316854630808157],
  [0.1410406378387175, -0.14463023307379763],
  [0.14194039018806645, -0.02391117550752587],
  [0.26626248742180725, -0.02270223132730377]],
 [[0.26379322116238685, -0.27216707575918053],
  [0.1413502679976014, -0.2738867219653863],
  [0.1424594825720191, -0.1560072390551217],
  [0.265873204107306, -0.15450882896553353]],
 [[0.39967058039023445, 0.06764865446253757],
  [0.27610898022695607, 0.06598686100195655],
  [0.27725364188426826, 0.1898392114583882],
  [0.4013193641818766, 0.1910359607524858]],
 [[0.3993029731549935, -0.07833963849333138],
  [0.27659592603033334, -0.08053286246943665],
  [0.2781958096019681, 0.041076269200446214],
  [0.4016020341838998, 0.04283754714539453]],
 [[0.39971582947989487, -0.2063223607808576],
  [0.277960646601634, -0.20897140269070094],
  [0.27995993414475323, -0.08990933274855276],
  [0.4025665285872352, -0.08765786121144925]]]
.map(box => box.map(pair => [pair[0] > 359 ? pair[0] - 360 : pair[0], pair[1]]));

// const corners = [ [ [ 0, 0 ], [ 0, 10 ], [ 15, 10 ], [ 15, 0 ] ] ];

// const nRegions = corners.length;
const nPoints = corners.reduce((currVal, corner) => currVal + corner.length, 0);

const fakeControl = new WWTControl();
fakeControl.renderContext = new RenderContext();

const meanIndex = (index: number) => corners.reduce((currVal, corner) => currVal + corner.reduce((curr, pair) => curr + pair[index], 0), 0) / nPoints;

// const meanRA = meanIndex(0);
// const meanDec = meanIndex(1);
const meanRA = 0;
const meanDec = 0;
const shiftedCorners: Point[][] = corners.map(corner => corner.map(pair => [pair[0] - meanRA, meanDec - pair[1]]));
let positionedShiftedCorners: Point[][] = shiftedCorners;

function getScreenPoints(wwt: WWTControl, worldPts: Point[]): Point[] {
  return worldPts.map(pt => {
    const screen = wwt.getScreenPointForCoordinates(pt[0] / 15, pt[1]);
    return [screen.x, screen.y];
  });
}

function _getWorldPoints(wwt: WWTControl, screenPts: Point[]): Point[] {
  return screenPts.map(pt => {
    const raDec = wwt.getCoordinatesForScreenPoint(...pt);
    return [15 * (raDec.x + 720) / 360, raDec.y];
  });
}

// NB: Clip space is the space [-1, 1]^2
function convertScreenPointsToClip(wwt: WWTControl, screenPts: Point[][]): Point[][] {
  const width = wwt.renderContext.width;
  const height = wwt.renderContext.height;
  const slopeH = 2 / width;
  const interceptH = -1;
  const slopeV = -2 / height;
  const interceptV = 1;
  const transform = (point: Point): Point => [point[0] * slopeH + interceptH, point[1] * slopeV + interceptV];
  return screenPts.map(box => box.map(transform));
}

interface DrawFootprintOptions {
  color: Color;
  fill: boolean;
  fillOpacity: number;
}

let fakeRendered = false;
export function drawFootprint(wwt: WWTControl, options: DrawFootprintOptions) {
  if (!fakeRendered) {
    const shadow = document.getElementById("shadow") as HTMLCanvasElement;
    fakeControl.gotoRADecZoom(0, 0, wwt.renderContext.viewCamera.zoom, true);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.fake = fakeControl; fakeControl.canvas = shadow; fakeControl.renderContext.gl = shadow.getContext("webgl2"); fakeControl.renderContext.set_backgroundImageset(wwt.renderContext.get_backgroundImageset());
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fakeControl.renderContext.set_world(wwt.renderContext.get_world()); fakeControl.renderContext.set_view(wwt.renderContext.get_view()); fakeControl.renderContext.set_projection(wwt.renderContext.get_projection());
    fakeControl.renderOneFrame();
    fakeRendered = true;
  }
  const footprint = new SimpleLineList();
  footprint.pure2D = true;
  footprint.set_depthBuffered(true);

  const camera = wwt.renderContext.viewCamera;
  fakeControl.renderContext.viewCamera.zoom = camera.zoom;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  fakeControl.renderContext.set_projection(wwt.renderContext.get_projection());

  const cosDec = Math.abs(Math.cos(wwt.renderContext.get_dec() * D2R));
  console.log(cosDec);
  console.log(shiftedCorners);
  const adjustedCorners: Point[][] = shiftedCorners.map(box => box.map(pair => [cosDec * pair[0], pair[1]]));
  console.log(adjustedCorners);
  console.log("------");
  const screenPoints = adjustedCorners.map(box => getScreenPoints(fakeControl, box));
  const clipPoints = convertScreenPointsToClip(fakeControl, screenPoints);

  const triangles = new TriangleList2D();
  triangles.pure2D = true;
  triangles.depthBuffered = true;
  const date = new Dates(0, 1);

  clipPoints.forEach(box => {
    const vectors = box.map(pt => Vector3d.create(...pt, 0));
    for (let i = 0; i < box.length - 1; i++) {
      footprint.addLine(vectors[i], vectors[i+1]);
    }
    footprint.addLine(vectors[box.length - 1], vectors[0]);

    if (options.fill) {
      const triangleColor = Color.fromArgb(Math.round(options.fillOpacity * 255), options.color.r, options.color.g, options.color.b);
      triangles.addTriangle(vectors[0], vectors[1], vectors[2], triangleColor, date);
      triangles.addTriangle(vectors[2], vectors[3], vectors[0], triangleColor, date);
    }
  });

  // if (options.fill) {
  //   const triangleColor = Color.fromArgb(Math.round(options.fillOpacity * 255), options.color.r, options.color.g, options.color.b);
  //   const ra = wwt.renderContext.get_RA() * H2D;
  //   const dec = wwt.renderContext.get_dec();
  //   shiftedCorners.forEach(box => {
  //     console.log(box.map(pt => [pt[0] + ra, pt[1] + dec]));
  //     const vectors = box.map(pt => Coordinates.raDecTo3d((pt[0] + ra) * D2H, pt[1] + dec));
  //     triangles.addSubdividedTriangles(vectors[0], vectors[1], vectors[2], triangleColor, date, subdivisions);
  //     triangles.addSubdividedTriangles(vectors[2], vectors[3], vectors[0], triangleColor, date, subdivisions);
  //   });
  // }

  footprint.drawLines(wwt.renderContext, 1, options.color);

  if (options.fill) {
     triangles.draw(wwt.renderContext, options.fillOpacity, true);
  }
}

positionedShiftedCorners = shiftedCorners.map(corner => corner.map(pair => [pair[0] + 60, pair[1] + 40]));
export function drawStaticFootprint(wwt: WWTControl, options: DrawFootprintOptions) {
  
  const footprint = new SimpleLineList();
  footprint.pure2D = true;
  footprint.set_depthBuffered(true);


  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const screenPoints = positionedShiftedCorners.map(box => getScreenPoints(wwt, box));
  const clipPoints = convertScreenPointsToClip(wwt, screenPoints);

  const triangles = new TriangleList2D();
  triangles.pure2D = true;
  triangles.depthBuffered = true;
  const date = new Dates(0, 1);

  clipPoints.forEach(box => {
    const vectors = box.map(pt => Vector3d.create(...pt, 0));
    for (let i = 0; i < box.length - 1; i++) {
      footprint.addLine(vectors[i], vectors[i+1]);
    }
    footprint.addLine(vectors[box.length - 1], vectors[0]);

    if (options.fill) {
      const triangleColor = Color.fromArgb(Math.round(options.fillOpacity * 255), options.color.r, options.color.g, options.color.b);
      triangles.addTriangle(vectors[0], vectors[1], vectors[2], triangleColor, date);
      triangles.addTriangle(vectors[2], vectors[3], vectors[0], triangleColor, date);
    }
  });

 
  footprint.drawLines(wwt.renderContext, 1, options.color);

  if (options.fill) {
     triangles.draw(wwt.renderContext, options.fillOpacity, true);
  }
}
