
const nonZero = function(a) {
    const FLOAT_EPS = 1.4E-45;
    return FLOAT_EPS <= Math.abs(a);
}


const m00 = 0; const m01 = 4; const m02 = 8;  const m03 = 12;
const m10 = 1; const m11 = 5; const m12 = 9;  const m13 = 13;
const m20 = 2; const m21 = 6; const m22 = 10; const m23 = 14;
const m30 = 3; const m31 = 7; const m32 = 11; const m33 = 15;

const screenXImpl_w = function(pg, x, y, z, w) {

    const projection = pg._renderer.uPMatrix.mat4;

    let ox =
      projection[m00]*x + projection[m01]*y + projection[m02]*z + projection[m03]*w;
    const ow =
      projection[m30]*x + projection[m31]*y + projection[m32]*z + projection[m33]*w;

    if (nonZero(ow)) {
      ox /= ow;
    }
    const sx = res * (1 + ox) / 2.0;
    return sx;
  }


const screenYImpl_w = function(pg, x, y, z, w) {

    const projection = pg._renderer.uPMatrix.mat4;

    let oy =
      projection[m10]*x + projection[m11]*y + projection[m12]*z + projection[m13]*w;
    const ow =
      projection[m30]*x + projection[m31]*y + projection[m32]*z + projection[m33]*w;

    if (nonZero(ow)) {
      oy /= ow;
    }
    let sy = res * (1 + oy) / 2.0;
    // Turning value upside down because of Processing's inverted Y axis.
    sy = res - sy;
    return sy;
  }

const get3Dpos = function(pg, vec){
    const modelview = pg._renderer.uMVMatrix.mat4;

    var x = vec.x;
    var y = vec.y;
    var z = vec.z;

    const ax =
      modelview[m00]*x + modelview[m01]*y + modelview[m02]*z + modelview[m03];
    const ay =
      modelview[m10]*x + modelview[m11]*y + modelview[m12]*z + modelview[m13];
    const az =
      modelview[m20]*x + modelview[m21]*y + modelview[m22]*z + modelview[m23];
    const aw =
      modelview[m30]*x + modelview[m31]*y + modelview[m32]*z + modelview[m33];

    return createVector(ax, ay, az);
}

const _screenX = function(pg, x, y, z) {

    const modelview = pg._renderer.uMVMatrix.mat4;

    const ax =
      modelview[m00]*x + modelview[m01]*y + modelview[m02]*z + modelview[m03];
    const ay =
      modelview[m10]*x + modelview[m11]*y + modelview[m12]*z + modelview[m13];
    const az =
      modelview[m20]*x + modelview[m21]*y + modelview[m22]*z + modelview[m23];
    const aw =
      modelview[m30]*x + modelview[m31]*y + modelview[m32]*z + modelview[m33];
    return screenXImpl_w(pg, ax, ay, az, aw);
}

const _screenY = function(pg, x, y, z) {

    const modelview = pg._renderer.uMVMatrix.mat4;

    const ax =
      modelview[m00]*x + modelview[m01]*y + modelview[m02]*z + modelview[m03];
    const ay =
      modelview[m10]*x + modelview[m11]*y + modelview[m12]*z + modelview[m13];
    const az =
      modelview[m20]*x + modelview[m21]*y + modelview[m22]*z + modelview[m23];
    const aw =
      modelview[m30]*x + modelview[m31]*y + modelview[m32]*z + modelview[m33];
    return screenYImpl_w(pg, ax, ay, az, aw);
}

const _screenZ = function(pg, x, y, z, w) {

    const projection = pg._renderer.uPMatrix.mat4;

    let oz =
      projection[m20]*x + projection[m21]*y + projection[m22]*z + projection[m23]*w;
    const ow =
      projection[m30]*x + projection[m31]*y + projection[m32]*z + projection[m33]*w;

    if (nonZero(ow)) {
      oz /= ow;
    }
    const sz = (oz + 1) / 2.0;
    return sz;
}

function getScreenPos(pg, pos){
    var sx, sy;
    var sx = _screenX(pg, pos.x, pos.y, pos.z) - pg.width/2;
    var sy = _screenY(pg, pos.x, pos.y, pos.z) - pg.height/2;

    return createVector(sx, sy);
}
