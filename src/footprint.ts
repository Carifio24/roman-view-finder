/* eslint-disable */

import { Annotation2, Poly2 } from "./Annotation2";
import { Matrix3d, RenderContext, Vector3d, WWTControl } from "@wwtelescope/engine";
import { D2R } from "@wwtelescope/astro";

type Point = [number, number];

function executeWithTransforms(renderContext: RenderContext, callable: CallableFunction, transforms: {
  world?: Matrix3d,
  view?: Matrix3d,
  projection?: Matrix3d,
}) {

  const oldWorld = transforms.world ? renderContext.get_world().clone() : renderContext.get_world();
  const oldWorldBase = transforms.world ? renderContext.get_worldBase().clone() : renderContext.get_world();
  const oldView = transforms.view ? renderContext.get_view().clone() : renderContext.get_view();
  const oldProjection = transforms.projection ? renderContext.get_projection().clone() : renderContext.get_projection();

  if (transforms.world) {
    renderContext.set_worldBase(Matrix3d.multiplyMatrix(transforms.world, renderContext.get_world())); renderContext.set_world(renderContext.get_worldBase().clone());
  }
  if (transforms.view) {
    renderContext.set_view(Matrix3d.multiplyMatrix(transforms.view, renderContext.get_view()));
  }
  if (transforms.projection) {
    renderContext.set_projection(Matrix3d.multiplyMatrix(transforms.projection, renderContext.get_projection()));
  }
  renderContext.makeFrustum();

  callable(renderContext);

  renderContext.set_worldBase(oldWorldBase);
  renderContext.set_world(oldWorld);
  renderContext.set_view(oldView);
  renderContext.set_projection(oldProjection);
  renderContext.makeFrustum();
}

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
  [0.4025665285872352, -0.08765786121144925]]]; 

const meanRA = 0;
const meanDec = 0;
const shiftedCorners: Point[][] = corners.map(corner => corner.map(pair => [pair[0] - meanRA, pair[1] - meanDec]));

interface DrawFootprintOptions {
  color: string;
  fill: boolean;
  fillOpacity: number;
}

let annotationsCreated = false;

export function drawFootprint(wwt: WWTControl, options: DrawFootprintOptions) {
  if (!annotationsCreated) {
    shiftedCorners.forEach(box => {
      const poly = new Poly2();
      box.forEach(pt => poly.addPoint(...pt));
      Annotation2.addAnnotation(poly);
    });
    annotationsCreated = true;
  }

  (Annotation2.annotations as Poly2[]).forEach(ann => {
    ann.set_fill(options.fill);
    ann.set_fillColor(options.color);
    ann.set_lineColor(options.color);
  });

  function draw(renderContext: RenderContext) {
    Annotation2.prepBatch(renderContext);
    const annotations = Annotation2.annotations as Annotation2[];
    for (const item of annotations) {
      item.draw(renderContext);
    }
    Annotation2.drawBatch(renderContext);
  }

  const startWorld = Matrix3d.rotationYawPitchRoll(-(meanRA - 90) * D2R, -meanDec * D2R, 0); let worldMatrix = wwt.renderContext.get_world().clone();
  worldMatrix.invert();
  worldMatrix = Matrix3d.multiplyMatrix(startWorld, worldMatrix);

  const startView = Matrix3d.lookAtLH(
    Vector3d.create(0, 0, 0),
    Vector3d.create(0, 0, -1), 
    Vector3d.create(0, 1, 0)
  );
  let viewMatrix = Matrix3d.lookAtLH(
    Vector3d.create(0, 0, 0),
    Vector3d.create(0, 0, -1), 
    Vector3d.create(Math.sin(wwt.renderContext.viewCamera.rotation), Math.cos(wwt.renderContext.viewCamera.rotation), 0)
  );
  viewMatrix.invert();
  viewMatrix = Matrix3d.multiplyMatrix(startView, viewMatrix);

  executeWithTransforms(wwt.renderContext, draw, {
    world: worldMatrix,
    view: viewMatrix,
  });
}
