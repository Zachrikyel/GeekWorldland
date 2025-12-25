/// VARIABLES ///
document.addEventListener('DOMContentLoaded', () => {
    // Detectar si estamos en la Home
    const isHomePage = document.querySelector('.access-levels-section');

    if (isHomePage) {
        console.log("🏠 Lógica Home Activada");

        // 1. Iniciar Lógicas Interactivas
        initHomeInteractions(); // Flip cards y Mini carruseles
        initReviewsCarousel();  // Reviews 3D
        initContactLogic();
        initDynamicFolders();
    }
});

/// MINI CARRUSEL ///
function initGroupCarousel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const track = container.querySelector('.mini-track');
    const nextBtn = container.querySelector('.next-btn');
    const prevBtn = container.querySelector('.prev-btn');
    const slides = container.querySelectorAll('.group-slide');
    const totalSlides = slides.length;

    let currentIndex = 0;

    if (!track || !nextBtn || !prevBtn || totalSlides === 0) return;

    const moveSlide = (direction) => {
        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % totalSlides;
        } else {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        }
        const displacement = -(currentIndex * 100);
        track.style.transform = `translateX(${displacement}%)`;
    };

    // AUTO PLAY LOGIC 
    const startAuto = () => { autoRun = setInterval(() => moveSlide('next'), 4000); };
    const stopAuto = () => { clearInterval(autoRun); };

    startAuto(); // Iniciar
    // Pausar si el usuario pasa el mouse
    container.addEventListener('mouseenter', stopAuto);
    container.addEventListener('mouseleave', startAuto);

    // Reasignar eventos limpios
    const newNext = nextBtn.cloneNode(true);
    const newPrev = prevBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);
    prevBtn.parentNode.replaceChild(newPrev, prevBtn);

    newNext.addEventListener('click', () => moveSlide('next'));
    newPrev.addEventListener('click', () => moveSlide('prev'));

}

/// INTERACCIONES HOME ///
function initHomeInteractions() {
    // 1. Inicializar Flip Cards (FAQ)
    const specialCards = document.querySelectorAll('.special-card');
    specialCards.forEach(card => {
        // Clonar para limpiar eventos viejos por si acaso
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);

        newCard.addEventListener('click', function () {
            this.classList.toggle('flipped');
        });
    });

    // 2. Inicializar Mini Carruseles (Niveles de Acceso)
    setTimeout(() => {
        initGroupCarousel('carousel-aliado');
        initGroupCarousel('carousel-creador');
    }, 100);
}

/// CATEGORIAS ///
async function initDynamicFolders() {
    const container = document.getElementById('dynamic-folders-container');
    if (!container) return;

    // CONFIGURACIÓN
    const MAX_SUBS_DISPLAY = 3;

    // 1. MAPA DE ESTILOS
    const styleMap = {
        'arkedia': {
            color: 'purple', icon: 'bx bxs-joystick',
            imgs: ['https://res.cloudinary.com/degcddlab/image/upload/v1765670087/Arkedia_2_cmp28r.png', 'https://res.cloudinary.com/degcddlab/image/upload/v1765670087/Arkedia_1_o0wozf.png', 'https://res.cloudinary.com/degcddlab/image/upload/v1765670087/Arkedia_3_bxdav7.png']
        },
        'adn-626': {
            color: 'green', icon: 'bx bxs-invader',
            imgs: ['https://res.cloudinary.com/degcddlab/image/upload/v1765671749/ADN_-626_2_gizbas.png', 'https://res.cloudinary.com/degcddlab/image/upload/v1765671751/ADN_-626_3_eez200.png', 'https://res.cloudinary.com/degcddlab/image/upload/v1765671746/ADN_-626_1_igmvga.png']
        },
        'gadgets-espaciales': {
            color: 'cyan', icon: 'bx bxs-home-heart',
            imgs: ['https://res.cloudinary.com/degcddlab/image/upload/v1765671206/Gadgets_Espaciales_1_olzxxz.png', 'https://res.cloudinary.com/degcddlab/image/upload/v1765671205/Gadgets_Espaciales_3_fnvdoy.png', 'https://res.cloudinary.com/degcddlab/image/upload/v1765671205/Gadgets_Espaciales_2_mibwzq.png']
        },
        'game-kom': {
            color: 'orange', icon: 'fa-solid fa-khanda',
            imgs: ['https://res.cloudinary.com/degcddlab/image/upload/v1765669605/Portales_de_juegos_2_ihsgvc.png', 'https://res.cloudinary.com/degcddlab/image/upload/v1765669606/Portales_de_juegos_1_ehpdkz.png', 'https://res.cloudinary.com/degcddlab/image/upload/v1765669605/Portales_de_juegos_3_k2zy7n.png']
        },
        'zylox-secret': {
            color: 'pink', icon: 'bx bxs-star',
            imgs: ['https://res.cloudinary.com/degcddlab/image/upload/v1765671965/Zylox_Secret_1_rfkiri.png', 'https://res.cloudinary.com/degcddlab/image/upload/v1765671965/Zylox_Secret_1_rfkiri.png', 'https://res.cloudinary.com/degcddlab/image/upload/v1765671965/Zylox_Secret_1_rfkiri.png']
        },
        'default': {
            color: 'pink', icon: 'bx bxs-star',
            imgs: ['https://res.cloudinary.com/degcddlab/image/upload/v1765671965/Zylox_Secret_1_rfkiri.png', 'https://res.cloudinary.com/degcddlab/image/upload/v1765671965/Zylox_Secret_1_rfkiri.png', 'https://res.cloudinary.com/degcddlab/image/upload/v1765671965/Zylox_Secret_1_rfkiri.png']
        }
    };

    // 2. CONSULTA DB
    const { data: allCategories, error } = await window.supabaseClient
        .from('categories')
        .select('id, name, slug, parent_id, display_order, description')
        .order('display_order', { ascending: true });

    if (error) {
        console.error("Error crítico:", error);
        container.innerHTML = `<p style="color:red; text-align:center;">Error de conexión.</p>`;
        return;
    }

    const parents = allCategories.filter(cat => cat.parent_id === null);

    // 3. RENDERIZADO
    container.innerHTML = parents.map(parent => {
        const style = styleMap[parent.slug] || styleMap['default'];
        const children = allCategories.filter(cat => cat.parent_id === parent.id);

        let subCatsText = "";

        if (children.length > 0) {
            // A. Tomamos solo los primeros X elementos
            const visibleChildren = children.slice(0, MAX_SUBS_DISPLAY);

            // B. Creamos la cadena de texto base (Ej: "Docks • Juegos • Cables")
            subCatsText = visibleChildren.map(c => c.name).join(' • ');

            // C. Calculamos si sobraron elementos
            const remainingCount = children.length - MAX_SUBS_DISPLAY;

            // D. Si sobran, agregamos el indicador "+X"
            if (remainingCount > 0) {
                subCatsText += ` • +${remainingCount}`; // Quedaría: "Docks • Juegos • Cables • +2"
            }
        } else {
            subCatsText = parent.description || "Explorar Colección";
        }

        return `
        <div class="glass-folder" onclick="location.href='Arsenal-Geek.html?cat=${parent.slug}'">
            <div class="folder-back bg-${style.color}-dark">
                <div class="folder-tab"></div>
            </div>
            
            <div class="folder-images">
                <img src="${style.imgs[0]}" class="f-img f-img-1" alt="">
                <img src="${style.imgs[1]}" class="f-img f-img-2" alt="">
                <img src="${style.imgs[2]}" class="f-img f-img-3" alt="">
            </div>
            
            <div class="folder-front glass-${style.color}">
                <div class="folder-info">
                    <div class="mini-logo"><i class='${style.icon}'></i></div>
                    <span class="folder-name">${parent.name.toUpperCase()}</span>
                </div>
            </div>
            
            <div class="folder-content-list border-${style.color}">
                ${subCatsText}
            </div>
        </div>
        `;
    }).join('');
}

/// TRANSMISIONES TERRICOLAS ///
async function initReviewsCarousel() {
    const container = document.getElementById('reviewsCarousel');
    if (!container) return;

    const { data: reviewsData, error } = await window.supabaseClient
        .from('reviews')
        .select(`
            rating,
            comment,
            title,
            users (username),
            products (name, card_middle_url)
        `)
        .gte('rating', 4)
        .order('created_at', { ascending: false })
        .limit(5);

    console.log("📡 DATOS CRUDOS DE supabaseClient:", reviewsData);

    if (error) {
        console.error("Error en la transmisión de datos:", error);
        return;
    }

    let reviews = [];

    if (reviewsData && reviewsData.length > 0) {
        reviews = reviewsData.map(r => ({
            name: r.users?.username || "Agente Anónimo",
            title: r.title || "Opinión Clasificada",
            text: r.comment,
            stars: r.rating,
            product: r.products?.name || "Artefacto Desconocido",
            productImage: r.products?.card_middle_url || "",
            image: r.products?.card_middle_url || null
        }));
    } else {
        reviews = [
            { name: "Sistema", title: "Esperando datos", text: "Sin transmisiones recientes.", stars: 5, product: "GeekWorland" }
        ];
    }

    // 2. CONFIGURACIÓN FÍSICA DEL CARRUSEL (INTACTA)
    const cellCount = reviews.length;
    const radius = 280; // Mantenemos tu radio original
    const theta = 360 / cellCount;
    let currentAngle = 0;

    // 3. RENDERIZADO DE LAS TARJETAS (AQUÍ REUBICAMOS EL PRODUCTO)
    container.innerHTML = reviews.map((r, i) => {
        const angle = theta * i;

        // --- 🟢 PREPARACIÓN DE LA IMAGEN DE FONDO (TU CÓDIGO) ---
        let bgImageHTML = '';
        if (r.image) {
            bgImageHTML = `
            <div style="
                position: absolute;
                top: 200px; /* ⬆️ LA SUBIMOS: Empieza cerca del avatar */
                left: 0;
                width: 100%;
                height: 380px; /* ⬆️ TAMAÑO GIGANTE */
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 0; /* 📉 Se queda en el fondo */
                pointer-events: none; /* Para que no moleste al click */
                opacity: 0.85; /* Un poco transparente para no pelear con el texto */
                ">
                
                <img src="${r.image}" alt="Fondo Producto" style="
                    height: 100%; 
                    width: auto; 
                    object-fit: contain; 
                    filter: drop-shadow(0 0 20px rgba(57, 255, 20, 0.2));
                ">
            </div>
            `;
        }

        return `
        <div class="review-cell" style="transform: rotateY(${angle}deg) translateZ(${radius}px);">
            
            ${bgImageHTML}

            <div style="width: 100%; position: relative; z-index: 2; margin-bottom: 20px;">
                <div class="review-img" style="
                    display:flex; justify-content:center; align-items:center; 
                    background: linear-gradient(135deg, #000, #1a1a1a); 
                    font-size:2rem; border-radius:50%; 
                    width:90px; height:90px; 
                    margin:0 auto 10px auto; 
                    border: 2px solid #00F5FF; 
                    box-shadow: 0 0 15px rgba(0, 245, 255, 0.3);">
                    ${r.name.charAt(0).toUpperCase()}
                </div>
                
                <h3 class="review-name" style="margin: 0; font-size: 1.3rem; text-shadow: 0 2px 5px black;">${r.name}</h3>
                <h4 style="font-size: 0.9rem; color: #00F5FF; font-weight:normal; letter-spacing:1px; text-shadow: 0 2px 5px black;">${r.title}</h4>
            </div>
            
            <div style="
                flex: 1; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                position: relative; 
                z-index: 2; 
                padding: 0;
                margin-top: -10px; /* Tu ajuste agresivo */
                ">
                
                <p class="review-text" style="
                    font-size: 1rem; 
                    line-height: 1.5; 
                    font-weight: 500;
                    font-style: italic; 
                    color: #fff; 
                    text-shadow: 0 2px 8px #000, 0 0 2px #000;
                    display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden;">
                    "${r.text}"
                </p>
            </div>

            <div class="review-stars" style="
                position: relative; 
                z-index: 2;
                color: #FFD700; 
                font-size: 1.8rem; 
                text-shadow: 0 2px 5px black;
                margin-top: -10px;  /* 🎛️ CONTROL 1: Separación del texto */
                margin-bottom: 300px; /* Empuja espacio vacío hacia abajo */
            ">${'★'.repeat(r.stars)}</div>
            
            <div class="review-product" style="
                position: absolute; /* ⚓ ANCLAJE ABSOLUTO */
                bottom: 20px;       /* 📍 Siempre a 20px del borde inferior */
                left: 50%;          /* Centrado Horizontal - Paso 1 */
                transform: translateX(-50%); /* Centrado Horizontal - Paso 2 */
                width: 90%;         /* Ancho de la caja */
                
                z-index: 2;
                font-size: 0.85rem; 
                color: #39FF14; 
                opacity: 1; 
                font-weight: bold;
                text-transform: uppercase; 
                letter-spacing: 1px; 
                background: rgba(0,0,0,0.6); 
                padding: 12px;
                border-radius: 10px;
                border: 1px solid rgba(57, 255, 20, 0.3);
            ">
                <i class='bx bx-purchase-tag-alt'></i> ${r.product}
            </div>

        </div>
        `;
    }).join('');

    // 4. LÓGICA DE ROTACIÓN (INTACTA)
    const rotateCarousel = () => {
        container.style.transform = `translateZ(-${radius}px) rotateY(${currentAngle}deg)`;
    };

    const nextBtn = document.getElementById('nextReview');
    const prevBtn = document.getElementById('prevReview');

    // Clonamos nodos para limpiar listeners viejos (Buena práctica)
    if (nextBtn) {
        const newNext = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);
        newNext.addEventListener('click', () => {
            currentAngle -= theta;
            rotateCarousel();
        });
    }

    if (prevBtn) {
        const newPrev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        newPrev.addEventListener('click', () => {
            currentAngle += theta;
            rotateCarousel();
        });
    }

    // Iniciar rotación inicial
    rotateCarousel();

    // 5. EJECUTAR FUNCIONES ADICIONALES (Rating Global y Botón)
    calculateGlobalRating();
    setupReviewModalTrigger();
}

async function calculateGlobalRating() {
    const container = document.getElementById('global-rating-container');
    if (!container) return;

    // Pedimos SOLO el rating de TODAS las reseñas (para ser precisos en el promedio)
    const { data: allRatings, error } = await window.supabaseClient
        .from('reviews')
        .select('rating');

    if (error || !allRatings || allRatings.length === 0) {
        container.innerHTML = `<span style="font-size:0.8rem; color:#888;">Sin datos</span>`;
        return;
    }

    const totalReviews = allRatings.length;
    const sumStars = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const avgStars = sumStars / totalReviews; // Ej: 4.4
    const scoreOutOfTen = (avgStars * 2).toFixed(1); // Convertimos 5 estrellas a base 10 (Ej: 8.8)

    // Lógica de etiqueta
    let label = "Good";
    if (scoreOutOfTen >= 9) label = "Legendary";
    else if (scoreOutOfTen >= 8) label = "Excellent";
    else if (scoreOutOfTen >= 7) label = "Great";

    // Inyección HTML
    container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; padding: 8px 20px; border-radius: 12px; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 15px rgba(0, 245, 255, 0.15);">
            <span style="font-family: 'Orbitron'; font-size: 2rem; font-weight: bold; color: #B026FF;">${scoreOutOfTen}</span>
            <div style="display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2;">
                <span style="font-weight: bold; color: #39FF14; text-transform: uppercase; font-size: 1.5rem;">${label}</span>
                <span style="font-size: 0.9rem; color: #CCC;">Basado en ${totalReviews} Evaluaciones</span>
            </div>
        </div>
    `;
}

function setupReviewModalTrigger() {
    // 1. Buscamos TODOS los botones que tengan la clase .js-open-review-modal
    const btns = document.querySelectorAll('.js-open-review-modal');

    btns.forEach(btn => {
        // 2. Clonamos el botón para eliminar cualquier evento "viejo" (como el de Próximamente)
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        // 3. Asignamos el evento CORRECTO: Abrir el modal
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("🛰️ Iniciando protocolo de reseña...");
            openReviewModal(); // <--- ESTO ES LO IMPORTANTE
        });
    });
}

// Inicializar al cargar el documento
document.addEventListener('DOMContentLoaded', initReviewsCarousel);

/// MODAL DE CONTACTO ///
window.openContactModal = function (type) {
    const modal = document.getElementById('contactModal');
    if (modal) modal.classList.add('active');
};

window.closeContactModal = function () {
    const modal = document.getElementById('contactModal');
    if (modal) modal.classList.remove('active');
};

/// LOGICA ABDUCION ///
function initContactLogic() {
    const ufoBtn = document.getElementById('ufoSubmitBtn');
    const ufoWrapper = document.querySelector('.ufo-button-wrapper');
    const modalContext = document.getElementById('contactModal');

    // Verificación de seguridad
    if (!modalContext || !ufoBtn || !ufoWrapper) return;

    // Clonar botón para limpiar eventos previos
    const newBtn = ufoBtn.cloneNode(true);
    ufoBtn.parentNode.replaceChild(newBtn, ufoBtn);

    newBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        // 1. CAPTURAR ELEMENTOS (Estrategia sin IDs)
        const textInputs = modalContext.querySelectorAll('input[type="text"].inline-input');
        const emailInput = modalContext.querySelector('input[type="email"]');
        const phoneInput = modalContext.querySelector('input[type="tel"]');
        const textAreas = modalContext.querySelectorAll('textarea.inline-textarea');

        // 2. OBTENER Y LIMPIAR VALORES
        const nameVal = textInputs[0]?.value.trim() || "";
        const locVal = textInputs[1]?.value.trim() || "";
        const dreamVal = textAreas[0]?.value.trim() || "";
        const detailsVal = textAreas[1]?.value.trim() || "";
        const emailVal = emailInput?.value.trim() || "";

        // --- 🟢 LÓGICA AUTOMÁTICA COLOMBIA (+57) ---
        let rawPhone = phoneInput?.value.trim() || "";

        // A. Quitamos espacios en blanco y guiones para limpiar
        rawPhone = rawPhone.replace(/[\s-]/g, '');

        // B. Si el usuario escribió "+57" o "57" al inicio, lo quitamos para no duplicar
        if (rawPhone.startsWith('+57')) {
            rawPhone = rawPhone.substring(3);
        } else if (rawPhone.startsWith('57')) {
            rawPhone = rawPhone.substring(2);
        }

        // C. Formateamos: Siempre agregamos el +57 limpio
        // Resultado final: "+57 3001234567"
        const phoneFinal = rawPhone ? `+57 ${rawPhone}` : "No registrado";

        // 3. VALIDACIÓN
        if (!nameVal || !dreamVal || !emailVal) {
            if (typeof showNotification === 'function') {
                showNotification("⚠️ Faltan datos: Nombre, Sueño o Email.");
            } else {
                showNotification("Completa los campos principales para enviar.");
            }
            return;
        }

        if (typeof showNotification === 'function') showNotification("📡 Procesando Carta Zylox...");

        // 4. CONSTRUIR EL MENSAJE
        const fullMessage = `
📍 Ubicación: ${locVal}
💭 El Sueño: ${dreamVal}
✨ Detalles: ${detailsVal}
📞 Teléfono: ${phoneFinal}
        `.trim();

        try {
            // 5. INTENTO 1: GUARDAR EN supabaseClient
            const { error: dbError } = await window.supabaseClient
                .from('contact_messages')
                .insert([{
                    name: nameVal,
                    email: emailVal,
                    message: fullMessage
                }]);

            if (dbError) {
                console.error("🔴 Error Guardando en DB:", dbError.message);
                // No detenemos el proceso, intentamos enviar el correo igual
            } else {
                console.log("✅ Backup en DB exitoso");
            }

            // 6. INTENTO 2: ENVIAR EMAIL (EmailJS)
            // ¡IMPORTANTE! Revisa que estos IDs sean los reales de tu cuenta EmailJS
            const serviceID = 'service_0b8l6i8';  // <-- ¿Cambiaste esto?
            const templateID = 'template_ks4b5ah'; // <-- ¿Cambiaste esto?

            await emailjs.send(serviceID, templateID, {
                from_name: nameVal,
                reply_to: emailVal,
                message: fullMessage,
                to_email: 'WeekworlandGY@gmail.com'
            });

            // 7. ÉXITO TOTAL (Si el correo se envió)
            ufoWrapper.classList.add('active-ufo');
            if (typeof showNotification === 'function')
                showNotification("🐮 ¡Vaca - Mensaje abducida con éxito! 🛸");

            setTimeout(() => {
                ufoWrapper.classList.remove('active-ufo');

                // Limpiar campos
                if (textInputs[0]) textInputs[0].value = '';
                if (textInputs[1]) textInputs[1].value = '';
                if (textAreas[0]) textAreas[0].value = '';
                if (textAreas[1]) textAreas[1].value = '';
                if (emailInput) emailInput.value = '';
                if (phoneInput) phoneInput.value = '';

                if (typeof closeContactModal === 'function') closeContactModal();
            }, 6000);

        } catch (err) {
            console.error("🔴 ERROR CRÍTICO:", err);

            // Diagnóstico para ti en consola
            if (err.text) console.error("Detalle EmailJS:", err.text);

            if (typeof showNotification === 'function')
                showNotification("❌ Error de transmisión.");
            else
                showNotification("Error al enviar. Verifica tu conexión.");
        }
    });

}

// ============================================
// ⭐ SISTEMA DE RESEÑAS & AVATAR ZYLOX (VERSIÓN FULL)
// ============================================

// --- 1. CONSTANTES DE ANIMACIÓN (Vectores SVG) ---
const EYE_PATHS = [
    "M175.4,75.3c-12,0-23.4-0.9-33.7-2.5c-4.2,6.4-6.7,14-6.7,22.2c0,12.4,5.7,23.5,14.6,30.9c6.9,5.7,15.8,9.1,25.4,9.1c9.7,0,18.5-3.4,25.4-9.1c8.9-7.3,14.6-18.4,14.6-30.9c0-8.2-2.5-15.8-6.7-22.1C198.3,74.5,187.1,75.3,175.4,75.3z", // 0: Neutro
    "M213.3,82.3c-9.7,4-23.1,6.5-37.9,6.5s-28.2-2.5-37.9-6.5c-1.3,4-2.1,8.3-2.1,12.8c0,11,4.4,20.9,11.6,28.1c8.2-1.8,18-2.9,28.4-2.9s20.2,1.1,28.4,2.9c7.2-7.2,11.6-17.2,11.6-28.1C215.4,90.6,214.6,86.3,213.3,82.3z", // 1: Enojado
    "M215.4,95.1c0-7.4-2-14.3-5.5-20.3c-9.3,2.5-21.3,4-34.5,4s-25.1-1.5-34.5-4c-3.5,6-5.5,12.9-5.5,20.3c0,13.1,6.3,24.7,16,32c7.2-1.1,15.4-1.7,24-1.7s16.8,0.6,24,1.7C209.1,119.8,215.4,108.2,215.4,95.1z", // 2: Decepcionado
    "M152.9,128.2c6.8-0.9,14.5-1.5,22.5-1.5s15.7,0.5,22.5,1.5c10.6-7.2,17.5-19.3,17.5-33.1c0-12.8-6-24.2-15.4-31.5c-7.4,2-15.7,3.2-24.6,3.2s-17.3-1.2-24.6-3.2c-9.4,7.3-15.4,18.7-15.4,31.5C135.4,108.8,142.3,121,152.9,128.2z", // 3: Normal
    "M150.7,128.1c7.3-1.1,15.6-1.7,24.3-1.7s17,0.6,24.3,1.7c10.1-7.5,16.7-19.5,16.7-33c0-13.4-6.4-25.3-16.4-32.8c-6.9-5.2-15.4-8.2-24.6-8.2c-9.5,0-18.2,3.2-25.2,8.6c-9.6,7.5-15.8,19.2-15.8,32.4C134,108.6,140.6,120.6,150.7,128.1z", // 4: Feliz
    "M219,95.1c0,12-4.7,23-12.4,30.9c-7.9,8.1-19,13.1-31.6,13.1c-12.2,0-23.2-4.9-31.1-12.9c-8-8-12.9-19-12.9-31.1c0-13.7,6.2-25.9,16-34c7.6-6.3,17.4-10,28-10c9.9,0,19.1,3.3,26.4,8.8C212.1,67.9,219,80.7,219,95.1z"  // 5: Muy Feliz
];

const MOUTH_PATHS = [
    "M174.6,178.2h5.1H215c0,0,0.1,0,0.1,0c0,0,0,0-0.1,0h-35.3L174.6,178.2l-4.6,0.1h-35c0,0-0.1,0-0.1,0c0,0,0,0,0.1,0h35H174.6z", // 0
    "M175,172.6h7c8.9,0,16.2,6.4,17.7,14.9c0.2,1,0.3,2,0.3,3.1c0,0.8-0.5,2-2,2l-16,0h-7h-7l-16,0c-1.4,0-2-1.2-2-2c0-1,0.1-1.9,0.2-2.8c1.4-8.6,8.8-15.1,17.7-15.1H175z", // 1
    "M175,187c5.5,0,9.7-2.1,13.8-4.1c5.5-2.7,11.3-5.5,17.6-0.4c0.1,0.1,0.3,0.3,0.2,0.4c-0.1,0.1-0.3,0.1-0.4,0c-5.6-5.1-11.7-2.6-17.4,0.2c-4.2,2-7.3,4.1-13.9,4.1c-6.5,0-9-2.1-12.9-4.1c-5.1-2.8-10.6-5.8-18.6-0.6c-0.1,0-0.1,0-0.1,0c0,0,0-0.1,0.1-0.1c7.9-5.4,13.4-2.4,18.8,0.5C165.9,185,169.7,187,175,187z", // 2
    "M175,179.8c2,0,4-0.1,6-0.2c11-0.9,22-4.1,32.9-9.7c0.1,0,0.2-0.1,0.2,0c0,0.1-0.1,0.2-0.2,0.2c-11.6,6-21.7,9-33,9.7c-2,0.1-4,0.3-6,0.3c-2.3,0-4.6-0.1-6.8-0.3c-10.9-0.8-20.8-3.9-32.1-9.7c-0.1,0-0.1-0.1-0.1-0.1c0,0,0.1,0,0.2,0c10.7,5.5,21.4,8.7,32.1,9.6C170.5,179.7,172.7,179.8,175,179.8z", // 3
    "M174.8,172.6h10H200l0,4.9c0,1.4-0.2,2.7-0.6,4c-1.8,5.9-7.5,10.1-14.3,10.1h-10.4h-9.9c-6.7,0-12.3-4.2-14.2-9.9c-0.4-1.3-0.7-2.7-0.7-4.2v-4.9h14.3H174.8z", // 4
    "M175,165.6h4.8l23.3,0c5.6,0,8.9,4.7,8.9,8.9c0,3-0.4,6-1.2,8.7c-3.8,14-16.7,24.3-31.9,24.3H175h-3.9c-15.5,0-28.6-10.7-32.1-25.2c-0.6-2.5-0.9-5.2-0.9-7.9c0-5,4.1-8.9,8.9-8.9l23.9,0H175z" // 5
];

let selectedProductForReview = null;
let currentRatingValue = 0;

// --- 2. INICIALIZACIÓN UI (Punto de Entrada) ---
async function initReviewsUI() {
    const container = document.getElementById('review-action-container');
    if (!container) return;

    // Verificar Sesión
    const { data: { user } } = await window.supabaseClient.auth.getUser();

    if (user) {
        // === USUARIO LOGUEADO: Consola Holográfica ===
        container.style.display = 'block';
        container.innerHTML = `
            <div class="transmission-deck">
                <div class="deck-info">
                    <div class="deck-title">
                        <span class="deck-status active"></span>
                        CANAL DE TRANSMISIÓN: ABIERTO
                    </div>
                    <div class="deck-desc">
                        Agente, el cuartel espera tu reporte de los artefactos completados.
                    </div>
                </div>
                <button class="deck-btn js-open-review-modal">
                    <i class='bx bxs-satellite'></i> INICIAR REPORTE
                </button>
            </div>
        `;
        // IMPORTANTE: Activamos el listener del botón recién creado
        setupReviewModalTrigger();
    } else {
        // === VISITANTE: Panel Cyan (Login) ===
        container.style.display = 'block';
        container.innerHTML = `
            <div class="transmission-deck visitor">
                <div class="deck-info">
                    <div class="deck-title">
                        <span class="deck-status"></span>
                        SEÑAL CIFRADA DETECTADA...
                    </div>
                    <div class="deck-desc">
                        Identifícate para desbloquear el canal de reseñas del Geekverse.
                    </div>
                </div>
                <button class="deck-btn" onclick="openLoginModal()">
                    <i class='bx bxs-id-card'></i> IDENTIFICARSE
                </button>
            </div>
        `;
    }
}

// --- 3. ACTIVAR GATILLOS DEL MODAL (FUNCIÓN QUE FALTABA) ---
function setupReviewModalTrigger() {
    // Busca botones con la clase especifica
    const btns = document.querySelectorAll('.js-open-review-modal');

    btns.forEach(btn => {
        // Clonar para limpiar eventos previos (si los hubiera)
        const newBtn = btn.cloneNode(true);
        if (btn.parentNode) {
            btn.parentNode.replaceChild(newBtn, btn);
        }

        // Asignar el evento correcto
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("🛰️ Iniciando protocolo de reseña...");
            openReviewModal();
        });
    });
}

// --- 4. LÓGICA DE DATOS (ABRIR MODAL Y FILTRAR) ---
async function openReviewModal() {
    const modal = document.getElementById('reviewModal');
    const container = document.getElementById('pending-reviews-grid');
    if (!modal) return;

    modal.classList.add('active');

    // Resetear Vistas
    document.getElementById('review-selection-view').style.display = 'block';
    document.getElementById('review-form-view').style.display = 'none';
    container.innerHTML = `<div style="text-align:center; padding:20px; color:#fff;"><i class='bx bx-loader-alt bx-spin'></i> ESCANEANDO MISIONES COMPLETADAS...</div>`;

    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) return;

    try {
        // A. OBTENER ORDENES (Solo 'completed' o 'delivered')
        const { data: orders, error: ordersError } = await window.supabaseClient
            .from('orders')
            .select(`
                id, status,
                order_items (
                    product_id,
                    products (id, name, card_middle_url)
                )
            `)
            .eq('user_id', user.id)
            .in('status', ['completed', 'delivered']);

        if (ordersError) throw ordersError;

        console.log("✅ Órdenes encontradas:", orders);

        // B. OBTENER RESEÑAS EXISTENTES (Para no repetir)
        const { data: existingReviews } = await window.supabaseClient
            .from('reviews')
            .select('product_id')
            .eq('user_id', user.id);

        const reviewedIds = new Set(existingReviews ? existingReviews.map(r => r.product_id) : []);
        const productsToReview = new Map();

        // C. PROCESAMIENTO
        if (orders && orders.length > 0) {
            orders.forEach(order => {
                if (order.order_items && order.order_items.length > 0) {
                    order.order_items.forEach(item => {
                        // Si el producto existe y NO ha sido reseñado, agregarlo
                        if (item.products && !reviewedIds.has(item.products.id)) {
                            productsToReview.set(item.products.id, item.products);
                        }
                    });
                }
            });
        }

        // D. RENDERIZADO
        if (productsToReview.size === 0) {
            if (orders.length === 0) {
                container.innerHTML = `
                <div style="text-align:center; padding: 20px; color: #888;">
                    <i class='bx bx-radar' style="font-size: 3rem; color: var(--text-muted);"></i>
                    <p>No detectamos misiones finalizadas recientes.</p>
                </div>`;
            } else {
                container.innerHTML = `
                <div style="text-align:center; padding: 20px; color: #888;">
                    <i class='bx bx-check-circle' style="font-size: 3rem; color: var(--primary-lime);"></i>
                    <p>¡Excelente trabajo, Agente! Has reseñado todo tu arsenal.</p>
                </div>`;
            }
        } else {
            container.innerHTML = '';
            productsToReview.forEach(product => {
                const card = document.createElement('div');
                card.className = 'pending-item-card';
                card.innerHTML = `
                    <img src="${product.card_middle_url || 'images/Logo Header.png'}" alt="Img">
                    <div class="pending-info">
                        <h4>${product.name}</h4>
                        <span style="font-size: 1rem; color: var(--primary-cyan); font-weight: bold;">LISTO PARA CALIFICAR</span>
                    </div>
                    <i class='bx bx-chevron-right action-arrow'></i>
                `;
                // Asignar evento al card
                card.addEventListener('click', () => prepareReviewForm(product));
                container.appendChild(card);
            });
        }

    } catch (error) {
        console.error("Error reviews:", error);
        container.innerHTML = `<p style="color:red; text-align:center;">Error de conexión: ${error.message}</p>`;
    }
}

// --- 5. PREPARAR FORMULARIO DE CALIFICACIÓN ---
function prepareReviewForm(product) {
    selectedProductForReview = product;
    currentRatingValue = 0; // Resetear valor global

    document.getElementById('review-selection-view').style.display = 'none';
    document.getElementById('review-form-view').style.display = 'block';

    document.getElementById('review-target-name').innerText = product.name;
    document.getElementById('review-target-img').src = product.card_middle_url || 'images/Logo Header.png';
    document.getElementById('review-comment').value = '';

    // LIMPIEZA VISUAL: Desmarcar todos los inputs
    const inputs = document.querySelectorAll('input[name="rate-input"]');
    inputs.forEach(input => input.checked = false);

    // Resetear visuales de estrellas (todas grises)
    updateStarVisuals(0);

    // Resetear Avatar a estado neutro (manualmente porque no hay click en 0)
    if (typeof gsap !== 'undefined') {
        // Resetear paths a neutro (Index 0 del array de paths)
        document.querySelectorAll('.eye-path').forEach(el => el.setAttribute('d', EYE_PATHS[0]));
        document.querySelectorAll('.mouth-path').forEach(el => el.setAttribute('d', MOUTH_PATHS[0]));

        // Resetear cuerpo
        gsap.set("#avatar-svg", { scale: 1 });
        gsap.to("#chin", { y: 0, duration: 0.3 });
        gsap.to("#pupil", { scale: 1, duration: 0.3 });
        gsap.to("#ear-l", { rotate: "-15deg", y: 10, scale: .9, duration: 0.3 });
        gsap.to("#ear-r", { rotate: "15deg", y: 10, scale: .9, duration: 0.3 });

        // Ocultar cuernos
        for (let i = 1; i <= 5; i++) {
            gsap.to(`#horn-${i}`, { scale: 0, duration: 0.3 });
        }
    }

    // Reiniciar listeners
    initAvatarListeners();
}

// --- 6. ANIMACIÓN AVATAR (LÓGICA COMPLETA) ---
function initAvatarListeners() {
    const inputs = document.querySelectorAll('input[name="rate-input"]');

    // Posiciones Neutras (Reset)
    if (typeof gsap !== 'undefined') {
        gsap.set("#ear-l", { transformOrigin: "40px 40px", rotate: "-15deg", y: 10, scale: .9 });
        gsap.set("#ear-r", { transformOrigin: "40px 40px", rotate: "15deg", y: 10, scale: .9 });
        gsap.set("#earring", { transformOrigin: "50% 0", x: -12, y: 8 });
        gsap.set("#pupil", { transformOrigin: "50% 50%" });
        gsap.set("#chin", { y: 0 });

        // Ocultar cuernos inicialmente
        for (let i = 1; i <= 5; i++) {
            gsap.set(`#horn-${i}`, { scale: 0, transformOrigin: getHornOrigin(i) });
        }
    }

    inputs.forEach(input => {
        // Usamos 'change' para mejor respuesta en radio buttons
        input.addEventListener('change', (e) => {
            const num = parseInt(e.target.value);
            currentRatingValue = num;

            animateAvatar(num);
            updateStarVisuals(num);
        });
    });
}

function animateAvatar(num) {
    if (typeof gsap === 'undefined') return;

    // A. Rebote inicial (Pop)
    const tl = gsap.timeline({ defaults: { duration: 0.5, ease: "back.out(1.7)" } });

    tl.to("#avatar-svg", { scale: 0.8, duration: 0.15, ease: "power2.in" })
        .call(() => {
            // B. Intercambio de Caras
            document.querySelectorAll('.eye-path').forEach(el => el.setAttribute('d', EYE_PATHS[num]));
            const eyeClip = document.getElementById('eye-clippath');
            if (eyeClip) eyeClip.setAttribute('d', EYE_PATHS[num]);

            document.querySelectorAll('.mouth-path').forEach(el => el.setAttribute('d', MOUTH_PATHS[num]));
            const mouthClip = document.getElementById('mouth-clippath');
            if (mouthClip) mouthClip.setAttribute('d', MOUTH_PATHS[num]);
        })
        .to("#avatar-svg", { scale: 1, duration: 0.4 });

    // C. Definir Posiciones
    let chinY = 0, pupilS = 1, earS = .9, earY = 10, earRotL = "-15deg", earRotR = "15deg", earringX = -12, earringY = 8;
    let tongueY = 0, toothTopY = 0, toothBotY = 0;

    switch (num) {
        case 1: // 😠 Enojado
            chinY = 3; pupilS = .84; earS = 1.1; earY = -4; earRotL = "10deg"; earRotR = "-10deg"; earringX = 0; earringY = 0;
            tongueY = 2; toothTopY = 5; toothBotY = -17;
            break;
        case 2: // 😞 Decepcionado
            chinY = -2; pupilS = .94; earS = 1.05; earY = -2; earRotL = "5deg"; earRotR = "-5deg"; earringX = -2; earringY = -1;
            break;
        case 3: // 😐 Normal
            chinY = -4; pupilS = 1; earS = 1; earY = 0; earRotL = "0deg"; earRotR = "0deg"; earringX = -4; earringY = -2;
            break;
        case 4: // 🙂 Feliz
            chinY = 3; pupilS = 1.1; earS = .95; earY = -3; earRotL = "2deg"; earRotR = "-2deg"; earringX = -2; earringY = -5;
            tongueY = -4; toothTopY = 6; toothBotY = -16;
            break;
        case 5: // 🤩 Muy Feliz
            chinY = 14; pupilS = 1.2; earS = .9; earY = -6; earRotL = "4deg"; earRotR = "-4deg"; earringX = 0; earringY = -10;
            toothTopY = 2; toothBotY = -2;
            break;
    }

    // D. Animar Cuerpo
    tl.to("#chin", { y: chinY }, 0.1)
        .to("#pupil", { scale: pupilS }, 0.1)
        .to("#ear-l", { scale: earS, y: earY, rotate: earRotL }, 0.1)
        .to("#ear-r", { scale: earS, y: earY, rotate: earRotR }, 0.1)
        .to("#earring", { x: earringX, y: earringY }, 0.1)
        .to("#tongue", { y: tongueY }, 0.1)
        .to("#tooth-top", { y: toothTopY }, 0.1)
        .to("#tooth-bot", { y: toothBotY }, 0.1);

    // E. Animar Cuernos (Lógica de Nivel)
    for (let i = 1; i <= 5; i++) {
        const shouldShow = (i <= num);
        gsap.to(`#horn-${i}`, {
            scale: shouldShow ? 1 : 0,
            duration: 0.4,
            transformOrigin: getHornOrigin(i),
            ease: "back.out(2)"
        });
    }
}

// Helper para origen de cuernos
function getHornOrigin(index) {
    switch (index) {
        case 1: return "20px 45px";
        case 2: return "12px 45px";
        case 3: return "32px 38px";
        case 4: return "12px 38px";
        case 5: return "50% 90%";
        default: return "center";
    }
}

// Helper para pintar estrellas
// 5. HELPER: Pintar Estrellas (Escala de Color Cyberpunk)
function updateStarVisuals(num) {
    const stars = document.querySelectorAll('.rate-radio svg');

    // DEFINICIÓN DE PALETA SEGÚN NIVEL
    let activeColor;
    if (num <= 2) {
        activeColor = '#FF6B00'; // 🟠 Naranja Plasma (1-2)
    } else if (num === 3) {
        activeColor = '#B026FF'; // 🟣 Púrpura Cyber (3)
    } else if (num === 4) {
        activeColor = '#00F5FF'; // 🔵 Azul Holográfico (4)
    } else {
        activeColor = '#39FF14'; // 🟢 Verde Neo-Energía (5)
    }

    stars.forEach((svg, index) => {
        // Nota: index va de 0 a 4 (porque eliminamos el input 0)
        // La estrella 1 tiene index 0. La estrella 'num' tiene index num-1.

        if (index < num) {
            // Estado Activo: Usamos el color dinámico
            svg.style.fill = activeColor;
            svg.style.stroke = activeColor;
            svg.style.filter = `drop-shadow(0 0 8px ${activeColor})`;
            svg.style.transform = 'scale(1.1)'; // Ligero pop
        } else {
            // Estado Inactivo: Gris técnico
            svg.style.fill = 'transparent';
            svg.style.stroke = '#444';
            svg.style.filter = 'none';
            svg.style.transform = 'scale(1)';
        }
    });
}

// --- 7. ENVÍO DE DATOS Y PUNTOS ---
async function submitReview() {
    const comment = document.getElementById('review-comment').value.trim();
    const btn = document.getElementById('submit-review-btn');
    const POINTS_REWARD = 50;

    // Validaciones
    if (currentRatingValue === 0) {
        showNotification("⚠️ Por favor selecciona una calificación (Estrellas).");
        return;
    }
    if (comment.length < 10) {
        showNotification("⚠️ Tu reporte es muy corto. Mínimo 10 caracteres.");
        return;
    }

    btn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> PROCESANDO DATOS...";
    btn.disabled = true;

    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) throw new Error("Usuario no identificado");

        // 1. Guardar Reseña
        const { data: reviewData, error: reviewError } = await window.supabaseClient
            .from('reviews')
            .insert([{
                user_id: user.id,
                product_id: selectedProductForReview.id,
                rating: currentRatingValue,
                comment: comment,
                is_verified_purchase: true,
                is_approved: true,
                points_awarded: true
            }])
            .select()
            .single();

        if (reviewError) throw reviewError;

        // 2. Dar Puntos
        const { data: userData } = await window.supabaseClient
            .from('users')
            .select('current_points')
            .eq('id', user.id)
            .single();

        const newTotal = (userData?.current_points || 0) + POINTS_REWARD;

        await window.supabaseClient
            .from('users')
            .update({ current_points: newTotal })
            .eq('id', user.id);

        await window.supabaseClient
            .from('points_ledger')
            .insert([{
                user_id: user.id,
                points_amount: POINTS_REWARD,
                transaction_type: 'earn',
                description: `Recompensa por reseña: ${selectedProductForReview.name}`,
                related_review_id: reviewData.id
            }]);

        // Feedback
        showNotification(`✅ ¡Transmisión Exitosa! Has ganado +${POINTS_REWARD} Puntos.`);

        // Cerrar y refrescar
        setTimeout(() => {
            closeReviewModal();
            setTimeout(openReviewModal, 800);
        }, 1500);

    } catch (err) {
        console.error("❌ Error envío:", err);
        showNotification("❌ Error de transmisión. Intenta nuevamente.");
    } finally {
        btn.innerHTML = "TRANSMITIR DATOS";
        btn.disabled = false;
    }
}

// Helpers de Cierre
window.closeReviewModal = function () {
    document.getElementById('reviewModal').classList.remove('active');
};
window.backToSelection = function () {
    document.getElementById('review-form-view').style.display = 'none';
    document.getElementById('review-selection-view').style.display = 'block';
};

// Iniciar al cargar
document.addEventListener('DOMContentLoaded', initReviewsUI);