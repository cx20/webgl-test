// File : main.cpp
// Compile : emcc main.cpp -std=c++11 -s WASM=1 -s USE_GLFW=3 -O3 -o index.js

#include <functional>
#include <emscripten.h>
#include <emscripten/html5.h>

#define GLFW_INCLUDE_ES2
#include <GLFW/glfw3.h>

// Shader sources
const GLchar* vertexSource =
    "attribute vec3 position;                     \n"
    "attribute vec4 color;                        \n"
    "varying   vec4 vColor;                       \n"
    "void main()                                  \n"
    "{                                            \n"
    "  vColor = color;                            \n"
    "  gl_Position = vec4(position, 1.0);         \n"
    "}                                            \n";
const GLchar* fragmentSource =
    "precision mediump float;\n"
    "varying   vec4 vColor;                       \n"
    "void main()                                  \n"
    "{                                            \n"
    "  gl_FragColor = vColor;                     \n"
    "}                                            \n";

std::function<void()> loop;
void main_loop() { loop(); }

int main()
{
    int w, h;
    emscripten_get_canvas_element_size("#canvas", &w, &h);


    if (!glfwInit()) {
      emscripten_force_exit(EXIT_FAILURE);
    }

    GLFWwindow *window;
    window = glfwCreateWindow(w, h, "Hello, WASM World!", NULL, NULL);

    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 2);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 0);

    // Create a Vertex Buffer Object and copy the vertex data to it
    GLuint vbo[2];
    glGenBuffers(2, vbo);

    // Square data
    //             1.0 y 
    //              ^  -1.0 
    //              | / z
    //              |/       x
    // -1.0 -----------------> +1.0
    //            / |
    //      +1.0 /  |
    //           -1.0
    // 
    //        [0]------[1]
    //         |        |
    //         |        |
    //         |        |
    //        [2]------[3]
    //
    GLfloat vertices[] = { 
        -0.5f, 0.5f, 0.0f, // v0
         0.5f, 0.5f, 0.0f, // v1 
        -0.5f,-0.5f, 0.0f, // v2
         0.5f,-0.5f, 0.0f  // v3
    };
    
    GLfloat colors[] = { 
         1.0f, 0.0f, 0.0f, 1.0f, // v0
         0.0f, 1.0f, 0.0f, 1.0f, // v1
         0.0f, 0.0f, 1.0f, 1.0f, // v2
         1.0f, 1.0f, 0.0f, 1.0f  // v3
    };

    glBindBuffer(GL_ARRAY_BUFFER, vbo[0]);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    glBindBuffer(GL_ARRAY_BUFFER, vbo[1]);
    glBufferData(GL_ARRAY_BUFFER, sizeof(colors), colors, GL_STATIC_DRAW);

    // Create and compile the vertex shader
    GLuint vertexShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertexShader, 1, &vertexSource, nullptr);
    glCompileShader(vertexShader);

    // Create and compile the fragment shader
    GLuint fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragmentShader, 1, &fragmentSource, nullptr);
    glCompileShader(fragmentShader);

    // Link the vertex and fragment shader into a shader program
    GLuint shaderProgram = glCreateProgram();
    glAttachShader(shaderProgram, vertexShader);
    glAttachShader(shaderProgram, fragmentShader);
    glLinkProgram(shaderProgram);
    glUseProgram(shaderProgram);

    // Specify the layout of the vertex data
    GLint posAttrib = glGetAttribLocation(shaderProgram, "position");
    glEnableVertexAttribArray(posAttrib);

    GLint colAttrib = glGetAttribLocation(shaderProgram, "color");
    glEnableVertexAttribArray(colAttrib);

    loop = [&]
    {
        glBindBuffer(GL_ARRAY_BUFFER, vbo[0]);
        glVertexAttribPointer(posAttrib, 3, GL_FLOAT, GL_FALSE, 0, 0);
        
        glBindBuffer(GL_ARRAY_BUFFER, vbo[1]);
        glVertexAttribPointer(colAttrib, 4, GL_FLOAT, GL_FALSE, 0, 0);

        glClear(GL_COLOR_BUFFER_BIT);

        // Draw a square from the 4 vertices
        glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);

        glfwSwapBuffers(window);
    };

    emscripten_set_main_loop(main_loop, 0, true);

    return EXIT_SUCCESS;
}
