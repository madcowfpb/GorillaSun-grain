// BEGIN grain shader - from https://www.fxhash.xyz/article/all-about-that-grain
// slight modification of GorillaSun's grain algorihtm (does not add color to gray, and optionally adds "dust")
let grainBuffer;  // grain buffer
let grainShader;  // the shader

let shouldAnimate = true;

// in an init function, add this
//  grainBuffer = createGraphics(WIDTH,HEIGHT,WEBGL);
//  grainShader = grainBuffer.createShader(grainvert, grainfrag);

function applyGrain(w,h,b,amt=0.1,dust=false) {
    //grainBuffer = createGraphics(w,h,WEBGL);
    grainBuffer.resizeCanvas(w,h);
    //grainShader = grainBuffer.createShader(grainvert, grainfrag);

    grainBuffer.clear();
    grainBuffer.reset();
    grainBuffer.push();
    grainBuffer.shader(grainShader);
    grainShader.setUniform('source', b);
    if (shouldAnimate) {
        //grainShader.setUniform('noiseSeed', random());
        //grainShader.setUniform('noiseSeed', frameCount/100);
        grainShader.setUniform('noiseSeed', noiseSeed);
    }
    grainShader.setUniform('noiseAmount', amt);
    grainShader.setUniform("dust",dust?0.985:1.0);
    grainBuffer.rectMode(CENTER);
    grainBuffer.noStroke();
    grainBuffer.rect(0, 0, w, h);
    grainBuffer.pop();

    b.clear();
    b.push();
    b.image(grainBuffer, 0, 0);
    b.pop();

    //grainBuffer.remove();
}

const grainvert = `
precision highp float;
attribute vec3 aPosition;
attribute vec2 aTexCoord;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying vec2 vVertTexCoord;

void main(void) {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
  vVertTexCoord = aTexCoord;
}
`

const grainfrag = `
precision highp float;
varying vec2 vVertTexCoord;
uniform sampler2D source;
uniform float noiseSeed;
uniform float noiseAmount;
uniform float dust;
float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void main() {
    vec4 inColor = texture2D(source, vVertTexCoord);
    float r1,r2,r3;
    r1 = fract(noiseSeed + rand(vVertTexCoord * 1234.5678));
    r2 = fract(noiseSeed + rand(vVertTexCoord * 1234.5678));
    r3 = fract(noiseSeed + rand(vVertTexCoord * 1234.5678));
    if (all(greaterThan(vec3(r1,r2,r3),vec3(dust)))) {
      gl_FragColor = vec4(1.);
    } else {
    gl_FragColor = clamp(inColor + vec4(
        //mix(-noiseAmount, noiseAmount, fract(noiseSeed + rand(vVertTexCoord * 1234.5678))),
        //mix(-noiseAmount, noiseAmount, fract(noiseSeed + rand(vVertTexCoord * 1234.5678))),
        //mix(-noiseAmount, noiseAmount, fract(noiseSeed + rand(vVertTexCoord * 1234.5678))),
        mix(-noiseAmount, noiseAmount, r1),
        mix(-noiseAmount, noiseAmount, r2),
        mix(-noiseAmount, noiseAmount, r3),
        0.
    ), 0., 1.);
    }
}
`
// END
