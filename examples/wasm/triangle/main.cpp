// File : main.cpp
// Compile : emcc main.cpp -std=c++11 -s WASM=1 -s USE_SDL=2 -O3 -o index.js

#include <functional>

#include <emscripten.h>
#include <SDL.h>

#define GL_GLEXT_PROTOTYPES 1
#include <SDL_opengles2.h>

// Shader sources
const GLchar* vertexSource =
    "attribute vec3 position;                     \n"
    "void main()                                  \n"
    "{                                            \n"
    "  gl_Position = vec4(position, 1.0);         \n"
    "}                                            \n";
const GLchar* fragmentSource =
    "precision mediump float;\n"
    "void main()                                  \n"
    "{                                            \n"
    "  gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);   \n"
    "}                                            \n";

std::function<void()> loop;
void main_loop() { loop(); }

int main()
{
    SDL_Window *window;
    SDL_CreateWindowAndRenderer(640, 480, 0, &window, nullptr);

    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);
    SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
    SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 24);

    // Create a Vertex Buffer Object and copy the vertex data to it
    GLuint vbo;
    glGenBuffers(1, &vbo);

    GLfloat vertices[] = {0.0f,  0.5f, 0.0f, 
                          0.5f, -0.5f, 0.0f, 
                         -0.5f, -0.5f, 0.0f};

    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

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
    glVertexAttribPointer(posAttrib, 3, GL_FLOAT, GL_FALSE, 0, 0);

    loop = [&]
    {
        glBindBuffer(GL_ARRAY_BUFFER, vbo);
        glVertexAttribPointer(posAttrib, 3, GL_FLOAT, GL_FALSE, 0, 0);

        glClear(GL_COLOR_BUFFER_BIT);

        // Draw a triangle from the 3 vertices
        glDrawArrays(GL_TRIANGLES, 0, 3);

        SDL_GL_SwapWindow(window);
    };

    emscripten_set_main_loop(main_loop, 0, true);

    return EXIT_SUCCESS;
}
