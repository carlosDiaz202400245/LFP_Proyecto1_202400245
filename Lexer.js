import { PALABRAS_RESERVADAS, ATRIBUTOS_VALIDOS, Token, TIPOS_SIMBOLOS, POSICIONES_VALIDAS } from "./Tokens.js";

export class Lexer {
    constructor(texto) {
        this.texto = texto;
        this.posicion = 0;
        this.linea = 1;
        this.columna = 1;
        this.tokens = [];
        this.errores = [];
        this.estado = "INICIO";
        this.buffer = "";
        this.inicioCol = 1;
        this.inicioLinea = 1;
    }

    analizar() {
        while (this.posicion < this.texto.length) {
            let char = this.texto[this.posicion];
            
            switch (this.estado) {
                case "INICIO":
                    this.procesarEstadoInicio(char);
                    break;
                case "IDENT":
                    this.procesarEstadoIdent(char);
                    break;
                case "NUM":
                    this.procesarEstadoNum(char);
                    break;
                case "CADENA":
                    this.procesarEstadoCadena(char);
                    break;
                case "COMENTARIO_LINEA":
                    this.procesarComentarioLinea(char);
                    break;
                case "COMENTARIO_BLOQUE":
                    this.procesarComentarioBloque(char);
                    break;
            }
        }
        
        this.procesarBufferPendiente();
        return { tokens: this.tokens, errores: this.errores };
    }

    procesarEstadoInicio(char) {
        if (char === " " || char === "\t") {
            this.avanzar();
            return;
        }

        if (char === "\n") {
            this.linea++;
            this.columna = 0;
            this.avanzar();
            return;
        }

        if (char === "/" && this.texto[this.posicion + 1] === "/") {
            this.estado = "COMENTARIO_LINEA";
            this.avanzar();
            this.avanzar();
            return;
        }

        if (char === "/" && this.texto[this.posicion + 1] === "*") {
            this.estado = "COMENTARIO_BLOQUE";
            this.avanzar();
            this.avanzar();
            return;
        }

        if (this.esLetra(char)) {
            this.estado = "IDENT";
            this.buffer = char;
            this.inicioCol = this.columna;
            this.inicioLinea = this.linea;
            this.avanzar();
            return;
        }

        if (this.esDigito(char)) {
            this.estado = "NUM";
            this.buffer = char;
            this.inicioCol = this.columna;
            this.inicioLinea = this.linea;
            this.avanzar();
            return;
        }

        if (char === '"') {
            this.estado = "CADENA";
            this.buffer = "";
            this.inicioCol = this.columna;
            this.inicioLinea = this.linea;
            this.avanzar();
            return;
        }

        if (Object.keys(TIPOS_SIMBOLOS).includes(char)) {
            this.tokens.push(new Token(
                char,
                TIPOS_SIMBOLOS[char],
                this.linea,
                this.columna
            ));
            this.avanzar();
            return;
        }

        this.agregarError(char, "Token Inválido", "Carácter no reconocido");
        this.avanzar();
    }

    procesarEstadoIdent(char) {
        if (this.esLetra(char) || this.esDigito(char) || char === '_') {
            this.buffer += char;
            this.avanzar();
        } else {
            this.agregarTokenIdent(this.buffer, this.inicioCol);
            this.estado = "INICIO";
        }
    }

    procesarEstadoNum(char) {
        if (this.esDigito(char)) {
            this.buffer += char;
            this.avanzar();
        } else {
            this.tokens.push(new Token(
                this.buffer,
                "Número",
                this.linea,
                this.inicioCol
            ));
            this.estado = "INICIO";
        }
    }

    procesarEstadoCadena(char) {
        if (char === '"') {
            this.tokens.push(new Token(
                this.buffer,
                "Cadena",
                this.inicioLinea,
                this.inicioCol
            ));
            this.avanzar();
            this.estado = "INICIO";
        } else if (this.posicion >= this.texto.length - 1) {
            this.agregarError(this.buffer, "Token Inválido", "Cadena sin comilla de cierre", this.inicioCol);
            this.estado = "INICIO";
        } else {
            if (char === '\n') {
                this.linea++;
                this.columna = 0;
            }
            this.buffer += char;
            this.avanzar();
        }
    }

    procesarComentarioLinea(char) {
        if (char === '\n') {
            this.linea++;
            this.columna = 0;
            this.estado = "INICIO";
        }
        this.avanzar();
    }

    procesarComentarioBloque(char) {
        if (char === '*' && this.texto[this.posicion + 1] === '/') {
            this.avanzar(); // *
            this.avanzar(); // /
            this.estado = "INICIO";
        } else if (char === '\n') {
            this.linea++;
            this.columna = 0;
            this.avanzar();
        } else {
            this.avanzar();
        }
    }

    procesarBufferPendiente() {
        if (this.estado === "IDENT") {
            this.agregarTokenIdent(this.buffer, this.inicioCol);
        } else if (this.estado === "NUM") {
            this.tokens.push(new Token(
                this.buffer,
                "Número",
                this.inicioLinea,
                this.inicioCol
            ));
        } else if (this.estado === "CADENA") {
            this.agregarError(this.buffer, "Token Inválido", "Cadena sin comilla de cierre", this.inicioCol);
        }
    }

    agregarTokenIdent(lexema, inicioCol) {
        if (PALABRAS_RESERVADAS.includes(lexema)) {
            this.tokens.push(new Token(lexema, "Palabra reservada", this.inicioLinea, inicioCol));
        } else if (ATRIBUTOS_VALIDOS.includes(lexema)) {
            this.tokens.push(new Token(lexema, "Atributo", this.inicioLinea, inicioCol));
        } else if (POSICIONES_VALIDAS.includes(lexema)) {
            this.tokens.push(new Token(lexema, "Posición", this.inicioLinea, inicioCol));
        } else {
            this.tokens.push(new Token(lexema, "Identificador", this.inicioLinea, inicioCol));
        }
    }

    avanzar() {
        this.posicion++;
        this.columna++;
    }

    esLetra(c) {
        const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzñÑáéíóúüÁÉÍÓÚÜ";
        return letras.includes(c);
    }

    esDigito(c) {
        return c >= "0" && c <= "9";
    }

    agregarError(lexema, tipo, descripcion, col = this.columna) {
        this.errores.push({
            lexema: lexema,
            tipo: tipo,
            descripcion: descripcion,
            linea: this.linea,
            columna: col
        });
    }
}