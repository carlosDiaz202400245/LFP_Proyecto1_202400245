import { PALABRAS_RESERVADAS, ATRIBUTOS_VALIDOS, Token, TIPOS_SIMBOLOS, POSICIONES_VALIDAS,FASES_TORNEO } from "./Tokens.js";

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

    // ✅ Manejo de símbolos con detección de errores
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
    if (['{', '}', '[', ']', '(', ')', ':', ',', ';', '-', '='].includes(char)) {
        this.agregarError(char, "Símbolo inválido", "Símbolo no reconocido o mal formado");
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
        // ✅ Validar formato de la cadena antes de agregar el token
        this.validarFormatoCadena(this.buffer, this.inicioLinea, this.inicioCol);
        
        this.tokens.push(new Token(
            this.buffer,
            "Cadena",
            this.inicioLinea,
            this.inicioCol
        ));
        this.avanzar();
        this.estado = "INICIO";
    } else if (this.posicion >= this.texto.length - 1) {
        this.agregarError(this.buffer, "Formato incorrecto", "Cadena sin comilla de cierre", this.inicioCol);
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

   // En Lexer.js - mejora el método agregarTokenIdent
agregarTokenIdent(lexema, inicioCol) {
    const lexemaMinusculas = lexema.toLowerCase();
    
    const palabrasReservadasMinusculas = PALABRAS_RESERVADAS.map(p => p.toLowerCase());
    const atributosValidosMinusculas = ATRIBUTOS_VALIDOS.map(a => a.toLowerCase());
    const posicionesValidasMinusculas = POSICIONES_VALIDAS.map(p => p.toLowerCase());
    const fasesTorneoMinusculas = FASES_TORNEO.map(f => f.toLowerCase());

    console.log("🔍 Procesando lexema:", lexema, "-> Minúsculas:", lexemaMinusculas);

    // 1. Primero verificar palabras reservadas (ESTRUCTURA)
    if (palabrasReservadasMinusculas.includes(lexemaMinusculas)) {
        if (!PALABRAS_RESERVADAS.includes(lexema)) {
            this.agregarError(
                lexema, 
                "Token inválido", 
                `Palabra clave mal escrita. Debe ser: "${PALABRAS_RESERVADAS.find(p => p.toLowerCase() === lexemaMinusculas)}"`,
                inicioCol
            );
        }
        console.log("   ✅ Clasificado como Palabra reservada");
        this.tokens.push(new Token(lexema, "Palabra reservada", this.inicioLinea, inicioCol));
        
    } 
    // 2. Verificar fases del torneo (cuartos, semifinal, final)
    else if (fasesTorneoMinusculas.includes(lexemaMinusculas)) {
        if (!FASES_TORNEO.includes(lexema)) {
            this.agregarError(
                lexema, 
                "Token inválido", 
                `Fase mal escrita. Debe ser: "${FASES_TORNEO.find(f => f.toLowerCase() === lexemaMinusculas)}"`,
                inicioCol
            );
        }
        console.log("   ✅ Clasificado como Fase de torneo");
        this.tokens.push(new Token(lexema, "Fase", this.inicioLinea, inicioCol));
    }
    // 3. Verificar atributos (PROPIEDADES)
    else if (atributosValidosMinusculas.includes(lexemaMinusculas)) {
        if (!ATRIBUTOS_VALIDOS.includes(lexema)) {
            this.agregarError(
                lexema, 
                "Token inválido", 
                `Atributo mal escrito. Debe ser: "${ATRIBUTOS_VALIDOS.find(a => a.toLowerCase() === lexemaMinusculas)}"`,
                inicioCol
            );
        }
        console.log("   ✅ Clasificado como Atributo");
        this.tokens.push(new Token(lexema, "Atributo", this.inicioLinea, inicioCol));
        
    } 
    // 4. Verificar posiciones de jugadores
    else if (posicionesValidasMinusculas.includes(lexemaMinusculas)) {
        if (!POSICIONES_VALIDAS.includes(lexema)) {
            this.agregarError(
                lexema, 
                "Token inválido", 
                `Posición mal escrita. Debe ser: "${POSICIONES_VALIDAS.find(p => p.toLowerCase() === lexemaMinusculas)}"`,
                inicioCol
            );
        }
        console.log("   ✅ Clasificado como Posición");
        this.tokens.push(new Token(lexema, "Posición", this.inicioLinea, inicioCol));
        
    } 
    // 5. Identificador normal
    else {
        console.log("   ✅ Clasificado como Identificador");
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
    const error = {
        lexema: lexema,
        tipo: tipo,
        descripcion: descripcion,
        linea: this.linea,
        columna: col
    };
    
    console.log(` Error léxico: ${tipo} - ${descripcion} (${lexema}) en línea ${this.linea}:${col}`);
    this.errores.push(error);
}
validarFormatoCadena(cadena, linea, columna) {
    // Validar formato de resultado (ej: "3-1")
    if (cadena.includes('-') && !isNaN(cadena.split('-')[0]) && !isNaN(cadena.split('-')[1])) {
        const partes = cadena.split('-');
        if (partes.length !== 2) {
            this.agregarError(cadena, "Formato incorrecto", "Resultado de partido incompleto", columna);
        }
    }
    
    // Validar comillas mal cerradas
    if (cadena.includes('"') && cadena.split('"').length % 2 === 0) {
        this.agregarError(cadena, "Formato incorrecto", "Uso incorrecto de comillas", columna);
    }
}
}