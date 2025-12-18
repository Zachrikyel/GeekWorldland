const supabaseClient = window._supabase; //
/// VARIABLES ///
let localProducts = [];
let localCategories = [];
let maxPriceInDb = 0;
let activeCategory = 'all';
let activeCategoryId = null;
let priceLimit = 0;
let currentProductId = null;
let modalProduct = null;
let selectedColorName = "Base";
let currentCarouselMedia = [];
let carouselIndex = 0;

// 🔍 NUEVA VARIABLE PARA BÚSQUEDA
let activeSearchQuery = '';

/// PROTOCOLO ///
document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('productsGrid');

    if (grid) {
        console.log("🛸 Inicializando Arsenal Geek...");

        // 🔍 LEER PARÁMETRO DE BÚSQUEDA DE LA URL
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('q');

        if (searchParam) {
            activeSearchQuery = searchParam.trim();
            console.log("🔎 Búsqueda detectada:", activeSearchQuery);

            // Actualizar título visual
            const pageTitle = document.querySelector('.arsenal-title');
            if (pageTitle) {
                pageTitle.innerHTML = `Resultados para: <span style="color:var(--primary-lime)">"${activeSearchQuery}"</span>`;
            }
        }

        // A. Calibrar Sensores
        await setupPriceSlider();

        // B. Cargar Datos
        await loadCategories();
        await loadProducts();

        // C. Activar Controles
        initPriceSlider();

        // 🔍 D. CONECTAR BOTÓN DE BÚSQUEDA INTERNO
        initInternalSearchButton();
    }
});

// 🔍 NUEVA FUNCIÓN: BOTÓN DE BÚSQUEDA DENTRO DE ARSENAL (USA EL OVERLAY DEL HEADER)
function initInternalSearchButton() {
    const searchCard = document.getElementById('panelSearchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInputOverlay');

    if (searchCard && searchOverlay && searchInput) {
        searchCard.addEventListener('click', () => {
            // Abrir el mismo overlay del header
            searchOverlay.classList.add('active');

            // Limpiar input anterior
            searchInput.value = '';

            // Focus en el input
            setTimeout(() => searchInput.focus(), 100);
        });
    }
}

// 🔍 FUNCIÓN GLOBAL PARA BÚSQUEDA DESDE OVERLAY (SIN RECARGAR PÁGINA)
window.applySearchFromOverlay = function (query) {
    if (!query || !query.trim()) return;

    // Actualizar variable de búsqueda
    activeSearchQuery = query.trim();

    console.log('🔎 Aplicando búsqueda desde overlay:', activeSearchQuery);

    // Actualizar título visual
    const pageTitle = document.querySelector('.arsenal-title');
    if (pageTitle) {
        pageTitle.innerHTML = `Resultados para: <span style="color:var(--primary-lime)">"${activeSearchQuery}"</span>`;
    }

    // Resetear filtros de categoría (opcional, depende de tu lógica)
    activeCategory = 'all';
    activeCategoryId = null;

    // Aplicar búsqueda
    applyFilters();

    // Scroll suave a productos
    const productsSection = document.getElementById('productos');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/// SLIDER ///
async function setupPriceSlider() {
    const { data, error } = await supabaseClientClient
        .from('products')
        .select('compare_at_price')
        .order('compare_at_price', { ascending: false })
        .limit(1);

    const slider = document.getElementById('priceSlicer');
    let maxPrice = 1000000;

    if (data && data.length > 0) {
        maxPrice = data[0].compare_at_price;
    }

    if (slider) {
        slider.max = maxPrice;
        slider.value = maxPrice;
        priceLimit = maxPrice;
        updateSliderLabel(maxPrice);
        setTimeout(() => updateSliderLabel(maxPrice), 100);
    }
}

function initPriceSlider() {
    const slider = document.getElementById('priceSlicer');
    if (!slider) return;

    slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        updateSliderLabel(val);
    });

    slider.addEventListener('change', (e) => {
        const val = parseInt(e.target.value);
        priceLimit = val;
        applyFilters();
    });
}

function updateSliderLabel(val) {
    const label = document.getElementById('priceValue');
    const slider = document.getElementById('priceSlicer');

    if (label) {
        label.innerText = `$${parseInt(val).toLocaleString('es-CO')}`;
    }

    if (slider) {
        const min = parseFloat(slider.min) || 0;
        const max = parseFloat(slider.max) || 1000000;
        if (max === min) return;
        const percentage = ((val - min) / (max - min)) * 100;
        slider.style.setProperty('--progress', `${percentage}%`);
    }
}

/// supabaseClient - CARGA DE CATEGORÍAS ///
async function loadCategories() {
    const container = document.getElementById('categoriesContainer');
    if (!supabaseClient) return;

    const { data: allCats, error } = await window._supabaseClient.from('categories').select('*').order('display_order');
    if (error) return;

    localCategories = allCats;

    const colors = ['#00F5FF', '#84cc16', '#a855f7', '#ec4899', '#FFBC00'];
    const parents = allCats.filter(c => !c.parent_id);
    const children = allCats.filter(c => c.parent_id);

    container.innerHTML = parents.map((parent, index) => {
        const myColor = colors[index % colors.length];
        const myChildren = children.filter(c => c.parent_id === parent.id);

        const level2HTML = myChildren.map(child => {
            const grandChildren = allCats.filter(c => c.parent_id === child.id);

            if (grandChildren.length > 0) {
                const level3HTML = grandChildren.map(gc =>
                    `<li onclick="filterByCategory(${gc.id}, event)">${gc.name}</li>`
                ).join('');

                return `
                <li>
                    <div class="has-children" onclick="toggleSubmenu(this)">
                        <span>${child.name}</span>
                        <i class='bx bx-chevron-down'></i>
                    </div>
                    <ul class="submenu-level-3">${level3HTML}</ul>
                </li>`;
            } else {
                return `<li onclick="filterByCategory(${child.id}, event)">${child.name}</li>`;
            }
        }).join('');

        return `
        <div class="geek-card" style="--card-color: ${myColor}">
            <div class="content">
                <h2>${parent.name}</h2>
                <ul>${level2HTML}</ul>
                <a onclick="filterByCategory(${parent.id}, event)">VER TODO</a>
            </div>
        </div>`;
    }).join('');
}

window.toggleSubmenu = function (element) {
    event.stopPropagation();
    const submenu = element.nextElementSibling;
    if (submenu) {
        submenu.classList.toggle('active');
        element.classList.toggle('toggle-active');
    }
};

window.filterByCategory = (identifier, e) => {
    if (e) e.stopPropagation();

    // 🔍 LIMPIAR BÚSQUEDA AL FILTRAR POR CATEGORÍA
    activeSearchQuery = '';

    // Restaurar título
    const pageTitle = document.querySelector('.arsenal-title');
    if (pageTitle) {
        pageTitle.innerHTML = 'ARSENAL GEEK';
    }

    if (typeof identifier === 'number') {
        activeCategoryId = identifier;
        const categoryObj = localCategories.find(c => c.id === identifier);
        if (categoryObj) {
            activeCategory = categoryObj.name;
        }
    } else {
        activeCategory = identifier;
        activeCategoryId = null;
    }

    console.log(`🔎 Filtro de categoría. ID: ${activeCategoryId} | Nombre: ${activeCategory}`);
    applyFilters();
}

async function loadProducts() {
    const grid = document.getElementById('productsGrid');

    const { data, error } = await supabaseClientClient
        .from('products')
        .select(`*, categories(name), product_colors(*)`)
        .eq('is_published', true)
        .order('display_order', { ascending: true });

    if (error) {
        grid.innerHTML = `<div class="error-msg">❌ Error crítico en sensores: ${error.message}</div>`;
        console.error("supabaseClient Error:", error);
        return;
    }

    localProducts = data;
    applyFilters();
}

/// RENDERIZADOR ///
function renderProducts(productsList) {
    const grid = document.getElementById('productsGrid');
    const pagination = document.getElementById('paginationControls');

    if (!grid) return;

    if (!productsList || productsList.length === 0) {
        grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:3rem; color:#888;">
            <i class='bx bx-radar' style="font-size:3rem; margin-bottom:1rem; color:var(--primary-purple);"></i><br>
            <span style="font-family:'Orbitron'">NO SE ENCONTRARON ARTEFACTOS</span>
            ${activeSearchQuery ? `<p style="margin-top:1rem; color:#94a3b8;">Intenta con otro término de búsqueda</p>` : ''}
        </div>`;
        if (pagination) pagination.innerHTML = '';
        return;
    }

    grid.innerHTML = productsList.map(p => {
        const backUrl = p.card_back_url ? p.card_back_url : null;
        const middleImg = p.card_middle_url || p.image_url || 'images/placeholder.png';
        const frontImgLayer = p.card_front_url
            ? `<div class="full-layer layer-front"><img src="${p.card_front_url}" alt="${p.name}-front"></div>`
            : '';

        return `
        <div class="monster-card" onclick="openProductView(${p.id})">
            <div class="card-bg" style="${backUrl ? `background-image: url('${backUrl}')` : 'background: radial-gradient(#2a2a40, #0f0f1a)'}"></div>
            <div class="full-layer layer-middle">
                <img src="${middleImg}" alt="${p.name}-middle">
            </div>
            ${frontImgLayer}
            
            <div class="card-info-overlay">
                <div class="info-separator"></div>
                <div class="info-footer-compact">
                    <div class="price-tag-compact">
                        <span class="currency">$</span>${p.compare_at_price.toLocaleString('es-CO')}
                    </div>
                    
                    <button class="add-btn-glass" onclick="event.stopPropagation(); addToCartFromGrid(${p.id})">
                        <i class='bx bx-plus'></i>
                    </button>
                </div>
            </div>
            <div class="card-border"></div>
        </div>`;
    }).join('');

    if (pagination) {
        pagination.innerHTML = productsList.length >= 12
            ? `<button class="load-more-btn">DESPLEGAR MÁS <i class='bx bx-chevron-down'></i></button>`
            : '';
    }
}

/// 🔍 FILTROS MEJORADOS CON BÚSQUEDA ///
window.resetFilters = () => {
    activeCategory = 'all';
    activeCategoryId = null;
    activeSearchQuery = ''; // 🔍 LIMPIAR BÚSQUEDA

    // Restaurar título
    const pageTitle = document.querySelector('.arsenal-title');
    if (pageTitle) {
        pageTitle.innerHTML = 'ARSENAL GEEK';
    }

    const slider = document.getElementById('priceSlicer');
    if (slider) {
        slider.value = slider.max;
        priceLimit = parseInt(slider.max);
        updateSliderLabel(priceLimit);
    }
    applyFilters();
};

function applyFilters() {
    const grid = document.getElementById('productsGrid');
    const pagination = document.getElementById('paginationControls');

    // CASO ESPECIAL: Zylox Secret
    if (activeCategory.toLowerCase().includes('zylox secret')) {
        if (pagination) pagination.innerHTML = '';
        if (grid) {
            grid.innerHTML = `
            <div style="grid-column: 1 / -1; display: flex; justify-content: center; align-items: center; min-height: 400px; animation: fadeIn 0.5s ease;">
                <div style="text-align: center; max-width: 600px;">
                    <img src="https://res.cloudinary.com/degcddlab/image/upload/v1765431034/Zylox_Secret_nrhggu.png" 
                        alt="ACCESO DENEGADO" 
                        style="width: 100%; height: auto; border-radius: 10px; border: 2px solid var(--primary-purple); box-shadow: 0 0 30px rgba(168, 85, 247, 0.4);">
                    <h2 style="font-family: 'Orbitron'; color: #ff4444; margin-top: 40px; letter-spacing: 2px;">
                        <i class='bx bx-error-circle bx-tada'></i> ZONA RESTRINGIDA
                    </h2>
                </div>
            </div>`;
        }
        return;
    }

    // 🔍 FILTRADO CON BÚSQUEDA
    const filtered = localProducts.filter(p => {
        // A. Precio
        const passPrice = p.compare_at_price <= priceLimit;

        // B. 🔍 BÚSQUEDA (PRIORIDAD MÁXIMA)
        let passSearch = true;
        if (activeSearchQuery) {
            const query = activeSearchQuery.toLowerCase();
            const name = (p.name || '').toLowerCase();
            const desc = (p.description || '').toLowerCase();
            const legend = (p.legend || '').toLowerCase();

            passSearch = name.includes(query) || desc.includes(query) || legend.includes(query);
        }

        // C. Categoría (solo si NO hay búsqueda activa)
        let passCat = true;
        if (activeCategory !== 'all' && !activeSearchQuery) {
            if (activeCategoryId !== null) {
                let validIds = [String(activeCategoryId)];
                const children = localCategories.filter(c => c.parent_id === activeCategoryId);
                children.forEach(child => {
                    validIds.push(String(child.id));
                    const grandChildren = localCategories.filter(gc => gc.parent_id === child.id);
                    grandChildren.forEach(gc => validIds.push(String(gc.id)));
                });
                const prodCatId = p.category_id ? String(p.category_id) : 'null';
                passCat = validIds.includes(prodCatId);
            } else {
                const pCatName = p.categories ? p.categories.name : '';
                passCat = pCatName.toLowerCase().includes(activeCategory.toLowerCase());
            }
        }

        return passPrice && passSearch && passCat;
    });

    console.log(`🔍 Filtros aplicados. Resultados: ${filtered.length}`);
    renderProducts(filtered);
}

/// MODAL DE DETALLE ///
window.openProductView = async function (id) {
    selectedColorName = "Base";
    document.getElementById('productModal').classList.add('active');
    document.getElementById('pmTitle').innerText = "RECUPERANDO DATOS...";

    const { data, error } = await supabaseClientClient.rpc('get_product_full_detail', { p_id: id });

    if (error || !data) {
        console.error("Fallo crítico en DB:", error);
        return;
    }

    modalProduct = data;

    document.getElementById('pmTitle').innerText = modalProduct.name;
    document.getElementById('pmLegend').innerText = modalProduct.legend || "";
    document.getElementById('pmDescription').innerText = modalProduct.description || "Datos clasificados.";
    document.getElementById('pmPrice').innerText = modalProduct.compare_at_price.toLocaleString('es-CO');

    renderStockStatus(modalProduct.stock_quantity);
    renderColorSelector();
    document.getElementById('pmQty').value = 1;
};

function renderStockStatus(qty) {
    const rect1 = document.getElementById('stockRect1');
    const rect2 = document.getElementById('stockRect2');
    const rect3 = document.getElementById('stockRect3');
    const text = document.getElementById('pmStockText');

    [rect1, rect2, rect3].forEach(r => r.className = 'stock-rect');

    if (qty <= 0) {
        text.innerText = "AGOTADO";
        text.style.color = "#ff4444";
        rect1.classList.add('critical');
    } else if (qty < 10) {
        text.innerText = "ÚLTIMAS UNIDADES";
        text.style.color = "#ffbb33";
        rect1.classList.add('warning');
        rect2.classList.add('warning');
    } else {
        text.innerText = "EN ARSENAL";
        text.style.color = "#00C851";
        rect1.classList.add('optimal');
        rect2.classList.add('optimal');
        rect3.classList.add('optimal');
    }
}

function renderColorSelector() {
    const container = document.getElementById('pmColorOptions');
    container.innerHTML = '';

    const colors = (modalProduct.colors && modalProduct.colors.length > 0)
        ? modalProduct.colors
        : [{ id: null, name: 'Base', hex: '#fdddca' }];

    colors.forEach((color, idx) => {
        const dot = document.createElement('div');
        dot.className = 'color-dot';
        dot.style.backgroundColor = color.hex;
        dot.title = color.name;
        dot.onclick = () => selectColor(color, dot);
        container.appendChild(dot);
        if (idx === 0) dot.click();
    });
}

function selectColor(colorObj, dotElement) {
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    dotElement.classList.add('active');
    selectedColorName = colorObj.name;
    const labelColor = document.getElementById('pmColorName');
    if (labelColor) labelColor.innerText = colorObj.name;

    let media = [];
    if (modalProduct.media) {
        const specific = modalProduct.media.filter(m => m.color_id === colorObj.id);
        const generic = modalProduct.media.filter(m => m.color_id === null);
        media = specific.length > 0 ? specific : generic;
    }

    if (media.length === 0) {
        media.push({ url: modalProduct.card_middle_url || 'images/placeholder.png', type: 'image' });
    }

    currentCarouselMedia = media;
    carouselIndex = 0;
    updateCarouselDisplay();
}

function updateCarouselDisplay() {
    const track = document.getElementById('pmCarouselTrack');
    track.innerHTML = '';
    currentCarouselMedia.forEach(item => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        const img = document.createElement('img');
        img.src = item.url;
        slide.appendChild(img);
        track.appendChild(slide);
    });
    moveCarousel(0);
}

window.moveCarousel = function (direction) {
    if (currentCarouselMedia.length === 0) return;
    carouselIndex += direction;
    if (carouselIndex < 0) carouselIndex = currentCarouselMedia.length - 1;
    if (carouselIndex >= currentCarouselMedia.length) carouselIndex = 0;
    const track = document.getElementById('pmCarouselTrack');
    track.style.transform = `translateX(-${carouselIndex * 100}%)`;
};

window.closeProductModal = function () {
    document.getElementById('productModal').classList.remove('active');
};

window.changeQty = function (delta) {
    const input = document.getElementById('pmQty');
    let val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    input.value = val;
};

window.addToCartFromModal = function () {
    const qty = parseInt(document.getElementById('pmQty').value);

    if (window.addToCart && modalProduct) {
        const productToSend = {
            ...modalProduct,
            selected_color: selectedColorName
        };

        addToCart(productToSend, qty);
        closeProductModal();
    } else {
        console.error("Error: Función addToCart no encontrada.");
    }
};

window.addToCartFromGrid = function (id) {
    const productObj = localProducts.find(p => p.id === id);
    if (productObj && window.addToCart) {
        console.log(`📦 Añadiendo desde Grid: ${productObj.name}`);
        addToCart(productObj, 1);
    } else {
        console.error("❌ Error: Artefacto no encontrado en memoria local.");
    }
};