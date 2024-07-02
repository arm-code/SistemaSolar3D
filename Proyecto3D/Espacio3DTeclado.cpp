//#include "stdafx.h"
//#include <windows.h>
#include <GL/glut.h>
#include <cstdlib>
#include <string>

struct Color {
    float r;
    float g;
    float b;
};

Color codificarColor(const std::string& hexValue);

void dibujarLuna();
void dibujarTierra();
void dibujarPlanetas();
void dibujarSol();
void dibujarOrbita(float radio);

float angle = 0.0;
float translateX = 0.0;
float translateY = 0.0;
float zoom = 1.0;

float angleX = 0.0;
float angleY = 0.0;
float angleZ = 0.0;

void display_cb(void) {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    glLoadIdentity();
    glTranslatef(translateX, translateY, 0.0);
    glScalef(zoom, zoom, zoom);

    // Aplicar rotaciones
    glRotatef(angleX, 1.0, 0.0, 0.0);
    glRotatef(angleY, 0.0, 1.0, 0.0);
    glRotatef(angleZ, 0.0, 0.0, 1.0);

    glBegin(GL_LINES);

    // Ejes y cuadrícula
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

    glColor3f(0.3, 0.3, 0.3); // Color gris para la cuadrícula
    for (int i = -1000; i <= 1000; i += 10) {
        glVertex3i(i, 0, -1000);
        glVertex3i(i, 0, 1000);
        glVertex3i(-1000, 0, i);
        glVertex3i(1000, 0, i);
    }

    glEnd();

    dibujarSol();
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
    case GLUT_KEY_LEFT: translateX += 10.0; break;
    case GLUT_KEY_RIGHT: translateX -= 10.0; break;
    case GLUT_KEY_UP: translateY += 10.0; break;
    case GLUT_KEY_DOWN: translateY -= 10.0; break;
    default: break;
    }
    glutPostRedisplay();
}

void inicializacion(void) {
    glClearColor(0.0, 0.0, 0.0, 0.0);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    glOrtho(-1000.0, 1000.0, -1000.0, 1000.0, -1000.0, 1000.0);
    glMatrixMode(GL_MODELVIEW);
    glEnable(GL_DEPTH_TEST);
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
    glPopMatrix();
}

void dibujarSol() {
    glPushMatrix();
    glColor3f(1.0, 1.0, 0.0);
    glutSolidSphere(10.0, 50, 50);
    glPopMatrix();
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
