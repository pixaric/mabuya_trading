const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabButtons.forEach((b) => b.classList.toggle('active', b === btn));
    tabPanels.forEach((panel) => {
      panel.classList.toggle('active', panel.id === `tab-${target}`);
    });
  });
});
//ejemplo

// ... (código de setup) ...

const showTab = async (targetId) => {
    
    // 1. ... (Lógica para desactivar/activar clases 'active') ...
    const targetButton = document.querySelector(`.tab-button[data-tab="${targetId}"]`);
    const targetPanel = document.getElementById(targetId);

    if (targetButton && targetPanel) {
        targetButton.classList.add('active');
        targetPanel.classList.add('active');
        
        // 2. Condición de Carga: Solo si no es 'inicio' y el panel está vacío
        if (targetId !== 'inicio' && targetPanel.innerHTML.trim() === '') {
            
            const fileName = `${targetId}.html`; // Esto será 'academia.html'
            
            try {
                // 3. Petición asíncrona del archivo HTML
                const response = await fetch(fileName);
                
                if (!response.ok) {
                    throw new Error(`Error al cargar el archivo: ${fileName}. Código: ${response.status}`);
                }
                
                const content = await response.text();
                
                // 4. Inyección del contenido
                targetPanel.innerHTML = content;
                
            } catch (error) {
                console.error("Fallo en la carga de la pestaña:", error);
                targetPanel.innerHTML = `<div class="panel-inner"><h2 class="panel-title">Error de carga</h2><p class="panel-lead">Verifica que el archivo ${fileName} exista en la carpeta raíz.</p></div>`;
                return; 
            }
        }
        
        // 5. Inicializa los manejadores de eventos (esto incluye formularios, etc.)
        initializeContentHandlers(targetId); 
    }
};
// ... (resto del código) ...
// --------- Buscador de activos (Academia) ---------

const assetSearchForm = document.getElementById('asset-search-form');
const assetSearchInput = document.getElementById('asset-search-input');
const assetChart = document.getElementById('asset-chart');

// Mapa simple de activos a símbolos de TradingView
const tradingViewSymbols = {
  EURUSD: 'FX:EURUSD',
  GBPUSD: 'FX:GBPUSD',
  USDJPY: 'FX:USDJPY',
  XAUUSD: 'OANDA:XAUUSD',
  BTCUSD: 'BITSTAMP:BTCUSD',
  ETHUSD: 'BITSTAMP:ETHUSD',
  SPX500: 'OANDA:SPX500USD',
  NAS100: 'OANDA:NAS100USD',
  AAPL: 'NASDAQ:AAPL',
  TSLA: 'NASDAQ:TSLA',
};

function buildTradingViewUrl(symbol) {
  const base = 'https://s.tradingview.com/widgetembed/';
  const params = new URLSearchParams({
    frameElementId: 'tradingview_widget',
    symbol,
    interval: '60',
    hidesidetoolbar: '1',
    symboledit: '1',
    saveimage: '0',
    toolbarbg: 'f1f3f6',
    studies: '[]',
    theme: 'light',
    style: '1',
    timezone: 'Etc/UTC',
    withdateranges: '1',
    hidevolume: '0',
    hideideas: '1',
    locale: 'es',
  });
  return `${base}?${params.toString()}`;
}

function renderAssetChart(rawAsset) {
  if (!assetChart) return;

  const cleaned = (rawAsset || '').toUpperCase().replace(/\s+/g, '');
  if (!cleaned) {
    assetChart.className = 'asset-chart-placeholder';
    assetChart.innerHTML =
      'Escribe un símbolo (ej: EURUSD, BTCUSD, XAUUSD, AAPL...)';
    return;
  }

  const tvSymbol = tradingViewSymbols[cleaned] || cleaned;
  const iframeUrl = buildTradingViewUrl(tvSymbol);

  assetChart.innerHTML = '';
  assetChart.className = '';
  const iframe = document.createElement('iframe');
  iframe.className = 'asset-chart-iframe';
  iframe.src = iframeUrl;
  iframe.loading = 'lazy';
  iframe.title = `Gráfico en tiempo real de ${cleaned}`;
  assetChart.appendChild(iframe);
}

assetSearchForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  renderAssetChart(assetSearchInput?.value);
});

assetSearchInput?.addEventListener('change', () => {
  renderAssetChart(assetSearchInput.value);
});

/* --------- Análisis de mercado --------- */

const analysisForm = document.getElementById('analysis-form');
const analysisList = document.getElementById('analysis-list');
const clearAnalysesBtn = document.getElementById('clear-analyses');

function createAnalysisCard({ asset, bias, horizonte, contexto, escenarios }) {
  const card = document.createElement('article');
  card.className = 'item-card';

  const titleRow = document.createElement('div');
  titleRow.className = 'item-title-row';

  const title = document.createElement('div');
  title.className = 'item-title';
  title.textContent = asset;

  const badge = document.createElement('span');
  badge.className = 'item-badge';
  badge.textContent = `${bias} · ${horizonte}`;

  titleRow.append(title, badge);

  const meta = document.createElement('div');
  meta.className = 'item-meta';
  const now = new Date();
  meta.textContent = now.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const body = document.createElement('div');
  body.className = 'item-body';

  const contextoEl = document.createElement('p');
  contextoEl.textContent = contexto;

  body.appendChild(contextoEl);

  if (escenarios && escenarios.trim() !== '') {
    const escenariosEl = document.createElement('p');
    escenariosEl.style.marginTop = '4px';
    escenariosEl.textContent = `Escenarios: ${escenarios}`;
    body.appendChild(escenariosEl);
  }

  card.append(titleRow, meta, body);
  return card;
}

analysisForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const asset = analysisForm.asset.value.trim();
  const bias = analysisForm.bias.value;
  const horizonte = analysisForm.horizonte.value;
  const contexto = analysisForm.contexto.value.trim();
  const escenarios = analysisForm.escenarios.value.trim();

  if (!asset || !contexto) return;

  const card = createAnalysisCard({
    asset,
    bias,
    horizonte,
    contexto,
    escenarios,
  });

  analysisList.prepend(card);
  analysisForm.reset();
});

clearAnalysesBtn?.addEventListener('click', () => {
  analysisList.innerHTML = '';
});

/* --------- Noticias --------- */

const newsForm = document.getElementById('news-form');
const clearNewsBtn = document.getElementById('clear-news');

const newsListsByCategory = {
  Macro: document.getElementById('news-list-macro'),
  Empresa: document.getElementById('news-list-empresa'),
  Otros: document.getElementById('news-list-otros'),
};

function createNewsCard({ headline, source, impact, details }) {
  const card = document.createElement('article');
  card.className = 'item-card';

  const titleRow = document.createElement('div');
  titleRow.className = 'item-title-row';

  const title = document.createElement('div');
  title.className = 'item-title';
  title.textContent = headline;

  const badge = document.createElement('span');
  badge.className = 'item-badge';
  badge.textContent = `Impacto ${impact}`;

  titleRow.append(title, badge);

  const meta = document.createElement('div');
  meta.className = 'item-meta';

  const pieces = [];

  if (source && source.trim() !== '') {
    pieces.push(source.trim());
  }

  const now = new Date();
  pieces.push(
    now.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  );

  meta.textContent = pieces.join(' · ');

  const body = document.createElement('div');
  body.className = 'item-body';
  body.textContent = details;

  card.append(titleRow, meta, body);
  return card;
}

newsForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const headline = newsForm.headline.value.trim();
  const source = newsForm.source.value.trim();
  const impact = newsForm.impact.value;
  const details = newsForm.details.value.trim();
  const category = newsForm.category.value;

  if (!headline || !details) return;

  const card = createNewsCard({
    headline,
    source,
    impact,
    details,
  });

  const targetList =
    newsListsByCategory[category] || newsListsByCategory.Otros;

  targetList?.prepend(card);
  newsForm.reset();
});

clearNewsBtn?.addEventListener('click', () => {
  Object.values(newsListsByCategory).forEach((list) => {
    if (list) list.innerHTML = '';
  });
});

/* --------- Videos (YouTube) --------- */

const videosList = document.getElementById('videos-list');
const videoSearchInput = document.getElementById('video-search');

// Lista de videos de ejemplo (puedes reemplazar las URLs por las de tu canal)
const presetVideos = [
  {
    title: 'Introducción a la estructura del mercado',
    notes:
      'Video base para entender cómo se mueve el precio, qué es liquidez y por qué el mercado crea rangos y tendencias.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    title: 'Gestión de riesgo aplicada al trading',
    notes:
      'Cómo definir el tamaño de posición, calcular el R/R y proteger la cuenta ante rachas negativas.',
    videoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
  },
  {
    title: 'Psicología del trading: manejo de emociones',
    notes:
      'Cómo enfrentar miedo, codicia y ansiedad para ejecutar tu plan de forma consistente.',
    videoUrl: 'https://www.youtube.com/watch?v=5NV6Rdv1a3I',
  },
  {
    title: 'Plan de trading paso a paso',
    notes:
      'Estructura básica de un plan de trading: objetivos, reglas, gestión del riesgo y revisión.',
    videoUrl: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
  },
  {
    title: 'Backtesting: cómo validar una estrategia',
    notes:
      'Guía práctica para probar tus ideas en datos históricos y medir su rendimiento.',
    videoUrl: 'https://www.youtube.com/watch?v=l482T0yNkeo',
  },
  {
    title: 'Sesión de análisis en vivo del mercado',
    notes:
      'Revisión del contexto macro, niveles clave y posibles escenarios operativos para la semana.',
    videoUrl: 'https://www.youtube.com/watch?v=kXYiU_JCYtU',
  },
];

function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.slice(1);
    }
    if (u.hostname.includes('youtube.com')) {
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      if (u.pathname.startsWith('/shorts/')) {
        return u.pathname.split('/')[2];
      }
    }
  } catch (err) {
    return null;
  }
  return null;
}

function createVideoCard({ title, notes, videoUrl }) {
  const card = document.createElement('article');
  card.className = 'item-card';

  const titleRow = document.createElement('div');
  titleRow.className = 'item-title-row';

  const titleEl = document.createElement('div');
  titleEl.className = 'item-title';
  titleEl.textContent = title;

  const badge = document.createElement('span');
  badge.className = 'item-badge';
  badge.textContent = 'Video YouTube';

  titleRow.append(titleEl, badge);

  const meta = document.createElement('div');
  meta.className = 'item-meta';
  meta.textContent = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const body = document.createElement('div');
  body.className = 'item-body';
  body.textContent = notes;

  card.append(titleRow, meta, body);

  if (videoUrl && videoUrl.trim() !== '') {
    const ytId = extractYouTubeId(videoUrl.trim());
    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'item-video';

    if (ytId) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${ytId}`;
      iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      videoWrapper.appendChild(iframe);
    } else {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Abrir video';
      link.style.display = 'inline-flex';
      link.style.alignItems = 'center';
      link.style.justifyContent = 'center';
      link.style.width = '100%';
      link.style.height = '100%';
      link.style.color = '#ffffff';
      link.style.fontSize = '12px';
      link.style.textDecoration = 'none';
      videoWrapper.appendChild(link);
    }

    card.appendChild(videoWrapper);
  }

  return card;
}

// Renderizar videos al cargar la página
function renderPresetVideos(filterText = '') {
  if (!videosList || !Array.isArray(presetVideos)) return;

  const normalizedFilter = filterText.trim().toLowerCase();
  videosList.innerHTML = '';

  const filtered = presetVideos.filter((video) => {
    if (!normalizedFilter) return true;
    const inTitle = video.title.toLowerCase().includes(normalizedFilter);
    const inNotes = (video.notes || '').toLowerCase().includes(normalizedFilter);
    return inTitle || inNotes;
  });

  filtered.forEach((video) => {
    const card = createVideoCard(video);
    videosList.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderPresetVideos();

  if (videoSearchInput) {
    videoSearchInput.addEventListener('input', () => {
      renderPresetVideos(videoSearchInput.value);
    });
  }
});