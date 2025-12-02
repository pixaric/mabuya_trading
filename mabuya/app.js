/**
 * APP.JS - Lógica Principal de la Aplicación de Trading
 * Maneja: Inicialización, Navegación por Pestañas y Carga Dinámica de Contenido (FETCH).
 */

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos principales del DOM
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    // =========================================================
    // 1. LÓGICA DE NAVEGACIÓN Y CARGA DINÁMICA (FETCH)
    // =========================================================

    /**
     * Función principal para cambiar de pestaña. 
     * Gestiona las clases 'active' y, si es necesario, carga el contenido
     * de un archivo HTML externo de forma asíncrona.
     * @param {string} targetId - La ID del panel (y nombre del archivo) a cargar/mostrar.
     */
    const showTab = async (targetId) => {
        
        // Desactivar todos los botones y paneles
        tabButtons.forEach(button => button.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));

        // Obtener referencias al botón y panel objetivo
        const targetButton = document.querySelector(`.tab-button[data-tab="${targetId}"]`);
        const targetPanel = document.getElementById(targetId);

        if (targetButton && targetPanel) {
            // 1. Activar el botón y panel
            targetButton.classList.add('active');
            targetPanel.classList.add('active');
            
            // 2. Carga Dinámica: Cargar contenido si el panel no es 'inicio' y está vacío
            // Asumimos que 'inicio' ya tiene su contenido pre-cargado en index.html
            if (targetId !== 'inicio' && targetPanel.innerHTML.trim() === '') {
                const fileName = `${targetId}.html`; // ej: 'academia.html'
                
                try {
                    // Petición asíncrona (fetch)
                    const response = await fetch(fileName);
                    if (!response.ok) {
                        throw new Error(`Error ${response.status}: No se pudo cargar el archivo ${fileName}`);
                    }
                    const content = await response.text();
                    
                    // Inyección del contenido HTML
                    targetPanel.innerHTML = content;
                } catch (error) {
                    console.error("Fallo en la carga de la pestaña:", error);
                    targetPanel.innerHTML = `<div class="panel-inner"><h2 class="panel-title">Error de Carga</h2><p class="panel-lead">No se pudo cargar el contenido de ${targetId}. Por favor, verifica que el archivo ${fileName} exista.</p></div>`;
                    // Evitar inicializar manejadores si hubo un fallo crítico
                    return; 
                }
            }
            
            // 3. Inicializar los manejadores de eventos específicos de la pestaña
            initializeContentHandlers(targetId); 
        }
    };
    
    // ** Conexión de los botones a la función showTab **
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetId = e.target.dataset.tab;
            showTab(targetId);
        });
    });


    // =========================================================
    // 2. LÓGICA DE INICIALIZACIÓN DE CONTENIDOS (AÚN POR DEFINIR)
    // =========================================================

    /**
     * Esta función contendrá toda la lógica de eventListeners y funciones
     * específicas para cada pestaña (formularios, gráficos, videos, etc.).
     * Se llama CADA VEZ que se activa una pestaña (después de la carga si aplica).
     * @param {string} currentTabId - ID de la pestaña actual.
     */
    const initializeContentHandlers = (currentTabId) => {
        // En este punto, el contenido de la pestaña (ej: academia.html) ya está en el DOM.
        console.log(`Inicializando manejadores para la pestaña: ${currentTabId}`);
        
        // Aquí se añadirán las llamadas a funciones específicas (ej: initTradingViewChart(), initAnalysisForm())
        
        // Ejemplo de estructura:
        // if (currentTabId === 'inicio') {
        //     initTradingViewChart();
        //     initAnalysisForm();
        // } else if (currentTabId === 'videos') {
        //     initVideoSearch();
        // }
    };
    
    // =========================================================
    // 3. INICIALIZACIÓN FINAL
    // =========================================================
    
    // Mostrar la pestaña de inicio al cargar la página por primera vez
    showTab('inicio');
});