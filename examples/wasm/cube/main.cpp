// File : main.cpp
// Compile : emcc main.cpp -std=c++11 -s WASM=1 -s USE_SDL=2 -O3 -o index.js

#include <functional>
#include <math.h>
#include <emscripten.h>
#include <emscripten/html5.h>
#include <SDL.h>

#define GL_GLEXT_PROTOTYPES 1
#include <SDL_opengles2.h>

// Shader sources
const GLchar* vertexSource =
    "attribute vec3 position;                     \n"
    "attribute vec4 color;                        \n"
    "uniform mat4 matAxisX;                       \n"
    "uniform mat4 matAxisY;                       \n"
    "varying   vec4 vColor;                       \n"
    "void main()                                  \n"
    "{                                            \n"
    "  vColor = color;                            \n"
    "  gl_Position = matAxisX * matAxisY * vec4(position, 1.0);         \n"
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

    SDL_Window *window;
    //SDL_CreateWindowAndRenderer(640, 480, 0, &window, nullptr);
    SDL_CreateWindowAndRenderer(w, h, 0, &window, nullptr);

    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);
    SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
    SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 24);

    // Create a Vertex Buffer Object and copy the vertex data to it
    GLuint vbo[2];
    glGenBuffers(2, vbo);
    GLuint ibo;
    glGenBuffers(1, &ibo);

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
    GLfloat vertices[] = { 
        // Front face
        -0.5f, -0.5f,  0.5f, // v0
         0.5f, -0.5f,  0.5f, // v1
         0.5f,  0.5f,  0.5f, // v2
        -0.5f,  0.5f,  0.5f, // v3
        // Back face
        -0.5f, -0.5f, -0.5f, // v4
         0.5f, -0.5f, -0.5f, // v5
         0.5f,  0.5f, -0.5f, // v6
        -0.5f,  0.5f, -0.5f, // v7
        // Top face
         0.5f,  0.5f,  0.5f, // v2
        -0.5f,  0.5f,  0.5f, // v3
        -0.5f,  0.5f, -0.5f, // v7
         0.5f,  0.5f, -0.5f, // v6
        // Bottom face
        -0.5f, -0.5f,  0.5f, // v0
         0.5f, -0.5f,  0.5f, // v1
         0.5f, -0.5f, -0.5f, // v5
        -0.5f, -0.5f, -0.5f, // v4
         // Right face
         0.5f, -0.5f,  0.5f, // v1
         0.5f,  0.5f,  0.5f, // v2
         0.5f,  0.5f, -0.5f, // v6
         0.5f, -0.5f, -0.5f, // v5
         // Left face
        -0.5f, -0.5f,  0.5f, // v0
        -0.5f,  0.5f,  0.5f, // v3
        -0.5f,  0.5f, -0.5f, // v7
        -0.5f, -0.5f, -0.5f  // v4
    };
    
    GLfloat colors[] = { 
        1.0f, 0.0f, 0.0f, 1.0f, // Front face
        1.0f, 0.0f, 0.0f, 1.0f, // Front face
        1.0f, 0.0f, 0.0f, 1.0f, // Front face
        1.0f, 0.0f, 0.0f, 1.0f, // Front face
        1.0f, 1.0f, 0.0f, 1.0f, // Back face
        1.0f, 1.0f, 0.0f, 1.0f, // Back face
        1.0f, 1.0f, 0.0f, 1.0f, // Back face
        1.0f, 1.0f, 0.0f, 1.0f, // Back face
        0.0f, 1.0f, 0.0f, 1.0f, // Top face
        0.0f, 1.0f, 0.0f, 1.0f, // Top face
        0.0f, 1.0f, 0.0f, 1.0f, // Top face
        0.0f, 1.0f, 0.0f, 1.0f, // Top face
        1.0f, 0.5f, 0.5f, 1.0f, // Bottom face
        1.0f, 0.5f, 0.5f, 1.0f, // Bottom face
        1.0f, 0.5f, 0.5f, 1.0f, // Bottom face
        1.0f, 0.5f, 0.5f, 1.0f, // Bottom face
        1.0f, 0.0f, 1.0f, 1.0f, // Right face
        1.0f, 0.0f, 1.0f, 1.0f, // Right face
        1.0f, 0.0f, 1.0f, 1.0f, // Right face
        1.0f, 0.0f, 1.0f, 1.0f, // Right face
        0.0f, 0.0f, 1.0f, 1.0f, // Left face
        0.0f, 0.0f, 1.0f, 1.0f, // Left face
        0.0f, 0.0f, 1.0f, 1.0f, // Left face
        0.0f, 0.0f, 1.0f, 1.0f  // Left face
    };

    GLuint indices[] = { 
         0,  1,  2,    0,  2,  3,  // Front face
         4,  5,  6,    4,  6,  7,  // Back face
         8,  9, 10,    8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15,  // Bottom face
        16, 17, 18,   16, 18, 19,  // Right face
        20, 21, 22,   20, 22, 23   // Left face
    };

    glEnable(GL_DEPTH_TEST);
    
    glBindBuffer(GL_ARRAY_BUFFER, vbo[0]);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    glBindBuffer(GL_ARRAY_BUFFER, vbo[1]);
    glBufferData(GL_ARRAY_BUFFER, sizeof(colors), colors, GL_STATIC_DRAW);

    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ibo);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

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

    GLint uLocAxisX = glGetUniformLocation(shaderProgram, "matAxisX");
    GLint uLocAxisY = glGetUniformLocation(shaderProgram, "matAxisY");

    GLfloat matAxisX[] = {
        1.0f, 0.0f, 0.0f, 0.0f,
        0.0f, 1.0f, 0.0f, 0.0f,
        0.0f, 0.0f, 1.0f, 0.0f,
        0.0f, 0.0f, 0.0f, 1.0f
    };

    GLfloat matAxisY[] = {
        1.0f, 0.0f, 0.0f, 0.0f,
        0.0f, 1.0f, 0.0f, 0.0f,
        0.0f, 0.0f, 1.0f, 0.0f,
        0.0f, 0.0f, 0.0f, 1.0f
    };
    
    GLfloat rad = 0.0;

    loop = [&]
    {
        rad += M_PI * 1.0 / 180.0;

        GLfloat c = cos(rad);
        GLfloat s = sin(rad);

        matAxisX[5] = c;
        matAxisX[6] = -s;
        matAxisX[9] = s;
        matAxisX[10] = c;

        matAxisY[0] = c;
        matAxisY[2] = s;
        matAxisY[8] = -s;
        matAxisY[10] = c;

        glUniformMatrix4fv(uLocAxisX, 1, GL_FALSE, matAxisX);
        glUniformMatrix4fv(uLocAxisY, 1, GL_FALSE, matAxisY);

        glBindBuffer(GL_ARRAY_BUFFER, vbo[0]);
        glVertexAttribPointer(posAttrib, 3, GL_FLOAT, GL_FALSE, 0, 0);
        
        glBindBuffer(GL_ARRAY_BUFFER, vbo[1]);
        glVertexAttribPointer(colAttrib, 4, GL_FLOAT, GL_FALSE, 0, 0);

        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ibo);

        glClear(GL_COLOR_BUFFER_BIT);

        // Draw a cube from the 36 vertices
        glDrawElements(GL_TRIANGLES, 36, GL_UNSIGNED_INT, 0);

        SDL_GL_SwapWindow(window);
    };

    emscripten_set_main_loop(main_loop, 0, true);

    return EXIT_SUCCESS;
}
