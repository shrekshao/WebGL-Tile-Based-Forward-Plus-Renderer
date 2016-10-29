Instructions
========================

This is due at midnight on the evening of **Sun, Nov 6 2016**.

**Summary:** In this project, you'll be introduced to the basics of deferred
shading and WebGL. You'll use GLSL and WebGL to implement a forward plus shading
pipeline and various lighting and visual effects.

**Recommendations:**
Take screenshots as you go. Use them to document your progress in your README!

Read (or at least skim) the full Instructions before you begin, so that you know what
to expect and what to prepare for.

### Running the code

You need to launch a http server to view the content in your browser. 
If you have python, run the following command in your project folder. 
```
python server.py
```
Then open [`http://localhost:10565/`](http://localhost:10565/) in your browser.

This project requires a WebGL-capable web browser with support some extensions. 
You can use Chrome. Unfortunately Firefox doesn't work with depth texture. 
And make sure you have updated your browser and video drivers.

## Requirements

**Ask on the mailing list for any clarifications.**

In this project, you are given code for the WebGL Forward Plus Renderer, which basically 
takes care of all setups like glTF model loading, shaders loading and compiling, buffer binding, etc. 
Your work is focusing on writing shaders in GLSL 1.00 that runs on GPU. 

### Required Tasks

* Write the light debug view
  - `glsl/lightDebug.vert.glsl`
  - `glsl/lightDebug.frag.glsl`
  - `lightDebug.js` (Simply uncomment code)
  - draw lights as points to show their position for debug purpose

* Write a naive forward shader
  - `glsl/forward.vert.glsl`
  - `glsl/forward.frag.glsl`
  - this is used for warmup you to get familiar to webgl and glsl.  

* Write a naive forward plus shader with
  - `glsl/lightCulling.vert.glsl`: view frustum light Culling on gpu
  - `glsl/lightCulling.frag.glsl`: view frustum light Culling on gpu
    - Find which tile this pixel belongs to
    - Each pixel represents a light. Light idx = pixel idx in its tile.
    - calculate the view frustum box of this tile. [3]
    - write the `gl_FragColor` a color depending on if the light hits the frustum box  
  - `glsl/lightAccumulation.vert.glsl`: light Accumulation (forward shading)
  - `glsl/lightAccumulation.frag.glsl`: light Accumulation (forward shading)

* Using blinn-phong shading (diffuse + specular) for point lights
  - With normal mapping (code provided)

### Extra Tasks

You must do at least **4 points** worth of extra features (effects or
optimizations/analysis).

**Effects:**

* (3pts) Bloom using post-process blur (box or Gaussian) [1]
  * This needs to add one more pass at the end as post processing, 
  and render the lightAccumulation to a texture by binding a framebuffer object.
  * Recommended approach: 
    - add shaders `bloom.vert.glsl`, `bloom.frag.glsl` in `glsl/`
    - add a post-process pass js file in `js/forwardPlusRenderer/pass/` to handle shader loading, 
    buffer and uniform binding issues. Use other existing passes as examples
    - call the post-process pass with `renderFullQuad` in forwardPlusPipeline. Also bind a frame buffer to the lightAccumulation pass. 
  * You can add other post processing effect following this manner 

* (2pts) Toon shading (with ramp shading + simple depth-edge detection for outlines)

* (3pts) Screen-space motion blur (blur along velocity direction) [2]

* (1pts) Add a transparent object draw pass
  * This can use the lightAccumulation program. What you need to do is to enable blend and add one more draw pass at the end.
  * You can draw some different model in transparent pass.   

**Optimizations/Analysis:**

* (1pts) early z termination with depth prepass
  - Depth prepass is already implemented for you. Simply integrate it into your pipeline.
  
* (1pts) Performance analysis on different tile size
  - keep in mind that maximum number of lights in the scene in our implementation is dependent 
  on tile size. 

* (2pts) Fully utilize rgba channel of tileLightsTexture
  - so that we can allow tile size x4 lights in the scene 

* (3pts) frustum box with tile min max depth
  - We only cull light using left, right, top, bottom faces of a view frustum
  - In the original forward-plus paper, min and max depth of a tile is also used for light culling
  - You can let every thread loop through each pixel in its tile of the depth texture, 
  or do a tile min max depth prepass and output a texture first. 
  - Be sure to do a performance analysis

* (3pts) Two-pass **Gaussian** blur using separable convolution (using a second
  postprocess render pass) to improve bloom or other 2D blur performance

* (4pts) More efficient way of view frustum test detection. 
  - accurate light culling is expensive. But false positive will greatly reduce the performance. 
  - show how many false positive does our naive frustum hittest have. show how many after optimization.
  - see [3] and [5]

* (3pts) Compare performance to equivalently-lit forward shading and deferred-shading: 
  * You can pair with a classmate choosing to do deferred-renderer.

This extra feature list is not comprehensive. If you have a particular idea
that you would like to implement, please **contact us first** (preferably on
the mailing list).

**Where possible, all features should be switchable using the GUI panel in
`ui.js`.**

### Performance & Analysis

Optimize your JavaScript and/or GLSL code. Chrome profiling tools
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

* `js/`: JavaScript source code for the renderer
  * `main.js`: Entrance: Handles initialization of other parts of the program.
  * `ui.js`: Defines the UI using
    [dat.GUI](https://workshop.chromeexperiments.com/examples/gui/).
    * The `FPR.cfg` can be accessed anywhere in the code to read
      configuration values.
  * `forwardPlusRenderer/`
    * `scene.js`: Loads and organize the scene structure. 
    * `shaders.js`: Loads shader files
    * `lights.js`: manage light and light position, color radius texture
    * `forwardPlusRenderer.js`: the main renderer manager, 
      class object named `FPR` or `ForwardPlusRenderer`, handles the all pipelines, aggregate everything
    * `pass/`: different passes in pipeline, they corresponds to `FPR.pass.*`
      - `depthPrepass`: draw the scene, store the depth in a texture. First step of Forward-Plus
      - `depthDebug`(No such file, but there's a depthDebug pass): debug view: draw the depth texture
      - `forward`: naive forward shading pipeline. Isolated from other pass
      - `lightCulling`: test light and view frustum box(tile) overlapping. Second step of Forward-Plus
        - To get a correct rendering result, it is okay to have false positive (judging every light is overlapping with this tile)
        - To get a better performance, we need to try to avoid false positive
      - `lightAccumulation`: shade current pixel with light overlapping with current cell. Final step of Forward-Plus
        - It's just naive forward with knowing which light is visible
      - `tileLightDebug`: debug view: draw a full quad, showing how many lights are there in each tile with color scales
      - `lightDebug`: debug view: draw light in the scene as point to show their position. 
* `glsl/`: GLSL Shader source code
  * `passName.vert.glsl` and `passName.frag.glsl` forms the shader program for `FPR.pass.passName` 
* `lib/`: JavaScript libraries.
* `models/`: glTF models for testing. Sponza is the default.
* `index.html`: Main HTML page.
* `server.bat` (Windows) or `server.py` (OS X/Linux):
  Runs a web server at `localhost:10565`.

For editing JavaScript, you can use a simple editor with syntax highlighting
such as Atom, VS-Code, Sublime, Vim, Emacs, etc., or the editor built into Chrome.

### Pipelines

You can always switch between pipelines using the gui on the top right corner. 


### The Forward Shading Pipeline

`FPR.pipeline.forwardPipeline`: 

Renders the scene geometry and perform lighting

* `forward.vert.glsl`
* `forward.frag.glsl`
  - loop through each light, get their info stored in the `u_lightPositionTexture`, `u_lightColorRadiusTexture`
  and perform blinn phong.

### The Forward Plus Shading Pipeline

`FPR.pipeline.forwardPlusPipeline`: 

**Pass 1:** (Optional) Depth Prepass
* `depthPrepass.vert.glsl`, `depthPrepass.frag.glsl`
* `FPR.pass.depthPrepass`
* The framebuffer object `FPR.pass.depthPrepass.framebuffer` must be bound during this pass.
* Renders into `FPR.pass.depthPrepass.depthTexture`

**Pass 2:** Light Culling
* `lightCulling.vert.glsl`, `lightCulling.frag.glsl`
* `FPR.pass.lightCulling`
* The paper uses compute shader to do light culling, which is the idea case for desktop
API like D3D and OpenGL. Unfortunately WebGL has no compute shader and no support for uniform buffer. 
So we use texture as a work around, which brings some limitation and performance drop. 
* Actually we are not rendering any thing. We are writing value to buffer (texture in this project).
* For each pixel, we find the tile it belongs to. Next we compute the view frustum box of this tile.
We then test if this box overlaps with the AABB of the light that this pixel is representing (lightIdx = id of pixel in this tile) 
* Input: `FPR.light.positionTexture`, `FPR.light.colorRadiusTexture`, `FPR.pass.depthPrepass.depthTexture` (Optional)
* Output: `FPR.pass.lightCulling.tileLighitTexture` 
* `FPR.pass.lightCulling.tileLightsFB` must be bound.

**Pass 3:** Light Accumulation
* `lightAccumulation.vert.glsl`, `lightAccumulation.frag.glsl`
* `FPR.pass.lightAccumulation`
* Input: `FPR.light.positionTexture`, `FPR.light.colorRadiusTexture`,`FPR.pass.lightCulling.tileLighitTexture`, `FPR.pass.depthPrepass.depthTexture` (Optional) 
* Output: Renders directly to the screen as a normal fragment shader does
* The different from a naive forward fragment shader is that we know which lights are visible for current tile
* loop through each light, if it is visible, get their info stored in the `u_lightPositionTexture`, `u_lightColorRadiusTexture`
  and perform blinn phong.

There are also some debug passes and pipelines to help you. 

* `FPR.pass.lightDebug` debug view: draw light in the scene as point to show their position. It can be appended at the end of every pipeline. 
* `FPR.pass.tileLightDebug` debug view: draw a full quad, showing how many lights are there in each tile with color scales.

#### Debugging

If there is a WebGL error, it will be displayed on the developer console and
the renderer will be aborted. To find out where the error came from, look at
the backtrace of the error (you may need to click the triangle to expand the
message). The line right below `wrapper @ webgl-debug.js` will point to the
WebGL call that failed.

When working in the early pipeline (before you have a lit render), 
Test step by step. Make sure you read the light position / color radius texture correctly. 
`lightDebug` pass and `tileLightDebug` can help you confirm you do read them correctly. 
Also you can try unbind the Frame buffer for lightCulling stage to render on the screen to 
things how's it going. 



## Resources

* [1] Bloom:
  [GPU Gems, Ch. 21](http://http.developer.nvidia.com/GPUGems/gpugems_ch21.html)
* [2] Post-Process Motion Blur:
  [GPU Gems 3, Ch. 27](http://http.developer.nvidia.com/GPUGems3/gpugems3_ch27.html) 
* [3] View Frustum Box Culling related:
  - http://www.txutxi.com/?p=487
  - http://www.txutxi.com/?p=584
  - http://www.iquilezles.org/www/articles/frustumcorrect/frustumcorrect.htm
* [4] Deferred VS Forward+: 
  - http://www.3dgep.com/forward-plus/
* [5] GDC 2015
  [Advancements in Tiled-Based Compute Rendering](http://twvideo01.ubm-us.net/o1/vault/gdc2015/presentations/Thomas_Gareth_Advancements_in_Tile-Based.pdf)

**Also see:** The articles linked in the course schedule.

### Profiling and debugging tools

Built into Chrome:
* JavaScript debugger and profiler

Plug-ins:
* Web Tracing Framework
  **Does not currently work with multiple render targets**,
  which are used in the starter code.
* (Chrome) [Shader Editor](https://chrome.google.com/webstore/detail/shader-editor/ggeaidddejpbakgafapihjbgdlbbbpob)

Libraries:
* Stats.js (already included)


## README

Replace the contents of this README.md in a clear manner with the following:

* A brief description of the project and the specific features you implemented.
* At least one screenshot of your project running.
* A 30+ second video (or gifs) of your project running showing all features.
  (Even though your demo can be seen online, using multiple render targets
  means it won't run on many computers. A video will work everywhere.)
* A performance analysis 

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

Beware of any issues discussed on the Google Group.

Open a GitHub pull request so that we can see that you have finished.
The title should be "Project 5A: YOUR NAME".
The template of the comment section of your pull request is attached below, you can do some copy and paste:  

* [Repo Link](https://link-to-your-repo)
* `Your PENNKEY`
* (Briefly) Mentions features that you've completed. Especially those bells and whistles you want to highlight
    * Feature 0
    * Feature 1
    * ...
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
