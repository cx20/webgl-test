// forked from https://github.com/niba1122/rust-wasm-webgl-mdn-tutorial
mod utils;

use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{WebGlRenderingContext, WebGlShader, WebGlBuffer, WebGlProgram, WebGlUniformLocation};
use std::rc::{Rc};
use std::cell::{RefCell};

extern crate nalgebra_glm as glm;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn error(s: &str);
}

static FRAGMENT_SHADER: &'static str = r#"
    precision mediump float;
    varying   vec4 vColor;

    void main() {
        gl_FragColor = vColor;
    }
"#;

static VERTEX_SHADER: &'static str = r#"
    attribute vec3 position;
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    attribute vec4 color;
    varying   vec4 vColor;
    void main() {
        vColor = color;
            gl_Position = uPMatrix * uMVMatrix * vec4(position, 1.0);
    }
"#;

#[wasm_bindgen]
pub fn start() -> Result<(), JsValue> {
    let gl = get_webgl_context_by_id("canvas");

    let shader_program = init_shaders(&gl);

    let (
        position_buffer,
        color_buffer,
        index_buffer
    ) = init_buffers(&gl);
    let vertex_position = gl.get_attrib_location(&shader_program, "position") as u32;
    let vertex_color = gl.get_attrib_location(&shader_program, "color") as u32;
    let program_projection_matrix = gl.get_uniform_location(&shader_program, "uPMatrix").unwrap();
    let program_model_view_matrix = gl.get_uniform_location(&shader_program, "uMVMatrix").unwrap();

    let start_time = get_current_time();

    {
        let f = Rc::new(RefCell::new(None));
        let g = f.clone();
        *g.borrow_mut() = Some(Closure::wrap(Box::new(move || {
            draw_scene(
                &gl,
                &shader_program,
                vertex_position,
                vertex_color,
                &program_projection_matrix,
                &program_model_view_matrix,
                &position_buffer,
                &color_buffer,
                &index_buffer,
                start_time,
                get_current_time()
            );

            request_animation_frame(f.borrow().as_ref().unwrap());
        }) as Box<dyn FnMut()>));

        request_animation_frame(g.borrow().as_ref().unwrap());
    }

    Ok(())
}

fn get_webgl_context_by_id(id: &str) -> WebGlRenderingContext {
    let document = web_sys::window()
        .unwrap()
        .document()
        .unwrap();

    let canvas = document
        .get_element_by_id(id)
        .unwrap()
        .dyn_into::<web_sys::HtmlCanvasElement>()
        .unwrap();

    let gl = canvas
        .get_context("webgl")
        .unwrap()
        .unwrap()
        .dyn_into::<WebGlRenderingContext>()
        .unwrap();

    gl.viewport(0, 0, canvas.width() as i32, canvas.height() as i32);

    gl
}

fn get_shader(gl: &WebGlRenderingContext, shader_type: u32, source: &str) -> WebGlShader {
    let shader = gl.create_shader(shader_type).unwrap();

    gl.shader_source(&shader, source);
    gl.compile_shader(&shader);
    let compile_is_succeeded = gl.get_shader_parameter(&shader, WebGlRenderingContext::COMPILE_STATUS).as_bool().unwrap();
    if !compile_is_succeeded {
        panic!("There was an error compiling the shader");
    }
    shader
}

fn init_shaders(gl: &WebGlRenderingContext) -> WebGlProgram {
    let fragment_shader = get_shader(&gl, WebGlRenderingContext::FRAGMENT_SHADER, FRAGMENT_SHADER);
    let vertex_shader = get_shader(&gl, WebGlRenderingContext::VERTEX_SHADER, VERTEX_SHADER);

    let shader_program = gl.create_program().unwrap();
    gl.attach_shader(&shader_program, &vertex_shader);
    gl.attach_shader(&shader_program, &fragment_shader);
    gl.link_program(&shader_program);

    let shader_is_created = gl.get_program_parameter(&shader_program, WebGlRenderingContext::LINK_STATUS).as_bool().unwrap();

    if !shader_is_created {
        let info = gl.get_program_info_log(&shader_program).unwrap();
        error(&format!("Unable to initialize shader program: {}", info));
    }

    gl.use_program(Some(&shader_program));

    let vertex_position_attribute = gl.get_attrib_location(&shader_program, "position");
    gl.enable_vertex_attrib_array(vertex_position_attribute as u32);

    let vertex_color_attribute = gl.get_attrib_location(&shader_program, "color");
    gl.enable_vertex_attrib_array(vertex_color_attribute as u32);

    shader_program
}

fn init_buffers(gl: &WebGlRenderingContext) -> (WebGlBuffer, WebGlBuffer, WebGlBuffer)  {
    // Cube data
    //             1.0 y 
    //              ^  -1.0 
    //              | / z
    //              |/       x
    // -1.0 -----------------> +1.0
    //            / |
    //      +1.0 /  |
    //           -1.0
    // 
    //         [7]------[6]
    //        / |      / |
    //      [3]------[2] |
    //       |  |     |  |
    //       | [4]----|-[5]
    //       |/       |/
    //      [0]------[1]
    //
    let positions = [ 
        // Front face
        -0.5, -0.5,  0.5, // v0
         0.5, -0.5,  0.5, // v1
         0.5,  0.5,  0.5, // v2
        -0.5,  0.5,  0.5, // v3
        // Back face
        -0.5, -0.5, -0.5, // v4
         0.5, -0.5, -0.5, // v5
         0.5,  0.5, -0.5, // v6
        -0.5,  0.5, -0.5, // v7
        // Top face
         0.5,  0.5,  0.5, // v2
        -0.5,  0.5,  0.5, // v3
        -0.5,  0.5, -0.5, // v7
         0.5,  0.5, -0.5, // v6
        // Bottom face
        -0.5, -0.5,  0.5, // v0
         0.5, -0.5,  0.5, // v1
         0.5, -0.5, -0.5, // v5
        -0.5, -0.5, -0.5, // v4
         // Right face
         0.5, -0.5,  0.5, // v1
         0.5,  0.5,  0.5, // v2
         0.5,  0.5, -0.5, // v6
         0.5, -0.5, -0.5, // v5
         // Left face
        -0.5, -0.5,  0.5, // v0
        -0.5,  0.5,  0.5, // v3
        -0.5,  0.5, -0.5, // v7
        -0.5, -0.5, -0.5  // v4
    ];
    
    let colors = [
        1.0, 0.0, 0.0, 1.0, // Front face
        1.0, 0.0, 0.0, 1.0, // Front face
        1.0, 0.0, 0.0, 1.0, // Front face
        1.0, 0.0, 0.0, 1.0, // Front face
        1.0, 1.0, 0.0, 1.0, // Back face
        1.0, 1.0, 0.0, 1.0, // Back face
        1.0, 1.0, 0.0, 1.0, // Back face
        1.0, 1.0, 0.0, 1.0, // Back face
        0.0, 1.0, 0.0, 1.0, // Top face
        0.0, 1.0, 0.0, 1.0, // Top face
        0.0, 1.0, 0.0, 1.0, // Top face
        0.0, 1.0, 0.0, 1.0, // Top face
        1.0, 0.5, 0.5, 1.0, // Bottom face
        1.0, 0.5, 0.5, 1.0, // Bottom face
        1.0, 0.5, 0.5, 1.0, // Bottom face
        1.0, 0.5, 0.5, 1.0, // Bottom face
        1.0, 0.0, 1.0, 1.0, // Right face
        1.0, 0.0, 1.0, 1.0, // Right face
        1.0, 0.0, 1.0, 1.0, // Right face
        1.0, 0.0, 1.0, 1.0, // Right face
        0.0, 0.0, 1.0, 1.0, // Left face
        0.0, 0.0, 1.0, 1.0, // Left face
        0.0, 0.0, 1.0, 1.0, // Left face
        0.0, 0.0, 1.0, 1.0  // Left face
    ];
    let indices = [
         0,  1,  2,    0,  2 , 3,  // Front face
         4,  5,  6,    4,  6 , 7,  // Back face
         8,  9, 10,    8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15,  // Bottom face
        16, 17, 18,   16, 18, 19,  // Right face
        20, 21, 22,   20, 22, 23   // Left face
    ];

    let position_buffer = gl.create_buffer().unwrap();
    gl.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(&position_buffer));
    unsafe {
        gl.buffer_data_with_array_buffer_view(
            WebGlRenderingContext::ARRAY_BUFFER,
            &js_sys::Float32Array::view(&positions),
            WebGlRenderingContext::STATIC_DRAW
        );
    }
  
    let color_buffer = gl.create_buffer().unwrap();
    gl.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(&color_buffer));
    unsafe {
        gl.buffer_data_with_array_buffer_view(
            WebGlRenderingContext::ARRAY_BUFFER,
            &js_sys::Float32Array::view(&colors),
            WebGlRenderingContext::STATIC_DRAW
        );
    }

    let index_buffer = gl.create_buffer().unwrap();
    gl.bind_buffer(WebGlRenderingContext::ELEMENT_ARRAY_BUFFER, Some(&index_buffer));
    unsafe {
        gl.buffer_data_with_array_buffer_view(
            WebGlRenderingContext::ELEMENT_ARRAY_BUFFER,
            &js_sys::Uint16Array::view(&indices),
            WebGlRenderingContext::STATIC_DRAW
        );
    }

    (position_buffer, color_buffer, index_buffer)
}

fn draw_scene(
    gl: &WebGlRenderingContext,
    shader_program: &WebGlProgram,
    vertex_position: u32,
    vertex_color: u32,
    program_projection_matrix: &WebGlUniformLocation,
    program_model_view_matrix: &WebGlUniformLocation,
    position_buffer: &WebGlBuffer,
    color_buffer: &WebGlBuffer,
    index_buffer: &WebGlBuffer,
    start_time: f64,
    current_time: f64
) {
    gl.enable(WebGlRenderingContext::DEPTH_TEST);
    gl.depth_func(WebGlRenderingContext::LEQUAL);
    gl.clear(WebGlRenderingContext::COLOR_BUFFER_BIT | WebGlRenderingContext::DEPTH_BUFFER_BIT);

    let canvas = gl.canvas().unwrap().dyn_into::<web_sys::HtmlCanvasElement>().unwrap();

    let field_of_view = 45.0 * std::f32::consts::PI / 180.0;
    let aspect = canvas.client_width() as f32 / canvas.client_height() as f32;
    let z_near = 0.1;
    let z_far = 100.0;

    let projection_matrix = glm::perspective(aspect, field_of_view, z_near, z_far);
    let vec_projection_matrix = projection_matrix.iter().map(|v| *v).collect::<Vec<_>>();

    let delta = (current_time - start_time) as f32;
    let model_view_matrix = glm::translate(&glm::Mat4::identity(), &glm::TVec3::new(-0.0, 0.0, -2.0));
    let model_view_matrix = glm::rotate(&model_view_matrix, delta, &glm::TVec3::new(0.0, 0.0, 1.0));
    let model_view_matrix = glm::rotate(&model_view_matrix, delta*0.7, &glm::TVec3::new(0.0, 1.0, 0.0));
    let vec_model_view_matrix = model_view_matrix.iter().map(|v| *v).collect::<Vec<_>>();

    {
        let num_components = 3;
        let data_type: u32 = WebGlRenderingContext::FLOAT;
        let normalize = false;
        let stride = 0;
        let offset = 0;
        gl.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(&position_buffer));
        gl.vertex_attrib_pointer_with_i32(
            vertex_position,
            num_components,
            data_type,
            normalize,
            stride,
            offset
        );
        gl.enable_vertex_attrib_array(vertex_position);
    }

    {
        let num_components = 4;
        let data_type: u32 = WebGlRenderingContext::FLOAT;
        let normalize = false;
        let stride = 0;
        let offset = 0;
        gl.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(&color_buffer));
        gl.vertex_attrib_pointer_with_i32(
            vertex_color,
            num_components,
            data_type,
            normalize,
            stride,
            offset
        );
        gl.enable_vertex_attrib_array(vertex_color);
    }

    {
        gl.bind_buffer(WebGlRenderingContext::ELEMENT_ARRAY_BUFFER, Some(&index_buffer))
    }

    gl.use_program(Some(&shader_program));

    gl.uniform_matrix4fv_with_f32_array(
        Some(program_projection_matrix),
        false,
        &vec_projection_matrix
    );

    gl.uniform_matrix4fv_with_f32_array(
        Some(program_model_view_matrix),
        false,
        &vec_model_view_matrix
    );

    let offset = 0;
    let vertex_count = 36;
    let data_type = WebGlRenderingContext::UNSIGNED_SHORT;
    gl.draw_elements_with_i32(WebGlRenderingContext::TRIANGLES, vertex_count, data_type, offset);

}

fn get_current_time() -> f64 { // sec
    js_sys::Date::now() / 1000.0
}

fn window() -> web_sys::Window {
    web_sys::window().expect("no global `window` exists")
}

fn request_animation_frame(f: &Closure<dyn FnMut()>) {
    window()
        .request_animation_frame(f.as_ref().unchecked_ref())
        .expect("should register `requestAnimationFrame` OK");
}

