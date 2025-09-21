import { Lexer } from './Lexer.js';
import { ProcesadorTorneo } from './ProcesadorTorneo.js';

window.descargarReporteEquipos = descargarReporteEquipos;
window.descargarReporteGoleadores = descargarReporteGoleadores;
window.descargarReporteGeneral = descargarReporteGeneral;
window.descargarGraphviz = descargarGraphviz;

// Elementos DOM
const fileInput = document.getElementById('fileInput');
const fileUpload = document.getElementById('fileUpload');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const codeEditor = document.getElementById('codeEditor');
const btnAnalizar = document.getElementById('btnAnalizar');
const btnReporte = document.getElementById('btnReporte');
const btnBracket = document.getElementById('btnBracket');
const btnLimpiar = document.getElementById('btnLimpiar');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const loading = document.getElementById('loading');
const btnAnalizarTexto = document.getElementById('btnAnalizarTexto');
let archivoCargado = null;
let resultadosAnalisis = null;

// Event Listeners
fileUpload.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileUpload);
btnAnalizar.addEventListener('click', analizarTorneo);
btnReporte.addEventListener('click', generarReporte);
btnBracket.addEventListener('click', mostrarBracket);
btnAnalizarTexto.addEventListener('click', analizarTorneo);
btnLimpiar.addEventListener('click', limpiarTodo);

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        cambiarTab(tabId);
    });
});
function mostrarBotonesReportes() {
    if (reportesContainer) {
        reportesContainer.style.display = 'block';
    }
}

function ocultarBotonesReportes() {
    if (reportesContainer) {
        reportesContainer.style.display = 'none';
    }
}

// Función para descargar archivos HTML
function descargarHTML(contenido, nombreArchivo) {
    const blob = new Blob([contenido], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Funciones de descarga
function descargarReporteEquipos() {
    if (!resultadosAnalisis) {
        alert('Primero debe analizar un torneo válido');
        return;
    }
    const contenido = generarHTMLReporteEquipos();
    descargarHTML(contenido, 'reporte_equipos.html');
}

function descargarReporteGoleadores() {
    if (!resultadosAnalisis) {
        alert('Primero debe analizar un torneo válido');
        return;
    }
    const contenido = generarHTMLReporteGoleadores();
    descargarHTML(contenido, 'reporte_goleadores.html');
}

function descargarReporteGeneral() {
    if (!resultadosAnalisis) {
        alert('Primero debe analizar un torneo válido');
        return;
    }
    const contenido = generarHTMLReporteGeneral();
    descargarHTML(contenido, 'reporte_general.html');
}
function descargarReporteBracket() {
    if (!resultadosAnalisis) {
        alert('Primero debe analizar un torneo válido');
        return;
    }
    const contenido = generarHTMLReporteBracket();
    descargarHTML(contenido, 'reporte_bracket.html');
}

function descargarGraphviz() {
    const contenido = generarCodigoGraphviz();
    descargarHTML(contenido, 'bracket_torneo.dot');
}
function generarHTMLReporteBracket() {
    if (!resultadosAnalisis || !resultadosAnalisis.torneo) {
        return "<p>Error: No hay datos del torneo</p>";
    }

    const { torneo } = resultadosAnalisis;

    if (!torneo.fases || torneo.fases.length === 0) {
        return "<p>No hay datos de fases para generar el bracket</p>";
    }

    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bracket de Eliminación - ${torneo.nombre}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 2rem; }
                table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
                th, td { padding: 0.8rem; border: 1px solid #ddd; text-align: left; }
                th { background-color: #f4f4f4; }
                h1 { color: #2c3e50; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 2rem 0; }
                .stat-card { background: #f8f9fa; padding: 1.5rem; border-radius: 8px; text-align: center; }
                .stat-number { font-size: 2rem; font-weight: bold; color: #3498db; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🏆 Bracket de Eliminación - ${torneo.nombre}</h1>
                <p><strong>Sede:</strong> ${torneo.sede || 'No especificada'}</p>
                <p><strong>Total de equipos:</strong> ${torneo.equipos.length}</p>
                
                <h2>📋 Progreso del Torneo</h2>
                <table class="bracket-table">
                    <thead>
                        <tr>
                            <th>Fase</th>
                            <th>Partido</th>
                            <th>Resultado</th>
                            <th>Ganador</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    // Procesar cada fase y partido
    torneo.fases.forEach(fase => {
        html += `
            <tr class="fase-header">
                <td colspan="4"><strong>${fase.nombre.toUpperCase()}</strong></td>
            </tr>
        `;

        if (fase.partidos && fase.partidos.length > 0) {
            fase.partidos.forEach(partido => {
                const resultado = partido.resultado || 'Pendiente';
                const ganador = partido.ganador || '-';
                
                html += `
                    <tr>
                        <td>${fase.nombre}</td>
                        <td>${partido.equipoLocal} vs ${partido.equipoVisitante}</td>
                        <td>${resultado}</td>
                        <td class="${ganador === '-' ? 'pendiente' : 'ganador'}">
                            ${ganador}
                        </td>
                    </tr>
                `;
            });
        } else {
            html += `
                <tr>
                    <td colspan="4" style="text-align: center; color: #7f8c8d;">
                        No hay partidos programados en esta fase
                    </td>
                </tr>
            `;
        }
    });

    html += `
                    </tbody>
                </table>

                
        </body>
        </html>
    `;

    return html;
}

function generarHTMLReporteEquipos() {
    if (!resultadosAnalisis || !resultadosAnalisis.torneo) {
        return "<p>Error: No hay datos del torneo</p>";
    }

    const { torneo } = resultadosAnalisis;


    if (!torneo.equipos || !Array.isArray(torneo.equipos)) {
        return "<p>Error: Estructura de equipos inválida</p>";
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte de Equipos - ${torneo.nombre}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 2rem; }
                table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
                th, td { padding: 0.8rem; border: 1px solid #ddd; text-align: left; }
                th { background-color: #f4f4f4; }
                h1 { color: #2c3e50; }
            </style>
        </head>
        <body>
            <h1>Reporte de Equipos - ${torneo.nombre}</h1>
            <table>
                <thead><tr><th>Equipo</th><th>PJ</th><th>G</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>Fase</th></tr></thead>
                <tbody>
                    ${torneo.equipos.map(equipo => `
                        <tr>
                            <td>${equipo.nombre}</td>
                            <td>${equipo.partidosJugados || 0}</td>
                            <td>${equipo.ganados || 0}</td>
                            <td>${equipo.perdidos || 0}</td>
                            <td>${equipo.golesFavor || 0}</td>
                            <td>${equipo.golesContra || 0}</td>
                            <td>${equipo.diferencia || 0}</td>
                            <td>${equipo.faseAlcanzada || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>`;
}

function generarHTMLReporteGoleadores() {
    const { torneo } = resultadosAnalisis;

    // Recopilar y ordenar goleadores
    const goleadores = [];
    torneo.equipos.forEach(equipo => {
        equipo.jugadores.forEach(jugador => {
            if (jugador.goles > 0) {
                goleadores.push({
                    nombre: jugador.nombre,
                    equipo: equipo.nombre,
                    goles: jugador.goles,
                    minutos: jugador.minutosGol.join(', ')
                });
            }
        });
    });

    goleadores.sort((a, b) => b.goles - a.goles);

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte de Goleadores - ${torneo.nombre}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 2rem; }
                table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
                th, td { padding: 0.8rem; border: 1px solid #ddd; text-align: left; }
                th { background-color: #f4f4f4; }
                h1 { color: #2c3e50; }
            </style>
        </head>
        <body>
            <h1>Reporte de Goleadores - ${torneo.nombre}</h1>
            <table>
                <thead><tr><th>#</th><th>Jugador</th><th>Equipo</th><th>Goles</th><th>Minutos</th></tr></thead>
                <tbody>
                    ${goleadores.map((goleador, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${goleador.nombre}</td>
                            <td>${goleador.equipo}</td>
                            <td>${goleador.goles}</td>
                            <td>${goleador.minutos}</td>
                        </tr>
                    `).join('')}
                </tbody>
                </table>
            </body>
            </html>`;
}

function generarHTMLReporteGeneral() {
    const { torneo } = resultadosAnalisis;
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte General - ${torneo.nombre}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 2rem; }
                table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
                th, td { padding: 0.8rem; border: 1px solid #ddd; text-align: left; }
                th { background-color: #f4f4f4; }
                h1 { color: #2c3e50; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 2rem 0; }
                .stat-card { background: #f8f9fa; padding: 1.5rem; border-radius: 8px; text-align: center; }
                .stat-number { font-size: 2rem; font-weight: bold; color: #3498db; }
            </style>
        </head>
        <body>
            <h1>Reporte General - ${torneo.nombre}</h1>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${torneo.equipos.length}</div>
                    <div>Equipos Participantes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${torneo.totalPartidos || 0}</div>
                    <div>Total de Partidos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${torneo.totalGoles || 0}</div>
                    <div>Total de Goles</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${torneo.promedioGoles || 0}</div>
                    <div>Promedio de Goles</div>
                </div>
            </div>
            
            <h2>Estadísticas Generales</h2>
            <table>
                <tr><th>Estadística</th><th>Valor</th></tr>
                <tr><td>Nombre del Torneo</td><td>${torneo.nombre || 'No especificado'}</td></tr>
                <tr><td>Sede</td><td>${torneo.sede || 'No especificada'}</td></tr>
                <tr><td>Equipos Participantes</td><td>${torneo.equipos.length}</td></tr>
                <tr><td>Total de Partidos Programados</td><td>${torneo.totalPartidos || 0}</td></tr>
                <tr><td>Partidos Completados</td><td>${torneo.partidosCompletados || 0}</td></tr>
                <tr><td>Total de Goles</td><td>${torneo.totalGoles || 0}</td></tr>
                <tr><td>Promedio de Goles por Partido</td><td>${torneo.promedioGoles || 0}</td></tr>
                <tr><td>Edad Promedio de Jugadores</td><td>${torneo.edadPromedioGeneral || 0} años</td></tr>
                <tr><td>Fase Actual</td><td>${torneo.faseActual || 'No iniciado'}</td></tr>
            </table>
        </body>
        </html>`;
}

function generarCodigoGraphviz() {
    const { torneo } = resultadosAnalisis;

    if (!torneo.fases || torneo.fases.length === 0) {
        return "digraph Torneo {\n    label=\"No hay datos de fases para generar el bracket\"\n}";
    }

    let dotCode = `digraph Torneo {
    rankdir=TB
    node [shape=rect, style="rounded,filled", fillcolor="#3498db", fontcolor="white", fontname="Arial"]
    edge [arrowhead=none, color="#7f8c8d"]
    
    label="${torneo.nombre || 'Torneo'} - ${torneo.sede || ''}"
    labelloc=t
    fontsize=20
    fontname="Arial"
    bgcolor="transparent"
    
    // Estilos para los nodos
    graph [nodesep=0.3, ranksep=0.5]
    node [width=2.0, height=0.6, fixedsize=true]
`;

    // ✅ MANEJAR CASO DE UNA SOLA FASE
    if (torneo.fases.length === 1) {
        const fase = torneo.fases[0];
        dotCode += `\n    // ${fase.nombre.toUpperCase()}\n    subgraph cluster_0 {\n        label="${fase.nombre}"\n        style=filled\n        fillcolor="#ecf0f1"\n        fontname="Arial"\n        labelloc=b\n        `;

        fase.partidos.forEach((partido, partidoIndex) => {
            const matchId = `match_0_${partidoIndex}`;
            const localId = `${matchId}_local`;
            const visitorId = `${matchId}_visitor`;

            dotCode += `
        ${localId} [label="${partido.equipoLocal}\\n${partido.golesLocal}", fillcolor="${partido.ganador === partido.equipoLocal ? '#2ecc71' : '#3498db'}"]
        ${visitorId} [label="${partido.equipoVisitante}\\n${partido.golesVisitante}", fillcolor="${partido.ganador === partido.equipoVisitante ? '#2ecc71' : '#3498db'}"]
        ${matchId} [label="", width=0.1, height=0.1, fillcolor="transparent"]
        
        ${localId} -> ${matchId} [weight=2]
        ${visitorId} -> ${matchId} [weight=2]`;
        });

        dotCode += "\n    }";
    } else {
        // ... (código original para múltiples fases)
    }

    dotCode += '\n}';
    return dotCode;
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
        archivoCargado = file;

        // Mostrar información del archivo
        fileName.textContent = file.name;
        fileSize.textContent = `Tamaño: ${(file.size / 1024).toFixed(2)} KB`;
        fileInfo.style.display = 'block';

        // Leer contenido del archivo
        const reader = new FileReader();
        reader.onload = function (e) {
            codeEditor.value = e.target.result;
            // Habilitar ambos botones de análisis
            btnAnalizar.disabled = false;
            btnAnalizarTexto.disabled = false;
            btnReporte.disabled = true;
            btnBracket.disabled = true;
        };
        reader.readAsText(file);
    }
}
function habilitarBotones(habilitar) {
    btnAnalizar.disabled = !habilitar;
    btnAnalizarTexto.disabled = !habilitar;
    btnReporte.disabled = true;
    btnBracket.disabled = true;
}

function cambiarTab(tabId) {
    // Desactivar todas las pestañas
    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Activar la pestaña seleccionada
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

async function analizarTorneo() {
    const codigo = codeEditor.value.trim();
    if (!codigo) {
        alert('Por favor, ingrese o cargue un código de torneo');
        return;
    }

    mostrarLoading(true);

    try {
        // Análisis léxico
        const lexer = new Lexer(codigo);
        const { tokens, errores } = lexer.analizar();

        // Mostrar tokens y errores
        mostrarTokens(tokens);
        mostrarErrores(errores);

        if (errores.length === 0) {
            // Análisis semántico
            const procesador = new ProcesadorTorneo(tokens);
            resultadosAnalisis = procesador.procesar();

            if (resultadosAnalisis.errores && resultadosAnalisis.errores.length > 0) {
                mostrarErroresSemanticos(resultadosAnalisis.errores);
            }

            // Habilitar botones después del análisis exitoso
            btnAnalizar.disabled = false;
            btnReporte.disabled = false;
            btnBracket.disabled = false;

            cambiarTab('tokens');
        } else {
            resultadosAnalisis = null;
            // ✅ MOSTRAR AUTOMÁTICAMENTE LA PESTAÑA DE ERRORES SI HAY ERRORES
            cambiarTab('errores');
        }

    } catch (error) {
        console.error('Error en el análisis:', error);
        alert('Error al analizar el torneo: ' + error.message);
        cambiarTab('errores');
    } finally {
        mostrarLoading(false);
    }
}

function mostrarTokens(tokens) {
    const tokensTable = document.getElementById('tokensTable');

    if (tokens.length === 0) {
        tokensTable.innerHTML = '<p>No se encontraron tokens</p>';
        return;
    }

    let html = `
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Lexema</th>
                        <th>Tipo</th>
                        <th>Línea</th>
                        <th>Columna</th>
                    </tr>
                </thead>
                <tbody>
        `;

    tokens.forEach((token, index) => {
        html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHtml(token.lexema)}</td>
                    <td>${token.tipo}</td>
                    <td>${token.linea}</td>
                    <td>${token.columna}</td>
                </tr>
            `;
    });

    html += '</tbody></table>';
    tokensTable.innerHTML = html;
}

function mostrarErrores(errores) {
    const errorsTable = document.getElementById('errorsTable');

    if (errores.length === 0) {
        errorsTable.innerHTML = '<p>✅ No se encontraron errores léxicos</p>';
        return;
    }

    let html = `
        <div class="result-section">
            <h3>❌ Errores Léxicos Encontrados</h3>
            <p>Se encontraron <strong style="color: #e74c3c;">${errores.length}</strong> errores:</p>
            
            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Lexema</th>
                            <th>Tipo de Error</th>
                            <th>Descripción</th>
                            <th>Línea</th>
                            <th>Columna</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    errores.forEach((error, index) => {
        // Clasificar tipos de error
        let tipoError = error.tipo;
        
        if (error.descripcion.includes('mal escrito')) {
            tipoError = "Token inválido";
        } else if (error.descripcion.includes('Símbolo')) {
            tipoError = "Falta de símbolo esperado";
        } else if (error.descripcion.includes('Formato')) {
            tipoError = "Formato incorrecto";
        } else if (error.descripcion.includes('comilla')) {
            tipoError = "Uso incorrecto de comillas";
        }

        html += `
            <tr class="error-row">
                <td>${index + 1}</td>
                <td><strong>"${escapeHtml(error.lexema)}"</strong></td>
                <td>${tipoError}</td>
                <td>${error.descripcion}</td>
                <td>${error.linea}</td>
                <td>${error.columna}</td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    errorsTable.innerHTML = html;
}

function mostrarErroresSemanticos(errores) {
    const errorsTable = document.getElementById('errorsTable');
    
    let html = errorsTable.innerHTML; // Mantener errores léxicos si existen
    
    html += `
        <div class="result-section" style="margin-top: 2rem;">
            <h3>⚠️ Errores Semánticos Encontrados</h3>
            <p>Se encontraron <strong style="color: #f39c12;">${errores.length}</strong> errores semánticos:</p>
            
            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tipo de Error</th>
                            <th>Descripción</th>
                            <th>Línea</th>
                            <th>Columna</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    errores.forEach((error, index) => {
        html += `
            <tr class="error-row" style="background-color: #fff3cd;">
                <td>${index + 1}</td>
                <td>${error.tipo}</td>
                <td>${error.descripcion}</td>
                <td>${error.linea}</td>
                <td>${error.columna}</td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    errorsTable.innerHTML = html;
}

function generarReporte() {
    if (!resultadosAnalisis) {
        alert('Primero debe analizar un torneo válido');
        return;
    }

    mostrarBotonesReportes();

    const reportesContent = document.getElementById('reportesContent');
    if (reportesContent) {
        let html = `
            <div style="text-align: center; padding: 3rem;">
                <h3>📊 Reportes Generados Correctamente</h3>
                <p>Selecciona qué reporte deseas descargar:</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
                    <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2.5rem; margin-bottom: 1rem;">🏆</div>
                        <h4>Reporte de Equipos</h4>
                        <p>Tabla de posiciones y estadísticas</p>
                        <button class="btn" onclick="descargarReporteEquipos()" style="margin-top: 1rem;">
                            📥 Descargar HTML
                        </button>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2.5rem; margin-bottom: 1rem;">⚽</div>
                        <h4>Reporte de Goleadores</h4>
                        <p>Ranking de mejores anotadores</p>
                        <button class="btn" onclick="descargarReporteGoleadores()" style="margin-top: 1rem;">
                            📥 Descargar HTML
                        </button>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2.5rem; margin-bottom: 1rem;">📈</div>
                        <h4>Reporte General</h4>
                        <p>Estadísticas completas del torneo</p>
                        <button class="btn" onclick="descargarReporteGeneral()" style="margin-top: 1rem;">
                            📥 Descargar HTML
                        </button>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2.5rem; margin-bottom: 1rem;">🎯</div>
                        <h4>Diagrama Bracket</h4>
                        <p>Código Graphviz del torneo</p>
                        <button class="btn" onclick="descargarGraphviz()" style="margin-top: 1rem;">
                            📥 Descargar DOT
                        </button>
                    </div>
                    
                    <!-- NUEVO BOTÓN PARA EL REPORTE DE BRACKET -->
                    <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2.5rem; margin-bottom: 1rem;">📋</div>
                        <h4>Reporte de Bracket</h4>
                        <p>Tabla de enfrentamientos y resultados</p>
                        <button class="btn" onclick="descargarReporteBracket()" style="margin-top: 1rem;">
                            📥 Descargar HTML
                        </button>
                    </div>
                </div>
                
                <div style="margin-top: 2rem; padding: 1.5rem; background: #e8f5e8; border-radius: 12px;">
                    <h4>✅ Análisis Completado</h4>
                    <p>Los reportes están listos para descargar. Haz clic en los botones above para obtener cada reporte en formato HTML.</p>
                </div>
            </div>
        `;

        reportesContent.innerHTML = html;
    }

    cambiarTab('reportes');
}

function mostrarBracket() {
    if (!resultadosAnalisis) {
        alert('Primero debe analizar un torneo válido');
        return;
    }

    const bracketContent = document.getElementById('bracketContent');
    const { torneo } = resultadosAnalisis;

    let html = '<h3>Diagrama de Bracket</h3>';

    if (torneo.fases.length === 0) {
        html += '<p>No se encontraron fases en el torneo</p>';
    } else if (torneo.fases.length === 1) {
        // ✅ MOSTRAR INFORMACIÓN DE LA FASE ÚNICA
        const fase = torneo.fases[0];
        html += `
            <div style="margin-bottom: 1.5rem;">
                <button class="btn" onclick="descargarGraphviz()">📥 Descargar Código Graphviz</button>
            </div>
            <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <h4>${fase.nombre.toUpperCase()}</h4>
                ${fase.partidos.map(partido => `
                    <div style="margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 6px;">
                        <strong>${partido.equipoLocal} vs ${partido.equipoVisitante}</strong>
                        <br>Resultado: ${partido.resultado || 'Pendiente'}
                        <br>Ganador: ${partido.ganador || 'Por definir'}
                    </div>
                `).join('')}
            </div>
            <p style="margin-top: 1rem; color: #7f8c8d;">
                <i>Nota: El bracket visual completo requiere al menos 2 fases (semifinal y final).</i>
            </p>
        `;
    } else {
        // ... (código original para múltiples fases)
    }

    bracketContent.innerHTML = html;
    cambiarTab('bracket');
}
// Hacer estas funciones globales
window.descargarReporteEquipos = descargarReporteEquipos;
window.descargarReporteGoleadores = descargarReporteGoleadores;
window.descargarReporteGeneral = descargarReporteGeneral;
window.descargarGraphviz = descargarGraphviz;
window.descargarReporteBracket = descargarReporteBracket;


function limpiarTodo() {
    fileInput.value = '';
    codeEditor.value = '';
    archivoCargado = null;
    resultadosAnalisis = null;

    document.getElementById('tokensTable').innerHTML = '';
    document.getElementById('errorsTable').innerHTML = '';
    document.getElementById('reportesContent').innerHTML = '';
    document.getElementById('bracketContent').innerHTML = '';

    fileInfo.style.display = 'none';
    habilitarBotones(false);
    ocultarBotonesReportes(); // Ocultar botones al limpiar
    cambiarTab('definicion');
}

function mostrarLoading(mostrar) {
    loading.style.display = mostrar ? 'block' : 'none';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Habilitar arrastrar y soltar
fileUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUpload.style.borderColor = '#3498db';
    fileUpload.style.background = '#f8f9fa';
});

fileUpload.addEventListener('dragleave', (e) => {
    e.preventDefault();
    fileUpload.style.borderColor = '';
    fileUpload.style.background = '';
});

fileUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUpload.style.borderColor = '';
    fileUpload.style.background = '';

    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleFileUpload({ target: { files: e.dataTransfer.files } });
    }
});

// Inicializar
habilitarBotones(false);
if (codeEditor.value.trim() !== '') {
    btnAnalizarTexto.disabled = false;
}

// Escuchar cambios en el textarea
codeEditor.addEventListener('input', function () {
    btnAnalizarTexto.disabled = this.value.trim() === '';
});