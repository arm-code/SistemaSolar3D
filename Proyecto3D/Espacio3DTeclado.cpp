//#include "stdafx.h"
//#include <windows.h>
#include <GL/glut.h>
#include <cstdlib>
#include <string>

#include <iostream>
#include <fstream>
#include <stdexcept>

#ifdef __APPLE__
#  include <GLUT/glut.h>
#  include <OpenGL/glext.h>
#else
#  include <GL/glut.h>
#  include <GL/glext.h>
#endif

using namespace std;

struct Color {
    float r;
    float g;
    float b;
};

// Struct de archivo bitmap.
struct BitMapFile
{
    int sizeX;
    int sizeY;
    unsigned char* data;
};

Color codificarColor(const std::string& hexValue);

void dibujarLuna(float angleTierra);
void dibujarTierra();
void dibujarPlanetas();
void dibujarSol();
void dibujarSol2();
void dibujarOrbita(float radio);
void dibujarCuadricula();
void dibujarEjes();
void Luz();
void dibujarTexto(const char* texto, float x, float y, float z);

// Globals.
static unsigned int texture[1]; // �ndice de textura.

float angle = 0.0;
float translateX = 0.0;
float translateY = 0.0;
float zoom = 1.0;

float angleX = 0.0;
float angleY = 0.0;
float angleZ = 0.0;

float cameraX = 0.0;
float cameraY = 0.0;
float cameraZ = 1000.0;

// Rutina para leer un archivo bitmap.
// Funciona solo para archivos bmp sin comprimir de 24 bits.
BitMapFile* getBMPData(string filename)
{
    BitMapFile* bmp = new BitMapFile;
    unsigned int size, offset, headerSize;

    // Leer nombre de archivo de entrada.
    ifstream infile(filename.c_str(), ios::binary);
    if (!infile) {
        cerr << "Error al abrir el archivo BMP: " << filename << endl;
        exit(1);
    }

    // Obtener el punto de inicio de los datos de la imagen.
    infile.seekg(10);
    infile.read((char*)&offset, 4);

    // Obtener el tama�o del encabezado del bitmap.
    infile.read((char*)&headerSize, 4);

    // Obtener valores de ancho y alto en el encabezado del bitmap.
    infile.seekg(18);
    infile.read((char*)&bmp->sizeX, 4);
    infile.read((char*)&bmp->sizeY, 4);

    // Asignar buffer para la imagen.
    size = bmp->sizeX * bmp->sizeY * 3; // El tama�o debe ser tama�oX * tama�oY * 3 (para RGB)
    bmp->data = new unsigned char[size];

    // Leer datos del bitmap.
    infile.seekg(offset);
    infile.read((char*)bmp->data, size);

    // Revertir el color de bgr a rgb.
    int temp;
    for (int i = 0; i < size; i += 3)
    {
        temp = bmp->data[i];
        bmp->data[i] = bmp->data[i + 2];
        bmp->data[i + 2] = temp;
    }

    infile.close();
    return bmp;
}

// Cargar textura externa.
void loadExternalTextures()
{
    // Almacenamiento local para datos de imagen bmp.
    BitMapFile* image = getBMPData("sol.bmp");

    // Activar el �ndice de textura texture[0]. 
    glBindTexture(GL_TEXTURE_2D, texture[0]);

    // Establecer par�metros de textura para envolver.
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);

    // Establecer par�metros de textura para filtrar.
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

    // Especificar una imagen como la textura a enlazar con el �ndice de textura actualmente activo.
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, image->sizeX, image->sizeY, 0,
        GL_RGB, GL_UNSIGNED_BYTE, image->data);

    delete[] image->data;
    delete image;
}

void display_cb(void) {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    glLoadIdentity();    

    //glTranslatef(translateX, translateY, 0.0);
    //glScalef(zoom, zoom, zoom);

    gluLookAt(cameraX, cameraY, cameraZ / zoom,  // Posición de la cámara
        cameraX, cameraY, 0.0,            // Punto al que mira la cámara
        0.0, 1.0, 0.0);                   // Vector que define la dirección hacia arriba

    // Ponemos la luz al sol
    // Posición de la luz en la posición del sol
    GLfloat posicionLuz[] = { 1.0, 1.0, 1.0, 1.0 };  // Ajusta la posición según sea necesario
    glLightfv(GL_LIGHT0, GL_POSITION, posicionLuz);


    // Aplicar rotaciones
    glRotatef(angleX, 1.0, 0.0, 0.0);
    glRotatef(angleY, 0.0, 1.0, 0.0);
    glRotatef(angleZ, 0.0, 0.0, 1.0);   

   

    // Ejes
    dibujarEjes();
    //dibujarCuadricula();

    
    glEnd();

    dibujarSol2();

    //glEnd();

    dibujarPlanetas();
    
    
    glutSwapBuffers();
    
}

void teclado_cb(GLubyte key, GLint x, GLint y) {
    switch (key) {
    case 27: exit(1); break; // ESC para salir
    case 'x': angleX += 5.0; break;
    case 'X': angleX -= 5.0; break;
    case 'y': angleY += 5.0; break;
    case 'Y': angleY -= 5.0; break;
    case 'z': angleZ += 5.0; break;
    case 'Z': angleZ -= 5.0; break;
    case '+': zoom *= 1.1; break; // Zoom in
    case '-': zoom *= 0.9; break; // Zoom out
    default: break;
    }
    glutPostRedisplay();
}

void special_cb(int key, int x, int y) {
    switch (key) {
    case GLUT_KEY_LEFT: cameraX += 10.0; break;
    case GLUT_KEY_RIGHT: cameraX -= 10.0; break;
    case GLUT_KEY_UP: cameraY -= 10.0; break;
    case GLUT_KEY_DOWN: cameraY += 10.0; break;
    default: break;
    }
    glutPostRedisplay();
}

void inicializacion(void) {
    glClearColor(0.0, 0.0, 0.0, 0.0);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    //glOrtho(-1000.0, 1000.0, -1000.0, 1000.0, -1000.0, 1000.0);
    gluPerspective(45.0, 1.0, 0.1, 10000.0);
    glMatrixMode(GL_MODELVIEW);
    glEnable(GL_DEPTH_TEST);


    // Crear el array de �ndices de textura.
    glGenTextures(1, texture);

    // Cargar textura externa.
    loadExternalTextures();

    // Especificar c�mo los valores de textura se combinan con los valores de color de superficie actuales.
    glTexEnvf(GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_REPLACE);

    Luz();
}

void idle_cb() {
    angle += 0.05;
    glutPostRedisplay();
}

int main(int argc, char** argv) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(1000, 1000);
    glutCreateWindow("Sistema solar 3D");

    glutDisplayFunc(display_cb);
    glutKeyboardFunc(teclado_cb);
    glutSpecialFunc(special_cb);
    glutIdleFunc(idle_cb);

    inicializacion();
    glutMainLoop();

    return 0;
}

void dibujarTierra() {
    glPushMatrix();
    glColor3f(0.0, 0.0, 1.0);
    glutSolidSphere(1.2756, 50, 50);
    glPopMatrix();
}

void dibujarLuna(float angleTierra) {
    glPushMatrix();
    glRotatef(angleTierra, 0.0, 0.0, 1.0);
    glTranslatef(3.844, 0.0, 0.0); // Distancia promedio de la Luna a la Tierra en escala
    glColor3f(0.8, 0.8, 0.8);
    glutSolidSphere(0.2724, 50, 50);
    // Dibujar el nombre "Luna"
    dibujarTexto("Luna", 0.3, 0.3, 0.0);
    glPopMatrix();
}

void dibujarSol() {

    //GLfloat matAmbiente[] = { 1.0, 1.0, 1.0, 1.0 };  // Color ambiente (amarillo)
    //GLfloat matDifusa[] = { 1.0, 1.0, 1.0, 1.0 };    // Color difuso (amarillo)
    //GLfloat matEspecular[] = { 1.0, 1.0, 1.0, 1.0 }; // Color especular (blanco)
    //GLfloat brillo[] = { 25.0 };                     // Brillo

    //glMaterialfv(GL_FRONT, GL_AMBIENT, matAmbiente);
    //glMaterialfv(GL_FRONT, GL_DIFFUSE, matDifusa);
    //glMaterialfv(GL_FRONT, GL_SPECULAR, matEspecular);
    //glMaterialfv(GL_FRONT, GL_SHININESS, brillo);

    glPushMatrix();
    glColor3f(1.0, 1.0, 1.0);
    glutSolidSphere(10.0, 50, 50);
    glPopMatrix();
}

void dibujarSol2() {

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    //glLoadIdentity();
    glEnable(GL_TEXTURE_2D);

    // Activar la textura.
    glBindTexture(GL_TEXTURE_2D, texture[0]);

    // Dibujar una esfera texturizada.
    GLUquadric* quad;
    quad = gluNewQuadric();
    gluQuadricTexture(quad, GL_TRUE);
    gluSphere(quad, 10.0, 50, 50);
    //gluDeleteQuadric(quad);

    glDisable(GL_TEXTURE_2D); 
}

void dibujarPlanetas() {
    struct Planeta {
        const char* nombre;
        float distancia;
        float tamano;
        const std::string& color;
    };

    Planeta planetas[9] = {
        {"Mercurio", 57.9, 0.4879, "808080"},
        {"Venus", 108.2, 1.2104, "E6801A"},
        {"Tierra", 149.6, 1.2756, "007FFF"},
        {"Marte", 227.9, 0.6794, "8B2611"},
        {"Jupiter", 778.5, 14.2984, "FFB366"},
        {"Saturno", 1433.4, 12.1200, "808080"},
        {"Urano", 2872.5, 5.1118, "ADD8E6"},
        {"Neptuno", 4495.1, 4.9528, "014BA0"},
        {"Plutón", 5906.4, 0.237, "ADD8E6"}
    };

    for (int i = 0; i < 9; ++i) {
        dibujarOrbita(planetas[i].distancia / 5.0);
        glPushMatrix();
        glRotatef(angle, 0.0, 0.0, 1.0);
        glTranslatef(planetas[i].distancia / 5.0, 0.0, 0.0);
        Color color = codificarColor(planetas[i].color);
        glColor3f(color.r, color.g, color.b);
        glutSolidSphere(planetas[i].tamano / 5.0, 50, 50);
        dibujarTexto(planetas[i].nombre, planetas[i].tamano / 5.0, 0.0, 0.0);
        if (strcmp(planetas[i].nombre, "Tierra") == 0) {
            dibujarLuna(angle);
        }
        glPopMatrix();
    }
}

void dibujarOrbita(float radio) {
    int numSegments = 100;
    glBegin(GL_LINE_LOOP);
    glColor3f(0.5, 0.5, 0.5);
    for (int i = 0; i < numSegments; ++i) {
        float theta = 2.0f * 3.1415926f * float(i) / float(numSegments);
        float x = radio * cosf(theta);
        float y = radio * sinf(theta);
        glVertex3f(x, y, 0.0);
    }
    glEnd();
}

Color codificarColor(const std::string& hexValue) {
    unsigned int color = strtol(hexValue.c_str(), nullptr, 16);
    unsigned int valor_ingresado_1 = color >> 16;
    unsigned int valor_ingresado_2 = (color >> 8) & 0xFF;
    unsigned int valor_ingresado_3 = color & 0xFF;

    Color resultado;
    resultado.r = valor_ingresado_1 / 255.0f;
    resultado.g = valor_ingresado_2 / 255.0f;
    resultado.b = valor_ingresado_3 / 255.0f;

    return resultado;
}

void dibujarCuadricula() {
    glColor3f(0.3, 0.3, 0.3); // Color gris para la cuadrícula
    for (int i = -1000; i <= 1000; i += 10) {
        glVertex3i(i, 0, -1000);
        glVertex3i(i, 0, 1000);
        glVertex3i(-1000, 0, i);
        glVertex3i(1000, 0, i);
    }
}

void dibujarEjes() {
    glBegin(GL_LINES);
    glColor3f(1.0, 0.0, 1.0); // color rosa    
    glVertex3i(0, 0, -1000);
    glVertex3i(0, 0, 1000);

    glColor3f(1.0, 0.0, 0.0); // color rojo
    glVertex3i(-1000, 0, 0);
    glVertex3i(1000, 0, 0);

    glColor3f(0.0, 1.0, 0.0); // color verde
    glVertex3i(0, -1000, 0);
    glVertex3i(0, 1000, 0);

    glColor3f(0.0, 0.0, 1.0); // color azul
    glVertex3i(0, 0, -1000);
    glVertex3i(0, 0, 1000);
}

void Luz() {
    // Configuración de la luz
    GLfloat luzDifusa[] = { 1.0, 1.0, 1.0, 1.0 };  // Color difuso de la luz (blanco)
    GLfloat luzEspecular[] = { 1.0, 1.0, 1.0, 1.0 };  // Color especular de la luz (blanco)
    GLfloat posicionLuz[] = { 0.0, 0.0, 0.0, 1.0 };  // Posición de la luz (inicialmente en el origen)

    glLightfv(GL_LIGHT0, GL_DIFFUSE, luzDifusa);
    glLightfv(GL_LIGHT0, GL_SPECULAR, luzEspecular);
    glLightfv(GL_LIGHT0, GL_POSITION, posicionLuz);

    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
    glEnable(GL_COLOR_MATERIAL);  // Permite que los colores del material se definan mediante glColor
    glColorMaterial(GL_FRONT, GL_AMBIENT_AND_DIFFUSE);  // Afecta a los materiales ambiente y difuso

}

void dibujarTexto(const char* texto, float x, float y, float z) {
    glRasterPos3f(x, y, z);
    for (const char* c = texto; *c != '\0'; ++c) {
        glutBitmapCharacter(GLUT_BITMAP_HELVETICA_12, *c);
    }
}