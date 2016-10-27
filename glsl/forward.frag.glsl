#version 100

precision highp float;
precision highp int;

#define MAX_LIGHT_NUM 256

varying vec3 v_normal;
varying vec2 v_uv;

varying vec3 v_eyePosition;

uniform mat4 u_viewMatrix;

uniform int u_numLights;

uniform sampler2D u_lightPositionTexture;   //xyz
uniform sampler2D u_lightColorRadiusTexture;    //rgba


uniform sampler2D u_diffuse;

void main() {

    vec3 color = vec3(0.0, 0.0, 0.0);

    vec3 diffuseColor = texture2D(u_diffuse, v_uv).rgb;
    vec3 ambientColor = diffuseColor * 0.2;
    vec3 diffuseLight = vec3(0.0);

    for (int i = 0; i < MAX_LIGHT_NUM; i++)
    {
        if (i >= u_numLights) break;

        vec2 lightUV = vec2( (float(i) + 0.5 ) / float(u_numLights) , 0.5);
        vec4 lightPos = vec4(texture2D(u_lightPositionTexture, lightUV).xyz, 1.0);
        // float lightRadius = texture2D(u_lightColorRadiusTexture, lightUV).w;
        vec4 lightColorRadius = texture2D(u_lightColorRadiusTexture, lightUV);

        // shading
        lightPos = u_viewMatrix * lightPos;
        vec3 l = lightPos.xyz - v_eyePosition;
        float dist = length(l);
        // if (dist > lightColorRadius.w) continue;
        l /= dist;
        float attenuation = max(0.0, 1.0 - dist / lightColorRadius.w);
        diffuseLight += attenuation * lightColorRadius.rgb * max(0.0, dot(v_normal, l));
    }

    color += ambientColor;

    diffuseColor *= diffuseLight;
    color += diffuseColor;


    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4 (v_normal, 1.0);
}