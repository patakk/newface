precision mediump float;




// texcoords from the vertex shader
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D tex0;

// the size of a texel or 1.0 / width , 1.0 / height
uniform vec2 texelSize;
uniform float seed;

uniform float u_time;
// which way to blur, vec2(1.0, 0.0) is horizontal, vec2(0.0, 1.0) is vertical


float randomNoise(vec2 p) {
  return fract(16791.414*sin(7.*p.x+p.y*73.41));
}

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float noise3 (in vec2 _st, in float t) {
    vec2 i = floor(_st+t);
    vec2 f = fract(_st+t);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 5

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

float fbm3 ( in vec2 _st, in float t) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise3(_st, t);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

float fff(vec2 st, float seed){

    vec2 q = vec2(0.);
    q.x = fbm3( st + 0.1, seed*.11);
    q.y = fbm3( st + vec2(1.0), seed*.11);
    vec2 r = vec2(0.);
    r.x = fbm3( st + 1.0*q + vec2(1.7,9.2)+ 0.15*seed*0.11, seed*.11);
    r.y = fbm3( st + 1.0*q + vec2(8.3,2.8)+ 0.126*seed*0.11, seed*.11);
    float f = fbm3(st+r, seed*.11);
    float ff = (f*f*f+0.120*f*f+.5*f);

    return ff;
}


void main() {

  	vec2 uv = gl_FragCoord.xy*texelSize;
    uv = uv/2.;
    //uv.y = 1. - uv.y;

    //vec4 color = texture2D(tex0, uv);
    float a = smoothstep(.1, .4, fff(uv*63., seed));
    float wi = 1. * (.5 + .5*a);

  	vec2 uv_up = (gl_FragCoord.xy + vec2(0., -wi))/2.*texelSize;
  	vec2 uv_dn = (gl_FragCoord.xy + vec2(0., +wi))/2.*texelSize;
  	vec2 uv_le = (gl_FragCoord.xy + vec2(-wi, 0.))/2.*texelSize;
  	vec2 uv_ri = (gl_FragCoord.xy + vec2(+wi, 0.))/2.*texelSize;


    vec4 color = texture2D(tex0, uv); 
    vec4 color_up = texture2D(tex0, uv_up); 
    vec4 color_dn = texture2D(tex0, uv_dn); 
    vec4 color_le = texture2D(tex0, uv_le); 
    vec4 color_ri = texture2D(tex0, uv_ri);

    float c_up = 0.2126*color_up.r + 0.7152*color_up.g + 0.0722*color_up.b; 
    float c_dn = 0.2126*color_dn.r + 0.7152*color_dn.g + 0.0722*color_dn.b; 
    float c_le = 0.2126*color_le.r + 0.7152*color_le.g + 0.0722*color_le.b; 
    float c_ri = 0.2126*color_ri.r + 0.7152*color_ri.g + 0.0722*color_ri.b; 
    float c_0 = 0.2126*color.r + 0.7152*color.g + 0.0722*color.b; 


    float dd_vert = smoothstep(.0, .1, abs(c_ri - c_le));
    float dd_hori = smoothstep(.0, .1, abs(c_up - c_dn));
    float dd = max(dd_vert, dd_hori);
    vec3 outrgb = vec3(dd);

    //vec4 color = texture2D(tex0, uv);
  	gl_FragColor = vec4(outrgb, 1.0);

}