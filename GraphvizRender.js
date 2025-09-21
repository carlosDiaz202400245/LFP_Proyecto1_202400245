export class GraphvizRenderer {
    static async renderDot(dotCode, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        try {
            // Limpiar contenedor
            container.innerHTML = '<div style="text-align: center; padding: 2rem;">Generando visualización del bracket...</div>';
            
            // Usar servicio online para renderizar (d3-graphviz)
            const response = await fetch('https://api.graphviz.cloud/api/render', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dot: dotCode,
                    format: 'svg'
                })
            });
            
            if (response.ok) {
                const svgText = await response.text();
                container.innerHTML = svgText;
            } else {
                throw new Error('Error al renderizar el gráfico');
            }
            
        } catch (error) {
            console.error('Error rendering Graphviz:', error);
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #e74c3c;">
                    <h4>Error al generar visualización</h4>
                    <p>${error.message}</p>
                    <button onclick="descargarGraphviz()" class="btn">Descargar Código DOT</button>
                </div>
            `;
        }
    }
    
    static renderFallback(dotCode, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = `
            <div style="background: #f8f9fa; padding: 2rem; border-radius: 8px;">
                <h4>Visualización no disponible</h4>
                <p>Puede descargar el código DOT y visualizarlo en:</p>
                <ul>
                    <li><a href="https://edotor.net/" target="_blank">Edotor.net</a></li>
                    <li><a href="https://graphviz.it/" target="_blank">Graphviz.it</a></li>
                </ul>
                <textarea style="width: 100%; height: 200px; font-family: monospace; margin: 1rem 0;" readonly>${dotCode}</textarea>
                <button onclick="descargarGraphviz()" class="btn">Descargar Código DOT</button>
            </div>
        `;
    }
}