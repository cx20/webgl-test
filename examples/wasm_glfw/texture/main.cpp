// File : main.cpp
// Compile : emcc main.cpp -std=c++11 -s WASM=1 -s USE_GLFW=3 -O3 -o index.js --preload-file frog.tga --use-preload-plugins

#include <stdio.h>
#include <stdlib.h>
#include <functional>
#include <math.h>
#include <emscripten.h>
#include <emscripten/html5.h>
#define GLFW_INCLUDE_ES2
#include <GLFW/glfw3.h>

#include "linmath.h"

// Shader sources
const GLchar* vertexSource =
    "attribute vec3 position;                     \n"
    "attribute vec2 textureCoord;                 \n"
    "uniform mat4 uPMatrix;                       \n"
    "uniform mat4 uMVMatrix;                      \n"
    "varying   vec2 vTextureCoord;                \n"
    "void main()                                  \n"
    "{                                            \n"
    "  vTextureCoord = textureCoord;              \n"
    "  gl_Position = uPMatrix * uMVMatrix * vec4(position, 1.0);         \n"
    "}                                            \n";
const GLchar* fragmentSource =
    "precision mediump float;\n"
    "uniform sampler2D texture;                   \n"
    "varying   vec2 vTextureCoord;                \n"
    "void main()                                  \n"
    "{                                            \n"
    "  // TODO: It is temporarily changed to BGR order according to the RGB order of the texture loaded by esLoadTGA(). \n"
    "  //gl_FragColor = texture2D(texture, vTextureCoord); \n"
    "  vec4 c = texture2D(texture, vTextureCoord); \n"
    "  gl_FragColor = vec4(c.bgr, 1.0);           \n"
    "}                                            \n";

///
// esLoadTGA()
//
//    Loads a 24-bit TGA image from a file. This is probably the simplest TGA loader ever.
//    Does not support loading of compressed TGAs nor TGAa with alpha channel. But for the
//    sake of the examples, this is sufficient.
//

char* esLoadTGA( char *fileName, int *width, int *height )
{
    char *buffer = NULL;
    FILE *f;
    unsigned char tgaheader[12];
    unsigned char attributes[6];
    unsigned int imagesize;

    f = fopen(fileName, "rb");
    if(f == NULL) return NULL;

    if(fread(&tgaheader, sizeof(tgaheader), 1, f) == 0)
    {
        fclose(f);
        return NULL;
    }

    if(fread(attributes, sizeof(attributes), 1, f) == 0)
    {
        fclose(f);
        return 0;
    }

    *width = attributes[1] * 256 + attributes[0];
    *height = attributes[3] * 256 + attributes[2];
    imagesize = attributes[4] / 8 * *width * *height;
    buffer = (char *)malloc(imagesize);
    if (buffer == NULL)
    {
        fclose(f);
        return 0;
    }

    if(fread(buffer, 1, imagesize, f) != imagesize)
    {
        free(buffer);
        return NULL;
    }
    fclose(f);
    return buffer;
}

static mat4x4 projection_matrix;
static mat4x4 model_view_matrix;

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
    
    GLfloat textureCoords[] = {
        // Front face
        0.0f, 0.0f,
        1.0f, 0.0f,
        1.0f, 1.0f,
        0.0f, 1.0f,

        // Back face
        1.0f, 0.0f,
        1.0f, 1.0f,
        0.0f, 1.0f,
        0.0f, 0.0f,

        // Top face
        0.0f, 1.0f,
        0.0f, 0.0f,
        1.0f, 0.0f,
        1.0f, 1.0f,

        // Bottom face
        1.0f, 1.0f,
        0.0f, 1.0f,
        0.0f, 0.0f,
        1.0f, 0.0f,

        // Right face
        1.0f, 0.0f,
        1.0f, 1.0f,
        0.0f, 1.0f,
        0.0f, 0.0f,

        // Left face
        0.0f, 0.0f,
        1.0f, 0.0f,
        1.0f, 1.0f,
        0.0f, 1.0f
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
    glBufferData(GL_ARRAY_BUFFER, sizeof(textureCoords), textureCoords, GL_STATIC_DRAW);

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

    GLint coordAttrib = glGetAttribLocation(shaderProgram, "textureCoord");
    glEnableVertexAttribArray(coordAttrib);
    
    int width = 256;
    int height = 256;
    char filename [] = "frog.tga";
    char* buffer = esLoadTGA(filename, &width, &height);
    GLuint textureID;
    glGenTextures(1, &textureID);
    glBindTexture(GL_TEXTURE_2D, textureID);
    //glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, buffer);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, buffer);
    glGenerateMipmap(GL_TEXTURE_2D);
    
    free ( buffer );

    GLint uPMatrix  = glGetUniformLocation(shaderProgram, "uPMatrix");
    GLint uMVMatrix = glGetUniformLocation(shaderProgram, "uMVMatrix");
    GLint texture   = glGetUniformLocation(shaderProgram, "texture");

    GLfloat rad = 0.0;

    loop = [&]
    {
        rad += M_PI * 1.0 / 180.0;
        
        mat4x4_perspective(projection_matrix, 45, (float)w / (float)h, 1, 100);
        mat4x4_identity(model_view_matrix);
        mat4x4_translate_in_place(model_view_matrix, 0.0, 0.0, -2.0);
        mat4x4_rotate(model_view_matrix, model_view_matrix, 1.0, 1.0, 1.0, rad);

        glUniformMatrix4fv(uPMatrix,  1, GL_FALSE, (const GLfloat*)projection_matrix);
        glUniformMatrix4fv(uMVMatrix, 1, GL_FALSE, (const GLfloat*)model_view_matrix);

        glBindBuffer(GL_ARRAY_BUFFER, vbo[0]);
        glVertexAttribPointer(posAttrib, 3, GL_FLOAT, GL_FALSE, 0, 0);
        
        glBindBuffer(GL_ARRAY_BUFFER, vbo[1]);
        glVertexAttribPointer(coordAttrib, 2, GL_FLOAT, GL_FALSE, 0, 0);

        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ibo);

        //glClear(GL_COLOR_BUFFER_BIT);

        // Draw a cube from the 36 vertices
        glDrawElements(GL_TRIANGLES, 36, GL_UNSIGNED_INT, 0);

        glfwSwapBuffers(window);
    };

    emscripten_set_main_loop(main_loop, 0, true);

    return EXIT_SUCCESS;
}
