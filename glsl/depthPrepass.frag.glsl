#version 100

precision highp float;
precision highp int;

uniform float u_near;
uniform float u_far;

// Need to linearize the depth because we are using the projection
float linearizeDepth(float depth) {
	float z = depth * 2.0 - 1.0;
	return (2.0 * u_near * u_far) / (u_far + u_near - z * (u_far - u_near));
}

void main() {
	float depth = linearizeDepth(gl_FragCoord.z) / u_far;
	gl_FragColor = vec4(vec3(depth), 1.0);
}