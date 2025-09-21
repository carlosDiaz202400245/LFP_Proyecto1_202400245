
import { Lexer } from './Lexer.js';
import { ProcesadorTorneo } from './ProcesadorTorneo.js';


const lexer = new Lexer(codigoTorneo);
const { tokens, errores } = lexer.analizar();

const procesador = new ProcesadorTorneo(tokens);
const { torneo, errores: erroresSemanticos } = procesador.procesar();

console.log("Datos del torneo:", torneo);