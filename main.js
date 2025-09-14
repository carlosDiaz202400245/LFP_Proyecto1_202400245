
import { Lexer } from './Lexer.js';
import { ProcesadorTorneo } from './ProcesadorTorneo.js';

// 1. Analizar léxicamente
const lexer = new Lexer(codigoTorneo);
const { tokens, errores } = lexer.analizar();

// 2. Procesar semánticamente
const procesador = new ProcesadorTorneo(tokens);
const { torneo, errores: erroresSemanticos } = procesador.procesar();

// 3. Usar los datos para generar reportes
console.log("Datos del torneo:", torneo);