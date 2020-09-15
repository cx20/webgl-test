// forked from https://github.com/niba1122/rust-wasm-webgl-mdn-tutorial
mod utils;

use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{WebGlRenderingContext, WebGlShader, WebGlBuffer, WebGlProgram};
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

    void main() {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    }
"#;

static VERTEX_SHADER: &'static str = r#"
    attribute vec3 position;

    void main() {
        gl_Position = vec4(position, 1.0);
    }
"#;

#[wasm_bindgen]
pub fn start() -> Result<(), JsValue> {
    let gl = get_webgl_context_by_id("canvas");

    let shader_program = init_shaders(&gl);

    let (
        position_buffer
    ) = init_buffers(&gl);
    let vertex_position = gl.get_attrib_location(&shader_program, "position") as u32;
    let start_time = get_current_time();

    {
        let f = Rc::new(RefCell::new(None));
        let g = f.clone();
        *g.borrow_mut() = Some(Closure::wrap(Box::new(move || {
            draw_scene(
                &gl,
                &shader_program,
                vertex_position,
                &position_buffer,
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

    shader_program
}

fn init_buffers(gl: &WebGlRenderingContext) -> WebGlBuffer {
    let vertices = [
         0.0, 0.5, 0.0, // v0
        -0.5,-0.5, 0.0, // v1
         0.5,-0.5, 0.0  // v2
    ];

    let position_buffer = gl.create_buffer().unwrap();
    gl.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(&position_buffer));
    unsafe {
        gl.buffer_data_with_array_buffer_view(
            WebGlRenderingContext::ARRAY_BUFFER,
            &js_sys::Float32Array::view(&vertices),
            WebGlRenderingContext::STATIC_DRAW
        );
    }
  

    position_buffer
}

fn draw_scene(
    gl: &WebGlRenderingContext,
    shader_program: &WebGlProgram,
    vertex_position: u32,
    position_buffer: &WebGlBuffer,
    start_time: f64,
    current_time: f64
) {
    let canvas = gl.canvas().unwrap().dyn_into::<web_sys::HtmlCanvasElement>().unwrap();

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

    gl.use_program(Some(&shader_program));

    let vertex_count = 3;
    gl.draw_arrays(WebGlRenderingContext::TRIANGLES, 0, vertex_count);

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

