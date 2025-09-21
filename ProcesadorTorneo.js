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

    // En ProcesadorTorneo.js
    procesar() {
        console.log("🔄 INICIANDO PROCESAMIENTO COMPLETO");

        try {
            while (this.indice < this.tokens.length) {
                const token = this.tokens[this.indice];
                console.log("🔍 Token en procesar():", token.lexema, "| Tipo:", token.tipo, "| Índice:", this.indice);

                if (token.lexema === "TORNEO" && token.tipo === "Palabra reservada") {
                    console.log("🎯 Encontré TORNEO, llamando procesarSeccionTorneo()");
                    this.procesarSeccionTorneo();
                } else if (token.lexema === "EQUIPOS" && token.tipo === "Palabra reservada") {
                    console.log("👥 Encontré EQUIPOS, llamando procesarSeccionEquipos()");
                    this.procesarSeccionEquipos();
                } else if (token.lexema === "ELIMINACION" && token.tipo === "Palabra reservada") {
                    console.log("🏆 Encontré ELIMINACION, llamando procesarSeccionEliminacion()");
                    this.procesarSeccionEliminacion();
                } else {
                    console.log("➡️ Avanzando al siguiente token");
                    this.indice++;
                }
            }

            // ✅ CALCULAR ESTADÍSTICAS DESPUÉS DE PROCESAR TODO
            this.calcularEstadisticas();

        } catch (error) {
            console.error("💥 Error en procesar():", error);
            this.erroresSemanticos.push({
                tipo: "Error de Procesamiento",
                descripcion: error.message,
                linea: this.tokens[this.indice]?.linea || 0,
                columna: this.tokens[this.indice]?.columna || 0
            });
        }

        // ✅ RETORNAR LOS RESULTADOS
        return {
            torneo: this.torneo,
            errores: this.erroresSemanticos
        };
    }
    validarSemantica() {
        // Validar que todos los equipos en partidos estén definidos
        for (const fase of this.torneo.fases) {
            for (const partido of fase.partidos) {
                // Validar equipos
                if (!this.torneo.equipos.find(e => e.nombre === partido.equipoLocal)) {
                    this.erroresSemanticos.push({
                        tipo: "Error ",
                        descripcion: `Equipo no definido: ${partido.equipoLocal}`,
                        linea: this.encontrarLineaPorNombre(partido.equipoLocal),
                        columna: 0
                    });
                }


                if (!this.torneo.equipos.find(e => e.nombre === partido.equipoVisitante)) {
                    this.erroresSemanticos.push({
                        tipo: "Error",
                        descripcion: `Equipo no definido: ${partido.equipoVisitante}`,
                        linea: this.encontrarLineaPorNombre(partido.equipoVisitante),
                        columna: 0
                    });
                }


                // Validar goleadores
                for (const goleador of partido.goleadores) {
                    let jugadorEncontrado = false;
                    for (const equipo of this.torneo.equipos) {
                        if (equipo.jugadores.find(j => j.nombre === goleador.jugador)) {
                            jugadorEncontrado = true;
                            break;
                        }
                    }

                    if (!jugadorEncontrado) {
                        this.erroresSemanticos.push({
                            tipo: "Error",
                            descripcion: `Jugador no definido: ${goleador.jugador}`,
                            linea: this.encontrarLineaPorNombre(goleador.jugador),
                            columna: 0
                        });
                    }
                }
            }
        }
    }
    procesarSeccionTorneo() {
        console.log("🎯 INICIANDO PROCESAMIENTO TORNEO - Índice inicial:", this.indice);
        this.avanzar(); // TORNEO
        this.avanzar(); // {
        console.log("Después de consumir TORNEO y { - Índice:", this.indice);

        // ✅ PROTECCIÓN CONTRA BUCLE INFINITO
        let contadorSeguridad = 0;
        const MAX_ITERACIONES = 500;

        while (this.indice < this.tokens.length && contadorSeguridad < MAX_ITERACIONES) {
            contadorSeguridad++;
            const token = this.tokens[this.indice];
            console.log("📋 Token actual:", token, "| Índice:", this.indice);

            // ✅ ACEPTAR AMBOS DELIMITADORES: } y )
            if (token.lexema === "}" || token.lexema === ")") {
                console.log("✅ ENCONTRÉ DELIMITADOR DE CIERRE:", token.lexema);
                this.avanzar(); // Consume } o )
                break;
            }

            if (token.tipo === "Atributo") {
                console.log("✅ ENCONTRÉ ATRIBUTO:", token.lexema);
                const atributo = token.lexema;
                this.avanzar(); // Consume el atributo

                // Verificar que el siguiente token es :
                if (this.indice < this.tokens.length && this.tokens[this.indice].lexema === ":") {
                    this.avanzar(); // Consume :
                } else {
                    console.log("❌ ERROR: Se esperaba ':' después de", atributo);
                    break;
                }

                const valorToken = this.tokens[this.indice];
                console.log("💾 Valor token:", valorToken);

                if (valorToken) {
                    if (valorToken.tipo === "Cadena") {
                        if (atributo === "nombre") {
                            this.torneo.nombre = valorToken.lexema;
                            console.log("🏆 Nombre del torneo establecido:", this.torneo.nombre);
                        }
                        if (atributo === "sede") {
                            this.torneo.sede = valorToken.lexema;
                            console.log("📍 Sede establecida:", this.torneo.sede);
                        }
                    } else if (valorToken.tipo === "Número" && atributo === "equipos") {
                        this.torneo.totalEquipos = parseInt(valorToken.lexema);
                        console.log("👥 Total equipos establecido:", this.torneo.totalEquipos);
                    }

                    this.avanzar(); // Consume el valor
                }

                // Consume coma o punto y coma si existe
                if (this.indice < this.tokens.length &&
                    (this.tokens[this.indice].lexema === "," || this.tokens[this.indice].lexema === ";")) {
                    this.avanzar();
                }
            } else {
                console.log("❌ Saltando token no atributo:", token.lexema);
                this.indice++;
            }
        }

        // ✅ VERIFICACIÓN DE SEGURIDAD
        if (contadorSeguridad >= MAX_ITERACIONES) {
            console.error("❌ BUCLE INFINITO DETECTADO: Se forzó la salida después de", MAX_ITERACIONES, "iteraciones");
            console.error("Último token procesado:", this.tokens[this.indice]);
        }

        console.log("🏁 FIN PROCESAMIENTO TORNEO - Índice final:", this.indice);
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
            jugadores: [],
            partidosJugados: 0,
            ganados: 0,
            perdidos: 0,
            empatados: 0,
            golesFavor: 0,
            golesContra: 0,
            diferencia: 0,
            faseAlcanzada: "No participó"
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
        console.log("👤 Procesando jugador...");
        this.avanzar(); // jugador
        this.avanzar(); // :

        const nombreJugador = this.tokens[this.indice].lexema;
        console.log("   Nombre jugador:", nombreJugador);
        this.avanzar(); // nombre jugador

        const jugador = {
            nombre: nombreJugador,
            posicion: "",
            numero: 0,
            edad: 0, // ✅ Inicializado como número
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
                    if (valorToken) {
                        if (atributo === "posicion" && valorToken.tipo === "Cadena") {
                            jugador.posicion = valorToken.lexema;
                            console.log("   Posición:", jugador.posicion);
                        } else if (atributo === "numero" && valorToken.tipo === "Número") {
                            jugador.numero = parseInt(valorToken.lexema);
                            console.log("   Número:", jugador.numero);
                        } else if (atributo === "edad" && valorToken.tipo === "Número") {
                            jugador.edad = parseInt(valorToken.lexema);
                            console.log("   ✅ Edad asignada:", jugador.edad);
                        }

                        this.avanzar(); // valor
                    }

                    if (this.tokens[this.indice]?.lexema === ",") this.avanzar(); // ,
                } else {
                    this.indice++;
                }
            }

            this.avanzar(); // ]
        }

        // ✅ VERIFICAR SI LA EDAD SIGUE SIENDO 0 (no se asignó)
        if (jugador.edad === 0) {
            console.log("⚠️ Jugador sin edad asignada:", jugador.nombre);
        }

        equipo.jugadores.push(jugador);
        console.log("   Jugador procesado completo:", jugador);
    }
    procesarSeccionEliminacion() {
        console.log("🏆 INICIANDO PROCESAMIENTO ELIMINACION");
        this.avanzar(); // ELIMINACION
        this.avanzar(); // {

        while (this.indice < this.tokens.length && this.tokens[this.indice].lexema !== "}") {
            const token = this.tokens[this.indice];
            console.log("🔍 Token en eliminacion:", token.lexema, "| Tipo:", token.tipo);

            // ✅ ACEPTAR "final" COMO FASE VÁLIDA (aunque sea la única)
            if (token.lexema === "final" || token.lexema === "semifinal" || token.lexema === "cuartos") {
                console.log("✅ Encontré fase:", token.lexema);
                this.procesarFase(token.lexema);
            } else {
                console.log("➡️ Saltando token en eliminacion:", token.lexema);
                this.indice++;
            }
        }

        this.avanzar(); // }
        if (this.tokens[this.indice]?.lexema === ";") this.avanzar(); // ;
    }

    procesarFase(nombreFase) {
    console.log("🎯 Procesando fase:", nombreFase);
    this.avanzar(); // nombre fase
    
    // Verificar si hay dos puntos
    if (this.tokens[this.indice]?.lexema === ":") {
        this.avanzar(); // :
    }

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
                console.log("➡️ Saltando token en fase:", this.tokens[this.indice].lexema);
                this.indice++;
            }
        }

        this.avanzar(); // ]
        
        // Consumir comas o puntos y coma opcionales
        if (this.tokens[this.indice]?.lexema === ",") this.avanzar(); // ,
        if (this.tokens[this.indice]?.lexema === ";") this.avanzar(); // ;

        this.torneo.fases.push(fase);
        console.log("✅ Fase procesada:", fase);
    } else {
        console.log("❌ Error: Se esperaba '[' después del nombre de la fase");
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

            // ✅ LÓGICA CORRECTA: Si gana, avanza a la siguiente fase
            const ordenFases = ["cuartos", "semifinal", "final"];
            const indiceFaseActual = ordenFases.indexOf(fase);

            if (indiceFaseActual < ordenFases.length - 1) {
                // El ganador avanza a la siguiente fase
                equipo.faseAlcanzada = ordenFases[indiceFaseActual + 1];
            } else {
                // Si está en la final, se queda en final
                equipo.faseAlcanzada = fase;
            }

        } else if (golesFavor < golesContra) {
            equipo.perdidos++;

            equipo.faseAlcanzada = fase;
        } else {
            equipo.empatados++;
            // Para empates (raro en eliminación), se queda en fase actual
            equipo.faseAlcanzada = fase;
        }
    }

    calcularEstadisticasGenerales() {
        console.log("📊 Calculando estadísticas generales...");

        // Total de goles
        this.torneo.totalGoles = this.torneo.equipos.reduce((sum, e) => sum + (e.golesFavor || 0), 0);

        // Total de partidos
        this.torneo.totalPartidos = this.torneo.fases.reduce((sum, f) => sum + (f.partidos?.length || 0), 0);

        // Partidos completados (tienen resultado)
        this.torneo.partidosCompletados = 0;
        for (const fase of this.torneo.fases) {
            for (const partido of fase.partidos || []) {
                if (partido.resultado) this.torneo.partidosCompletados++;
            }
        }

        // Promedio de goles por partido
        this.torneo.promedioGoles = this.torneo.partidosCompletados > 0 ?
            Number((this.torneo.totalGoles / this.torneo.partidosCompletados).toFixed(2)) : 0;

        // ✅ EDAD PROMEDIO - VERSIÓN MEJORADA
        const todosJugadores = this.torneo.equipos.flatMap(e => e.jugadores || []);

        console.log("👥 Total de jugadores encontrados:", todosJugadores.length);

        // Filtrar y convertir edades correctamente
        const edadesValidas = todosJugadores
            .filter(j => j && j.edad !== undefined && j.edad !== null)
            .map(j => {
                const edadNum = Number(j.edad);
                console.log(`Jugador: ${j.nombre}, Edad: ${j.edad}, Convertido: ${edadNum}`);
                return edadNum;
            })
            .filter(edad => !isNaN(edad) && edad > 0 && edad < 100); // Filtro más estricto

        console.log("📈 Edades válidas encontradas:", edadesValidas);

        if (edadesValidas.length > 0) {
            const sumaEdades = edadesValidas.reduce((sum, edad) => sum + edad, 0);
            this.torneo.edadPromedioGeneral = Number((sumaEdades / edadesValidas.length).toFixed(2));
            console.log("✅ Edad promedio calculada:", this.torneo.edadPromedioGeneral);
        } else {
            this.torneo.edadPromedioGeneral = 0;
            console.log("⚠️ No se encontraron edades válidas para calcular el promedio");
        }

        // Fase actual
        const fasesConPartidos = this.torneo.fases.filter(f => f.partidos && f.partidos.length > 0);
        this.torneo.faseActual = fasesConPartidos.length > 0 ?
            fasesConPartidos[fasesConPartidos.length - 1].nombre : "No iniciado";

        console.log("🏁 Estadísticas generales calculadas");
    }

    avanzar() {
        if (this.indice < this.tokens.length - 1) {
            this.indice++;
            console.log("➡️ Avanzando a índice:", this.indice, "Token:", this.tokens[this.indice]?.lexema);
        } else {
            console.log("⚠️ No se puede avanzar, fin de tokens");
        }
    }
}