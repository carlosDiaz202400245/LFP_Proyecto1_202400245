export class ProcesadorTorneo {
    constructor(tokens) {
        this.tokens = tokens;
        this.indice = 0;
        this.torneo = {
            nombre: "",
            sede: "",
            totalEquipos: 0,
            equipos: [],
            fases: []
        };
        this.erroresSemanticos = [];
    }

    procesar() {
        try {
            while (this.indice < this.tokens.length) {
                const token = this.tokens[this.indice];
                
                if (token.lexema === "TORNEO") {
                    this.procesarSeccionTorneo();
                } else if (token.lexema === "EQUIPOS") {
                    this.procesarSeccionEquipos();
                } else if (token.lexema === "ELIMINACION") {
                    this.procesarSeccionEliminacion();
                } else {
                    this.indice++;
                }
            }
            
            this.calcularEstadisticas();
            return {
                torneo: this.torneo,
                errores: this.erroresSemanticos
            };
            
        } catch (error) {
            this.erroresSemanticos.push({
                tipo: "Error de procesamiento",
                descripcion: error.message,
                linea: this.tokens[this.indice]?.linea || 0,
                columna: this.tokens[this.indice]?.columna || 0
            });
            return {
                torneo: this.torneo,
                errores: this.erroresSemanticos
            };
        }
    }

    procesarSeccionTorneo() {
        this.avanzar(); // TORNEO
        this.avanzar(); // {
        
        while (this.indice < this.tokens.length && this.tokens[this.indice].lexema !== "}") {
            const token = this.tokens[this.indice];
            
            if (token.tipo === "Atributo") {
                const atributo = token.lexema;
                this.avanzar(); // :
                
                const valorToken = this.tokens[this.indice];
                if (valorToken.tipo === "Cadena") {
                    if (atributo === "nombre") this.torneo.nombre = valorToken.lexema;
                    if (atributo === "sede") this.torneo.sede = valorToken.lexema;
                } else if (valorToken.tipo === "Número" && atributo === "equipos") {
                    this.torneo.totalEquipos = parseInt(valorToken.lexema);
                }
                
                this.avanzar(); // valor
                if (this.tokens[this.indice]?.lexema === ",") this.avanzar(); // ,
            } else {
                this.indice++;
            }
        }
        
        this.avanzar(); // }
        if (this.tokens[this.indice]?.lexema === ";") this.avanzar(); // ;
    }

    procesarSeccionEquipos() {
        this.avanzar(); // EQUIPOS
        this.avanzar(); // {
        
        while (this.indice < this.tokens.length && this.tokens[this.indice].lexema !== "}") {
            if (this.tokens[this.indice].lexema === "equipo") {
                this.procesarEquipo();
            } else {
                this.indice++;
            }
        }
        
        this.avanzar(); // }
        if (this.tokens[this.indice]?.lexema === ";") this.avanzar(); // ;
    }

    procesarEquipo() {
        this.avanzar(); // equipo
        this.avanzar(); // :
        
        const nombreEquipo = this.tokens[this.indice].lexema;
        this.avanzar(); // nombre equipo
        
        const equipo = {
            nombre: nombreEquipo,
            jugadores: []
        };
        
        if (this.tokens[this.indice]?.lexema === "[") {
            this.avanzar(); // [
            
            while (this.indice < this.tokens.length && this.tokens[this.indice].lexema !== "]") {
                if (this.tokens[this.indice].lexema === "jugador") {
                    this.procesarJugador(equipo);
                } else {
                    this.indice++;
                }
            }
            
            this.avanzar(); // ]
        }
        
        if (this.tokens[this.indice]?.lexema === ",") this.avanzar(); // ,
        if (this.tokens[this.indice]?.lexema === ";") this.avanzar(); // ;
        
        this.torneo.equipos.push(equipo);
    }

    procesarJugador(equipo) {
        this.avanzar(); // jugador
        this.avanzar(); // :
        
        const nombreJugador = this.tokens[this.indice].lexema;
        this.avanzar(); // nombre jugador
        
        const jugador = {
            nombre: nombreJugador,
            posicion: "",
            numero: 0,
            edad: 0,
            goles: 0,
            minutosGol: []
        };
        
        if (this.tokens[this.indice]?.lexema === "[") {
            this.avanzar(); // [
            
            while (this.indice < this.tokens.length && this.tokens[this.indice].lexema !== "]") {
                const token = this.tokens[this.indice];
                
                if (token.tipo === "Atributo") {
                    const atributo = token.lexema;
                    this.avanzar(); // :
                    
                    const valorToken = this.tokens[this.indice];
                    if (atributo === "posicion" && valorToken.tipo === "Cadena") {
                        jugador.posicion = valorToken.lexema;
                    } else if (atributo === "numero" && valorToken.tipo === "Número") {
                        jugador.numero = parseInt(valorToken.lexema);
                    } else if (atributo === "edad" && valorToken.tipo === "Número") {
                        jugador.edad = parseInt(valorToken.lexema);
                    }
                    
                    this.avanzar(); // valor
                    if (this.tokens[this.indice]?.lexema === ",") this.avanzar(); // ,
                } else {
                    this.indice++;
                }
            }
            
            this.avanzar(); // ]
        }
        
        if (this.tokens[this.indice]?.lexema === ",") this.avanzar(); // ,
        if (this.tokens[this.indice]?.lexema === ";") this.avanzar(); // ;
        
        equipo.jugadores.push(jugador);
    }

    procesarSeccionEliminacion() {
        this.avanzar(); // ELIMINACION
        this.avanzar(); // {
        
        while (this.indice < this.tokens.length && this.tokens[this.indice].lexema !== "}") {
            const token = this.tokens[this.indice];
            
            if (token.tipo === "Palabra reservada" && ["cuartos", "semifinal", "final"].includes(token.lexema)) {
                this.procesarFase(token.lexema);
            } else {
                this.indice++;
            }
        }
        
        this.avanzar(); // }
        if (this.tokens[this.indice]?.lexema === ";") this.avanzar(); // ;
    }

    procesarFase(nombreFase) {
        this.avanzar(); // nombre fase
        this.avanzar(); // :
        
        if (this.tokens[this.indice]?.lexema === "[") {
            this.avanzar(); // [
            
            const fase = {
                nombre: nombreFase,
                partidos: []
            };
            
            while (this.indice < this.tokens.length && this.tokens[this.indice].lexema !== "]") {
                if (this.tokens[this.indice].lexema === "partido") {
                    this.procesarPartido(fase);
                } else {
                    this.indice++;
                }
            }
            
            this.avanzar(); // ]
            if (this.tokens[this.indice]?.lexema === ",") this.avanzar(); // ,
            if (this.tokens[this.indice]?.lexema === ";") this.avanzar(); // ;
            
            this.torneo.fases.push(fase);
        }
    }

    procesarPartido(fase) {
        this.avanzar(); // partido
        this.avanzar(); // :
        
        const equipo1 = this.tokens[this.indice].lexema;
        this.avanzar(); // equipo1
        
        if (this.tokens[this.indice]?.lexema === "vs") {
            this.avanzar(); // vs
        }
        
        const equipo2 = this.tokens[this.indice].lexema;
        this.avanzar(); // equipo2
        
        const partido = {
            equipoLocal: equipo1,
            equipoVisitante: equipo2,
            resultado: "",
            golesLocal: 0,
            golesVisitante: 0,
            ganador: "",
            goleadores: []
        };
        
        if (this.tokens[this.indice]?.lexema === "[") {
            this.avanzar(); // [
            
            while (this.indice < this.tokens.length && this.tokens[this.indice].lexema !== "]") {
                const token = this.tokens[this.indice];
                
                if (token.lexema === "resultado") {
                    this.avanzar(); // resultado
                    this.avanzar(); // :
                    
                    const resultadoToken = this.tokens[this.indice];
                    if (resultadoToken.tipo === "Cadena") {
                        partido.resultado = resultadoToken.lexema;
                        const [golesLocal, golesVisitante] = resultadoToken.lexema.split("-").map(Number);
                        partido.golesLocal = golesLocal;
                        partido.golesVisitante = golesVisitante;
                        partido.ganador = golesLocal > golesVisitante ? equipo1 : 
                                         golesVisitante > golesLocal ? equipo2 : "Empate";
                    }
                    this.avanzar(); // valor
                    
                } else if (token.lexema === "goleadores") {
                    this.avanzar(); // goleadores
                    this.avanzar(); // :
                    
                    if (this.tokens[this.indice]?.lexema === "[") {
                        this.avanzar(); // [
                        
                        while (this.indice < this.tokens.length && this.tokens[this.indice].lexema !== "]") {
                            if (this.tokens[this.indice].lexema === "goleador") {
                                this.procesarGoleador(partido);
                            } else {
                                this.indice++;
                            }
                        }
                        
                        this.avanzar(); // ]
                    }
                } else {
                    this.indice++;
                }
                
                if (this.tokens[this.indice]?.lexema === ",") this.avanzar(); // ,
            }
            
            this.avanzar(); // ]
        }
        
        if (this.tokens[this.indice]?.lexema === ",") this.avanzar(); // ,
        if (this.tokens[this.indice]?.lexema === ";") this.avanzar(); // ;
        
        fase.partidos.push(partido);
    }

    procesarGoleador(partido) {
        this.avanzar(); // goleador
        this.avanzar(); // :
        
        const nombreGoleador = this.tokens[this.indice].lexema;
        this.avanzar(); // nombre goleador
        
        const goleador = {
            jugador: nombreGoleador,
            minuto: 0
        };
        
        if (this.tokens[this.indice]?.lexema === "[") {
            this.avanzar(); // [
            
            while (this.indice < this.tokens.length && this.tokens[this.indice].lexema !== "]") {
                const token = this.tokens[this.indice];
                
                if (token.lexema === "minuto") {
                    this.avanzar(); // minuto
                    this.avanzar(); // :
                    
                    const minutoToken = this.tokens[this.indice];
                    if (minutoToken.tipo === "Número") {
                        goleador.minuto = parseInt(minutoToken.lexema);
                    }
                    this.avanzar(); // valor
                } else {
                    this.indice++;
                }
                
                if (this.tokens[this.indice]?.lexema === ",") this.avanzar(); // ,
            }
            
            this.avanzar(); // ]
        }
        
        partido.goleadores.push(goleador);
        
        // Actualizar estadísticas del jugador
        this.actualizarEstadisticasJugador(nombreGoleador, goleador.minuto);
        
        if (this.tokens[this.indice]?.lexema === ",") this.avanzar(); // ,
    }

    actualizarEstadisticasJugador(nombreJugador, minuto) {
        for (const equipo of this.torneo.equipos) {
            for (const jugador of equipo.jugadores) {
                if (jugador.nombre === nombreJugador) {
                    jugador.goles++;
                    jugador.minutosGol.push(minuto);
                    return;
                }
            }
        }
    }

    calcularEstadisticas() {
        // Calcular estadísticas de equipos
        for (const equipo of this.torneo.equipos) {
            equipo.partidosJugados = 0;
            equipo.ganados = 0;
            equipo.perdidos = 0;
            equipo.golesFavor = 0;
            equipo.golesContra = 0;
            equipo.diferencia = 0;
            equipo.faseAlcanzada = "No participó";
            
            // Calcular edad promedio del equipo
            if (equipo.jugadores.length > 0) {
                equipo.edadPromedio = equipo.jugadores.reduce((sum, j) => sum + j.edad, 0) / equipo.jugadores.length;
            }
        }
        
        // Procesar partidos para calcular estadísticas
        for (const fase of this.torneo.fases) {
            for (const partido of fase.partidos) {
                const equipoLocal = this.torneo.equipos.find(e => e.nombre === partido.equipoLocal);
                const equipoVisitante = this.torneo.equipos.find(e => e.nombre === partido.equipoVisitante);
                
                if (equipoLocal && equipoVisitante) {
                    // Actualizar estadísticas de equipos
                    this.actualizarEstadisticasEquipo(equipoLocal, partido.golesLocal, partido.golesVisitante, fase.nombre);
                    this.actualizarEstadisticasEquipo(equipoVisitante, partido.golesVisitante, partido.golesLocal, fase.nombre);
                }
            }
        }
        
        // Ordenar equipos por puntos (para tabla de posiciones)
        this.torneo.equipos.sort((a, b) => {
            const puntosA = (a.ganados * 3) + (a.empatados || 0);
            const puntosB = (b.ganados * 3) + (b.empatados || 0);
            return puntosB - puntosA || (b.diferencia - a.diferencia);
        });
        
        // Calcular estadísticas generales del torneo
        this.calcularEstadisticasGenerales();
    }

    actualizarEstadisticasEquipo(equipo, golesFavor, golesContra, fase) {
        equipo.partidosJugados++;
        equipo.golesFavor += golesFavor;
        equipo.golesContra += golesContra;
        equipo.diferencia = equipo.golesFavor - equipo.golesContra;
        
        if (golesFavor > golesContra) {
            equipo.ganados++;
        } else if (golesFavor < golesContra) {
            equipo.perdidos++;
        } else {
            equipo.empatados = (equipo.empatados || 0) + 1;
        }
        
        // Actualizar fase alcanzada
        const fasesOrden = ["cuartos", "semifinal", "final"];
        const faseIndex = fasesOrden.indexOf(fase);
        const equipoFaseIndex = fasesOrden.indexOf(equipo.faseAlcanzada);
        
        if (faseIndex > equipoFaseIndex) {
            equipo.faseAlcanzada = fase;
        }
    }

    calcularEstadisticasGenerales() {
        // Total de goles
        this.torneo.totalGoles = this.torneo.equipos.reduce((sum, e) => sum + e.golesFavor, 0);
        
        // Total de partidos
        this.torneo.totalPartidos = this.torneo.fases.reduce((sum, f) => sum + f.partidos.length, 0);
        
        // Partidos completados (tienen resultado)
        this.torneo.partidosCompletados = 0;
        for (const fase of this.torneo.fases) {
            for (const partido of fase.partidos) {
                if (partido.resultado) this.torneo.partidosCompletados++;
            }
        }
        
        // Promedio de goles por partido
        this.torneo.promedioGoles = this.torneo.partidosCompletados > 0 ? 
            (this.torneo.totalGoles / this.torneo.partidosCompletados).toFixed(2) : 0;
        
        // Edad promedio de todos los jugadores
        const todosJugadores = this.torneo.equipos.flatMap(e => e.jugadores);
        this.torneo.edadPromedioGeneral = todosJugadores.length > 0 ? 
            (todosJugadores.reduce((sum, j) => sum + j.edad, 0) / todosJugadores.length).toFixed(2) : 0;
        
        // Fase actual
        const fasesConPartidos = this.torneo.fases.filter(f => f.partidos.length > 0);
        this.torneo.faseActual = fasesConPartidos.length > 0 ? 
            fasesConPartidos[fasesConPartidos.length - 1].nombre : "No iniciado";
    }

    avanzar() {
        this.indice++;
    }
}