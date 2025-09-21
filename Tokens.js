export class Token {
    constructor(lexema, tipo, linea, columna) {
        this.lexema = lexema;
        this.tipo = tipo;
        this.linea = linea;
        this.columna = columna;
    }
}

// Palabras reservadas actualizadas
export const PALABRAS_RESERVADAS = [
    "TORNEO", "EQUIPOS", "ELIMINACION", "equipo", "jugador", 
    "partido", "resultado", "goleador", "vs", "goleadores"
];
export const FASES_TORNEO = [
    "cuartos", "semifinal", "final"
];

// Atributos válidos actualizados
export const ATRIBUTOS_VALIDOS = [
    "nombre", "sede", "equipos", "posicion", "numero", 
    "edad", "minuto"
];

// Símbolos actualizados
export const TIPOS_SIMBOLOS = {
    "{": "Llave izquierda", 
    "}": "Llave derecha", 
    "[": "Corchete izquierdo",
    "]": "Corchete derecho",
    "(": "Paréntesis izquierdo",
    ")": "Paréntesis derecho",
    ":": "Dos puntos",
    ",": "Coma",
    ";": "Punto y coma",
    "-": "Guion"
};

// Posiciones válidas de jugadores
export const POSICIONES_VALIDAS = [
    "PORTERO", "DEFENSA", "MEDIOCAMPO", "DELANTERO"
];