Instructions
========================

This is due at midnight on the evening of **TBD: Tuesday, October 27**.

**Summary:** In this project, you'll be introduced to the basics of deferred
shading and WebGL. You'll use GLSL and WebGL to implement a deferred shading
pipeline and various lighting and visual effects.

**Recommendations:**
Take screenshots as you go. Use them to document your progress in your README!

Read (or at least skim) the full README before you begin, so that you know what
to expect and what to prepare for.

### Running the code

You need to launch a http server to view the content in your browser. 
If you have python, run the following command in your project folder. 
```
python server.py
```
Then open [`http://localhost:10565/`](http://localhost:10565/) in your browser.

This project requires a WebGL-capable web browser with support some extensions. 
You can use Chrome. Unfortunately Firefox doesn't work. 
And make sure you have updated your browser and video drivers.

## Requirements

**Ask on the mailing list for any clarifications.**

In this project, you are given code for the WebGL Forward Plus Renderer, which basically 
takes care of all setups like glTF model loading, shaders loading and compiling, buffer binding, etc. 
Your work is focusing on writing shaders in GLSL 1.00 that runs on GPU. 

### Required Tasks

You will need to perform the following tasks:

* Complete the deferred shading pipeline so that the Blinn-Phong and Post1
  shaders recieve the correct input. Go through the Starter Code Tour **before
  continuing!**

**Effects:**

* Implement deferred Blinn-Phong shading (diffuse + specular) for point lights
  * With normal mapping (code provided)
  * For deferred shading, you want to use a lighting model for the point lights
    which has a limited radius - so that adding a scissor or proxy geometry
    will not cause parts of the lighting to disappear. It should look very
    similar both with and without scissor/proxy optimization. Here is a
    convenient lighting model, but you can also use others:
    * `float attenuation = max(0.0, u_lightRad - dist_from_surface_to_light);`

* Implement one of the following effects:
  * Bloom using post-process blur (box or Gaussian) [1]
  * Toon shading (with ramp shading + simple depth-edge detection for outlines)

**Optimizations:**

* Scissor test optimization: when accumulating shading from each point
  light source, only render in a rectangle around the light.
  * Show a debug view for this (showing scissor masks clearly), e.g. by
    modifying and using `red.frag.glsl` with additive blending and alpha = 0.1.
  * Code is provided to compute this rectangle for you, and there are
    comments at the relevant place in `deferredRender.js` with more guidance.
    * **NOTE:** The provided scissor function is not very accurate - it is a
      quick hack which results in some errors (as can be seen in the live
      demo).

* Optimized g-buffer format - reduce the number and size of g-buffers:
  * Ideas:
    * Pack values together into vec4s
    * Use 2-component normals
    * Quantize values by using smaller texture types instead of gl.FLOAT
    * Reduce number of properties passed via g-buffer, e.g. by:
      * Applying the normal map in the `copy` shader pass instead of
        copying both geometry normals and normal maps
      * Reconstructing world space position using camera matrices and X/Y/depth
  * For credit, you must show a good optimization effort and record the
    performance of each version you test, in a simple table.
    * It is expected that you won't need all 4 provided g-buffers for a basic
      pipeline - make sure you disable the unused ones.
  * See mainly: `copy.frag.glsl`, `deferred/*.glsl`, `deferredSetup.js`

### Extra Tasks

You must do at least **10 points** worth of extra features (effects or
optimizations/analysis).

**Effects:**

* (3pts) The effect you didn't choose above (bloom or toon shading)

* (3pts) Screen-space motion blur (blur along velocity direction) [3]

* (2pts) Allow variability in additional material properties
  * Include other properties (e.g. specular coeff/exponent) in g-buffers
  * Use this to render objects with different material properties
  * These may be uniform across one model draw call, but you'll have to show
    multiple models

**Optimizations/Analysis:**

* (2pts) Improved screen-space AABB for scissor test
  (smaller/more accurate than provided - but beware of CPU/GPU tradeoffs)

* (3pts) Two-pass **Gaussian** blur using separable convolution (using a second
  postprocess render pass) to improve bloom or other 2D blur performance

* (4-6pts) Light proxies
  * (4pts) Instead of rendering a scissored full-screen quad for every light,
    render some proxy geometry which covers the part of the screen affected by
    the light (e.g. a sphere, for an attenuated point light).
    * A model called `sphereModel` is provided which can be drawn in the same
      way as the code in `drawScene`. (Must be drawn with a vertex shader which
      scales it to the light radius and translates it to the light position.)
  * (+2pts) To avoid lighting geometry far behind the light, render the proxy
    geometry (e.g. sphere) using an inverted depth test
    (`gl.depthFunc(gl.GREATER)`) with depth writing disabled (`gl.depthMask`).
    This test will pass only for parts of the screen for which the backside of
    the sphere appears behind parts of the scene.
    * Note that the copy pass's depth buffer must be bound to the FBO during
      this operation!
  * Show a debug view for this (showing light proxies)
  * Compare performance of this, naive, and scissoring.

* (8pts) Tile-based deferred shading with detailed performance comparison
  * On the CPU, check which lights overlap which tiles. Then, render each tile
    just once for all lights (instead of once for each light), applying only
    the overlapping lights.
    * The method is described very well in
      [Yuqin & Sijie's README](https://github.com/YuqinShao/Tile_Based_WebGL_DeferredShader/blob/master/README.md#algorithm-details).
    * This feature requires allocating the global light list and tile light
      index lists as shown at this link. These can be implemented as textures.
  * Show a debug view for this (number of lights per tile)

* (6pts) Deferred shading without multiple render targets
  (i.e. without WEBGL_draw_buffers).
  * Render the scene once for each target g-buffer, each time into a different
    framebuffer object.
  * Include a detailed performance analysis, comparing with/without
    WEBGL_draw_buffers (like in the
    [Mozilla blog article](https://hacks.mozilla.org/2014/01/webgl-deferred-shading/)).

* (2-6pts) Compare performance to equivalently-lit forward-rendering:
  * (2pts) With no forward-rendering optimizations
  * (+2pts) Coarse, per-object back-to-front sorting of geometry for early-z
    * (Of course) must render many objects to test
  * (+2pts) Z-prepass for early-z

This extra feature list is not comprehensive. If you have a particular idea
that you would like to implement, please **contact us first** (preferably on
the mailing list).

**Where possible, all features should be switchable using the GUI panel in
`ui.js`.**

### Performance & Analysis

**Before doing performance analysis,** you must disable debug mode by changing
`debugMode` to `false` in `framework.js`. Keep it enabled when developing - it
helps find WebGL errors *much* more easily.

Optimize your JavaScript and/or GLSL code. Chrome/Firefox's profiling tools
(see Resources section) will be useful for this. For each change
that improves performance, show the before and after render times.

For each new *effect* feature (required or extra), please
provide the following analysis:

* Concise overview write-up of the feature.
* Performance change due to adding the feature.
  * If applicable, how do parameters (such as number of lights, etc.)
    affect performance? Show data with simple graphs.
    * Show timing in milliseconds, not FPS.
* If you did something to accelerate the feature, what did you do and why?
* How might this feature be optimized beyond your current implementation?

For each *performance* feature (required or extra), please provide:

* Concise overview write-up of the feature.
* Detailed performance improvement analysis of adding the feature
  * What is the best case scenario for your performance improvement? What is
    the worst? Explain briefly.
  * Are there tradeoffs to this performance feature? Explain briefly.
  * How do parameters (such as number of lights, tile size, etc.) affect
    performance? Show data with graphs.
    * Show timing in milliseconds, not FPS.
  * Show debug views when possible.
    * If the debug view correlates with performance, explain how.

### Starter Code Tour

You'll be working mainly in `deferredRender.js` using raw WebGL. Three.js is
included in the project for various reasons. You won't use it for much, but its
matrix/vector types may come in handy.

It's highly recommended that you use the browser debugger to inspect variables
to get familiar with the code. At any point, you can also
`console.log(some_var);` to show it in the console and inspect it.

The setup in `deferredSetup` is already done for you, for many of the features.
If you want to add uniforms (textures or values), you'll change them here.
Therefore, it is recommended that you review the comments to understand the
process, BEFORE starting work in `deferredRender`.

In `deferredRender`, start at the **START HERE!** comment.
Work through the appropriate `TODO`s as you go - most of them are very
small. Test incrementally (after implementing each part, instead of testing
all at once).
* (The first thing you should be doing is implementing the fullscreen quad!)
* See the note in the Debugging section on how to test the first part of the
  pipeline incrementally.

Your _next_ first goal should be to get the debug views working.
Add code in `debug.frag.glsl` to examine your g-buffers before trying to
render them. (Set the debugView in the UI to show them.)

For editing JavaScript, you can use a simple editor with syntax highlighting
such as Sublime, Vim, Emacs, etc., or the editor built into Chrome.

* `js/`: JavaScript files for this project.
  * `main.js`: Handles initialization of other parts of the program.
  * `framework.js`: Loads the scene, camera, etc., and calls your setup/render
    functions. Hopefully, you won't need to change anything here.
  * `deferredSetup.js`: Deferred shading pipeline setup code.
    * `createAndBind(Depth/Color)TargetTexture`: Creates empty textures for
      binding to frame buffer objects as render targets.
  * `deferredRender.js`: Your deferred shading pipeline execution code.
    * `renderFullScreenQuad`: Renders a full-screen quad with the given shader
      program.
  * `ui.js`: Defines the UI using
    [dat.GUI](https://workshop.chromeexperiments.com/examples/gui/).
    * The global variable `cfg` can be accessed anywhere in the code to read
      configuration values.
  * `utils.js`: Utilities for JavaScript and WebGL.
    * `abort`: Aborts the program and shows an error.
    * `loadTexture`: Loads a texture from a URL into WebGL.
    * `loadShaderProgram`: Loads shaders from URLs into a WebGL shader program.
    * `loadModel`: Loads a model into WebGL buffers.
    * `readyModelForDraw`: Configures the WebGL state to draw a model.
    * `drawReadyModel`: Draws a model which has been readied.
    * `getScissorForLight`: Computes an approximate scissor rectangle for a
      light in world space.
* `glsl/`: GLSL code for each part of the pipeline:
  * `clear.*.glsl`: Clears each of the `NUM_GBUFFERS` g-buffers.
  * `copy.*.glsl`: Performs standard rendering without any fragment shading,
    storing all of the resulting values into the `NUM_GBUFFERS` g-buffers.
  * `quad.vert.glsl`: Minimal vertex shader for rendering a single quad.
  * `deferred.frag.glsl`: Deferred shading pass (for lighting calculations).
    Reads from each of the `NUM_GBUFFERS` g-buffers.
  * `post1.frag.glsl`: First post-processing pass.
* `lib/`: JavaScript libraries.
* `models/`: OBJ models for testing. Sponza is the default.
* `index.html`: Main HTML page.
* `server.bat` (Windows) or `server.py` (OS X/Linux):
  Runs a web server at `localhost:10565`.

### The Deferred Shading Pipeline

See the comments in `deferredSetup.js`/`deferredRender.js` for low-level guidance.

In order to enable and disable effects using the GUI, upload a vec4 uniform
where each component is an enable/disable flag. In JavaScript, the state of the
UI is accessible anywhere as `cfg.enableEffect0`, etc.

**Pass 1:** Renders the scene geometry and its properties to the g-buffers.
* `copy.vert.glsl`, `copy.frag.glsl`
* The framebuffer object `pass_copy.fbo` must be bound during this pass.
* Renders into `pass_copy.depthTex` and `pass_copy.gbufs[i]`, which need to be
  attached to the framebuffer.

**Pass 2:** Performs lighting and shading into the color buffer.
* `quad.vert.glsl`, `deferred/blinnphong-pointlight.frag.glsl`
* Takes the g-buffers `pass_copy.gbufs`/`depthTex` as texture inputs to the
  fragment shader, on uniforms `u_gbufs` and `u_depth`.
* `pass_deferred.fbo` must be bound.
* Renders into `pass_deferred.colorTex`.

**Pass 3:** Performs post-processing.
* `quad.vert.glsl`, `post/one.frag.glsl`
* Takes `pass_BlinnPhong_PointLight.colorTex` as a texture input `u_color`.
* Renders directly to the screen if there are no additional passes.

More passes may be added for additional effects (e.g. combining bloom with
motion blur) or optimizations (e.g. two-pass Gaussian blur for bloom)

#### Debugging

If there is a WebGL error, it will be displayed on the developer console and
the renderer will be aborted. To find out where the error came from, look at
the backtrace of the error (you may need to click the triangle to expand the
message). The line right below `wrapper @ webgl-debug.js` will point to the
WebGL call that failed.

When working in the early pipeline (before you have a lit render), it can be
useful to render WITHOUT post-processing. To do this, you have to make sure
that there is NO framebuffer bound while rendering to the screen (that is, bind
null) so that the output will display to the screen instead of saving into a
texture. Writing to gl_FragData[0] is the same as writing to gl_FragColor, so
you'll see whatever you were storing into the first g-buffer.

#### Changing the number of g-buffers

Note that the g-buffers are just `vec4`s - you can put any values you want into
them. However, if you want to change the total number of g-buffers (add more
for additional effects or remove some for performance), you will need to make
changes in a number of places:

* `deferredSetup.js`/`deferredRender.js`: search for `NUM_GBUFFERS`
* `copy.frag.glsl`
* `deferred.frag.glsl`
* `clear.frag.glsl`


## Resources

* [1] Bloom:
  [GPU Gems, Ch. 21](http://http.developer.nvidia.com/GPUGems/gpugems_ch21.html) 
* [2] Screen-Space Ambient Occlusion:
  [Floored Article](http://floored.com/blog/2013/ssao-screen-space-ambient-occlusion.html)
* [3] Post-Process Motion Blur:
  [GPU Gems 3, Ch. 27](http://http.developer.nvidia.com/GPUGems3/gpugems3_ch27.html)

**Also see:** The articles linked in the course schedule.

### Profiling and debugging tools

Built into Firefox:
* Canvas inspector
* Shader Editor
* JavaScript debugger and profiler

Built into Chrome:
* JavaScript debugger and profiler

Plug-ins:
* Web Tracing Framework
  **Does not currently work with multiple render targets**,
  which are used in the starter code.
* (Chrome) [Shader Editor](https://chrome.google.com/webstore/detail/shader-editor/ggeaidddejpbakgafapihjbgdlbbbpob)

Libraries:
* Stats.js (already included)

Firefox can also be useful - it has a canvas inspector, WebGL profiling and a
shader editor built in.

## README

Replace the contents of this README.md in a clear manner with the following:

* A brief description of the project and the specific features you implemented.
* At least one screenshot of your project running.
* A 30+ second video of your project running showing all features.
  [Open Broadcaster Software](http://obsproject.com) is recommended.
  (Even though your demo can be seen online, using multiple render targets
  means it won't run on many computers. A video will work everywhere.)
* A performance analysis (described below).

### Performance Analysis

See above.

### GitHub Pages

Since this assignment is in WebGL, you can make your project easily viewable by 
taking advantage of GitHub's project pages feature.

Once you are done with the assignment, create a new branch:

`git branch gh-pages`

Push the branch to GitHub:

`git push origin gh-pages`

Now, you can go to `<user_name>.github.io/<project_name>` to see your
renderer online from anywhere. Add this link to your README.

## Submit

1. Open a GitHub pull request so that we can see that you have finished.
   The title should be "Submission: YOUR NAME".
   * **ADDITIONALLY:**
     In the body of the pull request, include a link to your repository.
2. Send an email to the TA (gmail: shrekshao@ or likangning93@) with:
   * **Subject**: in the form of `[CIS565] Project N: PENNKEY`.
   * Direct link to your pull request on GitHub.
   * Estimate the amount of time you spent on the project.
   * If there were any outstanding problems, briefly explain.
   * **List the extra features you did.**
   * Feedback on the project itself, if any.

### Third-Party Code Policy

* Use of any third-party code must be approved by asking on our mailing list.
* If it is approved, all students are welcome to use it. Generally, we approve
  use of third-party code that is not a core part of the project. For example,
  for the path tracer, we would approve using a third-party library for loading
  models, but would not approve copying and pasting a CUDA function for doing
  refraction.
* Third-party code **MUST** be credited in README.md.
* Using third-party code without its approval, including using another
  student's code, is an academic integrity violation, and will, at minimum,
  result in you receiving an F for the semester.
