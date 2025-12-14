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
            color: 'cyan', icon: 'bx bx-folder',
            imgs: ['img1.png', 'img2.png', 'img3.png']
        }
    };

    // 2. CONSULTA DB
    const { data: allCategories, error } = await supabase
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

    const { data: reviewsData, error } = await supabase
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

    console.log("📡 DATOS CRUDOS DE SUPABASE:", reviewsData);

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
    const { data: allRatings, error } = await supabase
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
    const uploadBtn = document.querySelector('.js-open-review-modal');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // AQUI IRÁ TU CÓDIGO PARA ABRIR EL MODAL MÁS ADELANTE
            console.log("Abriendo comunicaciones...");
            showNotification("🚧 Próximamente: Interfaz de carga de reseñas.");
        });
    }
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
            // 5. INTENTO 1: GUARDAR EN SUPABASE
            const { error: dbError } = await supabase
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
                showNotification("🐮 ¡Carta abducida con éxito! 🛸");

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


