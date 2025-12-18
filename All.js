/// CONFIGURACION SUPABASE ///
const SUPABASE_URL = 'https://stjvnjmqezdcxsdodnfc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0anZuam1xZXpkY3hzZG9kbmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTE5NTUsImV4cCI6MjA3OTkyNzk1NX0.nh111C74tbdSreSdn7sRQlI8PPNnOCpod-Y1nD3210o';

// ✅ ESPERAR A QUE LA LIBRERÍA CARGUE
let client = null;

function initSupabase() {
    try {
        if (window.supabase && window.supabase.createClient) {
            client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            window._supabase = client; // Guardamos en global
            console.log("✅ Supabase inicializado correctamente");
            return true;
        } else {
            console.warn("⏳ Librería Supabase aún no disponible, reintentando...");
            return false;
        }
    } catch (error) {
        console.error("❌ Error inicializando Supabase:", error);
        return false;
    }
}

// Intentar inicializar inmediatamente
if (!initSupabase()) {
    // Si falla, reintentar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSupabase);
    } else {
        setTimeout(initSupabase, 100);
    }
}

/// VARIABLES ///
let allProducts = [];
let allCategories = [];
let cart = JSON.parse(localStorage.getItem('geekCart')) || [];
let currentModalProductId = null;
let hasShownWelcome = false;

/// INICIALIZACIÓN (DOMContentLoaded) ///
document.addEventListener("DOMContentLoaded", () => {
    injectLoader();
    injectHeader();
    injectTicker();
    injectFooter();
    injectGlobalModals();
    injectFavicon();
    renderUfoMenu();

    initLoaderLogic();
    initGlobalEvents();
    initAuthListener();
    updateCart();

    if (document.getElementById('hero-dynamic-container')) {
        loadDynamicHero();
    }

    if (window._supabaseClient) { // ✅ CORREGIDO
        console.log("🛸 Sistema conectado a la Base de Datos");
    } else {
        console.error("🔴 Error crítico: Librería supabaseClient no cargada.");
    }
});

/* LOADER & TICKER */
function injectLoader() {
    const container = document.getElementById("loader-container");
    if (container) {
        container.innerHTML = `
        <div id="loader">
            <div class="loader-logo"><img src="https://res.cloudinary.com/degcddlab/image/upload/v1765665235/Initial_Background_lypcbg.png" alt="Cargando..."></div>
            <div class="pacman">
                <div class="pacman-top"></div><div class="pacman-bottom"></div>
                <div class="dot dot1"></div><div class="dot dot2"></div><div class="dot dot3"></div><div class="dot dot4"></div>
            </div>
        </div>`;
    }
}

function initLoaderLogic() {
    const loader = document.getElementById('loader');
    const hideLoader = () => {
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 500);
        }
    };
    if (loader) {
        if (document.readyState === 'complete') hideLoader();
        else {
            window.addEventListener('load', hideLoader);
            setTimeout(hideLoader, 3000); // Fallback
        }
    }
}

function injectTicker() {
    const container = document.getElementById("ticker-container");
    if (container) {
        container.innerHTML = `
        <div class="led-ticker-container">
            <div class="led-display">
                <div class="led-content">
                    <span>⚠ BIENVENIDO TERRICOLA RECUERDA REGISTRARTE PARA GANAR PUNTOS Y NUNCA PERDERTE DE NUESTRAS NUEVAS CREACIONES ⚠</span>
                    <span>⚠ BIENVENIDO TERRICOLA RECUERDA REGISTRARTE PARA GANAR PUNTOS Y NUNCA PERDERTE DE NUESTRAS NUEVAS CREACIONES ⚠</span>
                </div>
            </div>
        </div>`;
    }
}

function injectFavicon() {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = 'https://res.cloudinary.com/degcddlab/image/upload/v1765661740/Zylox_Favicon_wkiv3s.png';
    link.type = 'image/png';
}

/* HEADER */
function injectHeader() {
    const container = document.getElementById("header-container");
    if (container) {
        container.innerHTML = `
        <header>
            <nav class="nav-left">
                <a href="Geek-Worldland.html" class="nav-link" id="link-nave">
                    <i class='bx bxs-rocket'></i> Nave Nodriza
                </a>
                <a href="Arsenal-Geek.html" class="nav-link" id="link-arsenal">
                    <i class='bx bxs-component'></i> Arsenal Geek
                </a>
                <a href="#" class="nav-link" id="link-freelancer" onclick="openFreelancerModal(event)">
                    <i class='bx bxs-brain'></i> Zylox Devs
                </a>

                <a href="#" class="nav-link mobile-only-link" onclick="document.getElementById('searchOverlay').classList.add('active'); document.querySelector('.nav-left').classList.remove('active'); return false;">
                    <i class='bx bx-search'></i> Búsqueda Global
                </a>
                <a href="#" class="nav-link mobile-only-link" onclick="openLoginModal(); document.querySelector('.nav-left').classList.remove('active'); return false;">
                    <i class='bx bxs-user-circle'></i> Identificación
                </a>
            </nav>

            <div class="logo-center">
                <a href="Geek-Worldland.html">
                    <img src="https://res.cloudinary.com/degcddlab/image/upload/v1765665180/Logo_Header_vgrszo.png" alt="Geek Worldland">
                </a>
            </div>

            <div class="header-actions">
                <button class="action-btn search-trigger" id="searchBtn" aria-label="Buscar">
                    <i class='bx bx-search'></i> 
                </button>
                
                <button class="action-btn" aria-label="Idioma" style="opacity:0.6; cursor:default;">
                    <i class='bx bx-world'></i> 
                </button>
                
                <button class="action-btn login-btn" onclick="openLoginModal()" aria-label="Identificarse">
                    <i class='bx bxs-user-circle'></i> 
                </button>
                
                <div class="menu-toggle" id="menuToggle">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </header>
        
        <div id="searchOverlay" class="search-overlay">
            <div class="search-container">
                <button class="close-search-btn" id="closeSearchBtn"><i class='bx bx-x'></i> Cerrar</button>
                <div class="search-input-wrapper">
                    <input type="text" id="searchInputOverlay" placeholder="Escribe tu deseo geek..." onkeyup="handleSearchKey(event)">
                    <button class="search-submit" onclick="executeSearch()"><i class='bx bx-search-alt'></i></button>
                </div>
            </div>
        </div>`;

        highlightActivePage();
    }
}

function highlightActivePage() {
    const currentPath = window.location.pathname;
    const arsenalLink = document.getElementById('link-arsenal');
    // El link freelancer no necesita 'active' porque saca del flujo
    if (arsenalLink) arsenalLink.classList.remove('active');

    if (currentPath.includes('Arsenal-Geek.html') && arsenalLink) {
        arsenalLink.classList.add('active');
    }
}

function injectGlobalModals() {
    const container = document.getElementById("global-modals-container");

    window.closeLoginModal = () => document.getElementById('loginModal')?.classList.remove('active');
    window.closeWelcomeModal = () => document.getElementById('welcomeModal')?.classList.remove('active');
    window.closeLogoutModal = () => document.getElementById('logoutModal')?.classList.remove('active');

    if (container) {
        container.innerHTML = `
        <div class="cart-modal" id="cartModal">
            <div class="cart-header">
                <h2><i class='bx bxs-flask'></i> CÁMARA DE MUTACIÓN</h2>
                <button class="close-cart" id="closeCartBtn"><i class='bx bx-x'></i></button>
            </div>
            <div class="cart-items" id="cartItems"></div>
            <div class="cart-footer">
                <div class="summary-row"><span>Subtotal</span><span id="cartSubtotal">$0</span></div>
                <div class="summary-row"><span>Envío</span><span style="color: var(--primary-lime)">GRATIS 🚀</span></div>
                <div class="summary-row total"><span>TOTAL</span><span id="cartTotal">$0</span></div>
                <button class="checkout-btn" onclick="checkout()">INICIAR TELETRANSPORTE</button>
            </div>
        </div>

        <div class="confirm-modal" id="freelancerModal">
            <div class="confirm-box">
                <div class="confirm-icon"><i class='bx bxs-brain'></i></div>
                <h3 class="confirm-title">¿Solicitar a Zylox Devs?</h3>
                <p class="confirm-text">Estás a punto de abandonar la tienda...<br><strong>¿Deseas contratar servicios especializados?</strong></p>
                <div class="confirm-actions">
                    <button class="c-btn c-btn-cancel" onclick="closeFreelancerModal()">Abortar</button>
                    <button class="c-btn c-btn-confirm" onclick="redirectToPortfolio()">Afirmativo</button>
                </div>
            </div>
        </div>

        <div class="login-modal" id="loginModal">
    <div class="login-content" style="max-width: 450px;">
        <button class="close-login" onclick="closeLoginModal()"><i class='bx bx-x'></i></button>
        
        <div id="phase-captcha" style="display:flex; flex-direction:column; align-items:center; width:100%;">
            <h2 style="font-family:'Orbitron'; color:white; margin-bottom:10px; letter-spacing:2px;">IDENTIFICACIÓN</h2>
            <button id="captcha-guy" class="captcha-container">
                <canvas id="display-canvas" class="lottie-canvas"></canvas>
            </button>
            <div class="theme-toggle glassmorphism">
                <label class="switch">
                    <input type="checkbox" id="theme-switch" onchange="toggleAlienTheme(this)">
                    <span class="slider round"></span>
                </label>
                <span class="theme-label" id="captcha-label">Soy Alienígena</span>
            </div>
        </div>

        <div id="phase-form" style="display:none; flex-direction:column; align-items:center; width:100%; animation: fadeIn 0.5s;">
            
            <div class="auth-tabs" style="display:flex; gap:15px; margin-bottom:20px; border-bottom:1px solid #333; padding-bottom:10px; width:100%; justify-content:center;">
                <button onclick="switchAuthTab('login')" id="tab-login" class="auth-tab active" style="background:none; border:none; color:var(--primary-lime); font-family:'Rajdhani'; font-weight:bold; cursor:pointer; font-size:1.1rem; border-bottom: 2px solid var(--primary-lime);">INGRESAR</button>
                <button onclick="switchAuthTab('register')" id="tab-register" class="auth-tab" style="background:none; border:none; color:#666; font-family:'Rajdhani'; font-weight:bold; cursor:pointer; font-size:1.1rem;">RECLUTARME</button>
            </div>

            <div id="view-login" style="width:100%;">
                <button class="social-btn google" onclick="loginWithGoogle()">
                    <i class='bx bxl-google'></i> Acceder con Google
                </button>
                <div class="divider"><span>O CON ID</span></div>
                
                <form onsubmit="handleLogin(event)" style="width:100%;">
                    <div class="input-group"><i class='bx bx-envelope'></i><input type="email" id="login-email" placeholder="Correo Electrónico" required></div>
                    <div class="input-group"><i class='bx bx-lock-alt'></i><input type="password" id="login-password" placeholder="Contraseña" required></div>
                    
                    <div style="text-align:right; margin-bottom:15px;">
                        <a href="#" onclick="switchAuthTab('recovery')" style="color:var(--primary-cyan); font-size:0.85rem; text-decoration:none;">¿Olvidaste tu clave?</a>
                    </div>
                    
                    <button type="submit" class="submit-btn">INICIAR SESIÓN</button>
                </form>
            </div>

            <div id="view-register" style="display:none; width:100%;">
                <form onsubmit="handleRegister(event)" style="width:100%;">
                    <div class="input-group"><i class='bx bx-user'></i><input type="text" id="reg-name" placeholder="Nombre de Agente" required></div>
                    <div class="input-group"><i class='bx bx-envelope'></i><input type="email" id="reg-email" placeholder="Correo Electrónico" required></div>
                    <div class="input-group"><i class='bx bx-lock-alt'></i><input type="password" id="reg-password" placeholder="Crear Contraseña" required></div>
                    
                    <div class="terms-container">
                        <label class="terms-label">
                            <input type="checkbox" id="reg-terms">
                            <span class="checkmark-neon"></span>
                            <span class="terms-text">Acepto la <a href="https://www.notion.so/2c88bc8d091780188530f595cd1faf0d?source=copy_link" style="color:var(--primary-cyan);">Política de Datos</a>.</span>
                        </label>
                    </div>
                    
                    <button type="submit" class="submit-btn" style="background: linear-gradient(45deg, #7c3aed, #db2777);">INICIAR RECLUTAMIENTO</button>
                </form>
            </div>

            <div id="view-recovery" style="display:none; width:100%; text-align:center;">
                <i class='bx bx-support' style="font-size:3rem; color:var(--primary-cyan); margin-bottom:10px;"></i>
                <h3 style="color:white; margin-bottom:10px;">¿Código perdido?</h3>
                <p style="color:#aaa; font-size:0.9rem; margin-bottom:20px;">Enviaremos un enlace cuántico a tu correo para restablecer el acceso.</p>
                
                <form onsubmit="handleRecovery(event)" style="width:100%;">
                    <div class="input-group"><i class='bx bx-envelope'></i><input type="email" id="rec-email" placeholder="Tu Correo Registrado" required></div>
                    <button type="submit" class="submit-btn" style="background: #0891b2;">ENVIAR ENLACE</button>
                    <button type="button" onclick="switchAuthTab('login')" style="background:none; border:none; color:#666; margin-top:15px; cursor:pointer;">Volver a Ingresar</button>
                </form>
            </div>

            <p id="auth-message" style="margin-top:15px; font-size:0.9rem; text-align:center; min-height:20px;"></p>
        </div>
    </div>
</div>

        <div class="welcome-modal" id="welcomeModal" onclick="closeWelcomeModal()">
            <div class="welcome-content">
                <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z0ZHg3aHZ4ZHg3aHZ4ZHg3aHZ4ZHg3aHZ4ZHg3aHZ4/26tn33aiTi1jbp6Zn/giphy.gif" 
                    class="welcome-image" id="welcomeImg" alt="Welcome"
                    onerror="this.style.display='none'; document.getElementById('welcomeText').style.display='block'">
                <div class="welcome-fallback-text" id="welcomeText">Bienvenido a nuestra misión<br>GeekWorldland</div>
                <p style="color:white; margin-top:20px; font-family:'Rajdhani'; font-size:1.2rem; opacity:0.7;">(Click en cualquier lugar para continuar)</p>
            </div>
        </div>

        <div class="logout-modal" id="logoutModal">
            <div class="logout-content">
                <div class="logout-icon"><i class='bx bx-power-off'></i></div>
                <h3>Desconexión Inminente</h3>
                <p id="logout-message-text">¿Confirmas abortar la misión?</p>
                <div class="logout-actions">
                    <button class="btn-cancel" onclick="closeLogoutModal()">Cancelar</button>
                    <button class="btn-confirm-logout" id="confirmLogoutBtn">Confirmar Salida</button>
                </div>
            </div>
        </div>
        `;

        const closeCart = document.getElementById('closeCartBtn');
        if (closeCart) closeCart.addEventListener('click', toggleCart);
    }
}

let dotLottieInstance = null;

window.openLoginModal = async function () {
    const { data: { user } } = await supabaseClientClient.auth.getUser();
    if (user) {
        console.log("✅ Usuario detectado. Actualizando interfaz...");
        updateHeaderUser(user);
        return;
    }

    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('phase-captcha').style.display = 'flex';
        document.getElementById('phase-form').style.display = 'none';

        const switchEl = document.getElementById('theme-switch');
        if (switchEl) switchEl.checked = false;

        if (!dotLottieInstance) {
            try {
                const { DotLottie } = await import('https://esm.sh/@lottiefiles/dotlottie-web@0.37.0');
                const canvas = document.querySelector('#display-canvas');
                if (canvas) {
                    dotLottieInstance = new DotLottie({
                        autoplay: true, loop: true, canvas: canvas,
                        src: 'https://lottie.host/7da7b6c9-401f-436d-968b-c50ba49409b3/V6DoSiPH8g.lottie',
                        themeId: 'Alien',
                    });
                }
            } catch (e) { console.error("Error Lottie:", e); }
        } else {
            dotLottieInstance.setTheme('Alien');
        }
    }
}

window.toggleAlienTheme = async function (checkbox) {
    if (!dotLottieInstance) return;
    const canvas = document.querySelector('#display-canvas');
    const label = document.getElementById('captcha-label');
    const newTheme = checkbox.checked ? 'Human' : 'Alien';

    if (canvas) canvas.style.opacity = '0';
    await new Promise((r) => setTimeout(r, 500));

    dotLottieInstance.setTheme(newTheme);
    if (canvas) canvas.style.opacity = '1';

    if (label) {
        label.textContent = checkbox.checked ? "Soy Humano" : "Soy Alienígena";
        label.style.color = checkbox.checked ? "var(--accent-orange)" : "var(--primary-cyan)";
    }

    if (newTheme === 'Human') {
        setTimeout(() => {
            document.getElementById('phase-captcha').style.display = 'none';
            document.getElementById('phase-form').style.display = 'flex';
        }, 1500);
    }
}

window.loginWithGoogle = async function () {
    console.log("📡 Iniciando protocolo OAuth con Google...");
    const cleanRedirectURL = window.location.origin + window.location.pathname;
    console.log("🎯 Redireccionando a:", cleanRedirectURL);
    const { error } = await supabaseClientClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: cleanRedirectURL,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        }
    });

    if (error) {
        console.error("Error OAuth:", error);
        const errorMsg = document.getElementById('login-error');
        if (errorMsg) errorMsg.innerText = "Error: " + error.message;
    }
}

window.openLoginModal = async function () {
    console.log("🔓 Abriendo modal de login...");

    const { data: { user } } = await supabaseClientClient.auth.getUser();

    if (user) {
        console.log("✅ Usuario ya conectado:", user.email);
        updateHeaderUser(user);
        return;
    }

    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('phase-captcha').style.display = 'flex';
        document.getElementById('phase-form').style.display = 'none';

        const switchEl = document.getElementById('theme-switch');
        if (switchEl) switchEl.checked = false;

        if (!dotLottieInstance) {
            try {
                const { DotLottie } = await import('https://esm.sh/@lottiefiles/dotlottie-web@0.37.0');
                const canvas = document.querySelector('#display-canvas');
                if (canvas) {
                    dotLottieInstance = new DotLottie({
                        autoplay: true,
                        loop: true,
                        canvas: canvas,
                        src: 'https://lottie.host/7da7b6c9-401f-436d-968b-c50ba49409b3/V6DoSiPH8g.lottie',
                        themeId: 'Alien',
                    });
                }
            } catch (e) {
                console.error("Error Lottie:", e);
            }
        } else {
            dotLottieInstance.setTheme('Alien');
        }
    }
}

window.performLogout = async function () {
    console.log("🔌 Iniciando cierre de sesión...");

    try {
        const { error } = await supabaseClientClient.auth.signOut();

        if (error) {
            console.error("Error al cerrar sesión:", error);
            showNotification("Error al cerrar sesión. Intenta de nuevo.");
            return;
        }

        console.log("✅ Sesión cerrada exitosamente");

        localStorage.removeItem('geekCart');
        window.location.reload();

    } catch (err) {
        console.error("Error inesperado:", err);
        showNotification("Ocurrió un error. Recargando página...");
        window.location.reload();
    }
}

async function updateHeaderUser(user) {
    console.log("🔄 Sincronizando datos del agente:", user.email);

    const btn = document.querySelector('.login-btn');
    if (!btn) return;

    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    const DEFAULT_AVATAR = 'https://res.cloudinary.com/degcddlab/image/upload/v1765676382/Zylox_Avatar_i0pbjx.png';

    let name = user.user_metadata?.full_name || user.email.split('@')[0];
    let avatarUrl = user.user_metadata?.avatar_url || null;

    try {
        if (!avatarUrl) {
            const { data: profile, error } = await supabaseClientClient
                .from('users')
                .select('avatar_url, full_name, ranks ( name )')
                .eq('id', user.id)
                .single();

            if (!error && profile) {
                avatarUrl = profile.avatar_url || null;
                if (!user.user_metadata?.full_name && profile.full_name) {
                    name = profile.full_name;
                }
            }
        }
    } catch (e) {
        console.warn("No se pudo obtener perfil desde users:", e);
    }

    avatarUrl = avatarUrl || DEFAULT_AVATAR;

    let userRank = "Explorador";
    try {
        const { data } = await supabaseClientClient
            .from('users')
            .select('ranks ( name )')
            .eq('id', user.id)
            .single();

        if (data?.ranks?.name) {
            userRank = data.ranks.name;
        }
    } catch {
        console.warn("No se pudo obtener rango, usando default.");
    }

    const hour = new Date().getHours();
    let timeGreeting = "Buenas noches";
    if (hour >= 5 && hour < 12) timeGreeting = "Buenos días";
    else if (hour >= 12 && hour < 19) timeGreeting = "Buenas tardes";

    const finalGreeting = `${timeGreeting}, ${userRank}`;

    newBtn.innerHTML = `
        <img 
            src="${avatarUrl}" 
            style="width:35px; height:35px; border-radius:50%; border:2px solid var(--primary-lime); object-fit:cover;"
            onerror="this.onerror=null;this.src='${DEFAULT_AVATAR}';"
        >
    `;

    let menu = document.getElementById('zyloxUserMenu');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'zyloxUserMenu';
        menu.className = 'zylox-menu';
        menu.style.zIndex = "99999";
        document.body.appendChild(menu);
    }

    menu.innerHTML = `
        <div class="menu-header" style="flex-direction:column; align-items:flex-start; gap:10px;">
            <div style="display:flex; align-items:center; gap:15px; width:100%;">
                <img 
                    src="${avatarUrl}" 
                    class="menu-user-avatar"
                    onerror="this.onerror=null;this.src='${DEFAULT_AVATAR}';"
                >
                <div class="menu-user-info">
                    <h4 style="font-size:1.1rem; color:var(--primary-cyan); margin:0;">${name}</h4>
                    <span style="background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:4px; font-size:1.3rem; color:var(--primary-lime);">${userRank}</span>
                </div>
            </div>

            <div style="margin-top:10px; padding:10px; background:rgba(0, 255, 255, 0.05); border-left: 2px solid var(--primary-lime); border-radius:0 5px 5px 0; width:100%;">
                <p style="color:#ddd; font-size:0.9rem; margin:0; line-height:1.4;">
                    <em>"${finalGreeting}... ¿Qué vamos a hacer hoy?"</em>
                </p>
            </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">
            <a href="#" class="menu-item" style="color:white; text-decoration:none; display:flex; gap:10px; padding:10px; border-radius:8px; transition:0.3s; align-items:center;">
                <i class='bx bx-user-circle' style="font-size:1.2rem;"></i> Mi Perfil
            </a>

            <div class="menu-item logout-trigger" style="color:#ff4444; cursor:pointer; display:flex; gap:10px; padding:10px; border-radius:8px; transition:0.3s; align-items:center;">
                <i class='bx bx-log-out' style="font-size:1.2rem;"></i> Cerrar Sesión
            </div>
        </div>
    `;

    const logoutTrigger = menu.querySelector('.logout-trigger');
    if (logoutTrigger) {
        const newLogoutTrigger = logoutTrigger.cloneNode(true);
        logoutTrigger.parentNode.replaceChild(newLogoutTrigger, logoutTrigger);

        newLogoutTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.remove('active');
            openLogoutModal(name);
        });
    }

    newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const isActive = menu.classList.contains('active');

        if (isActive) {
            menu.classList.remove('active');
        } else {
            menu.classList.add('active');
            const rect = newBtn.getBoundingClientRect();
            menu.style.top = (rect.bottom + 15) + 'px';
            const rightPos = window.innerWidth - rect.right;
            menu.style.right = (rightPos > 20 ? rightPos : 20) + 'px';
        }
    });

    const closeMenuHandler = (e) => {
        if (
            menu.classList.contains('active') &&
            !menu.contains(e.target) &&
            !newBtn.contains(e.target)
        ) {
            menu.classList.remove('active');
        }
    };

    document.removeEventListener('click', closeMenuHandler);
    document.addEventListener('click', closeMenuHandler);
}


function initAuthListener() {
    console.log("🎧 Inicializando listener de autenticación...");

    supabaseClient.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            console.log("👤 Usuario detectado al cargar:", user.email);
            updateHeaderUser(user);
        } else {
            console.log("👻 Sin usuario al cargar");
        }
    });

    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log("🔔 Cambio de estado:", event);

        if (event === 'SIGNED_IN' && session?.user && !hasShownWelcome) {
            hasShownWelcome = true;
            showNotification(`¡Bienvenido, ${session.user.email.split('@')[0]}!`);
        } else if (event === 'SIGNED_OUT') {
            console.log("🚪 Usuario cerró sesión");

            const btn = document.querySelector('.login-btn');
            if (btn) {
                const newBtn = btn.cloneNode(true);
                newBtn.innerHTML = `<i class='bx bxs-user-circle'></i>`;
                btn.parentNode.replaceChild(newBtn, btn);

                newBtn.addEventListener('click', openLoginModal);
            }

            const menu = document.getElementById('zyloxUserMenu');
            if (menu) menu.remove();
        }
        supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                console.log("🚨 Modo Recuperación detectado. Redirigiendo...");
                window.location.href = '/reset-password.html';
            }
        });
    });
}

window.switchAuthTab = function (tab) {
    // Ocultar todas las vistas
    document.getElementById('view-login').style.display = 'none';
    document.getElementById('view-register').style.display = 'none';
    document.getElementById('view-recovery').style.display = 'none';

    // Resetear estilos de tabs
    document.getElementById('tab-login').style.color = '#666';
    document.getElementById('tab-login').style.borderBottom = 'none';
    document.getElementById('tab-register').style.color = '#666';
    document.getElementById('tab-register').style.borderBottom = 'none';

    // Mostrar la elegida
    if (tab === 'login') {
        document.getElementById('view-login').style.display = 'block';
        document.getElementById('tab-login').style.color = 'var(--primary-lime)';
        document.getElementById('tab-login').style.borderBottom = '2px solid var(--primary-lime)';
    } else if (tab === 'register') {
        document.getElementById('view-register').style.display = 'block';
        document.getElementById('tab-register').style.color = '#db2777';
        document.getElementById('tab-register').style.borderBottom = '2px solid #db2777';
    } else if (tab === 'recovery') {
        document.getElementById('view-recovery').style.display = 'block';
    }

    // Limpiar mensajes
    showMessage('');
}

function showMessage(msg, type = 'neutral') {
    const el = document.getElementById('auth-message');
    el.innerText = msg;
    if (type === 'error') el.style.color = '#ef4444'; // Rojo
    else if (type === 'success') el.style.color = '#84cc16'; // Verde
    else el.style.color = '#06b6d4'; // Azul
}

// 2. PROCESAR LOGIN
window.handleLogin = async function (e) {
    e.preventDefault();
    showMessage('🔄 Verificando credenciales...', 'neutral');

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabaseClientClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        showMessage('❌ ' + error.message, 'error');
    } else {
        showMessage('✅ Acceso Concedido. Bienvenido.', 'success');
        setTimeout(() => window.closeLoginModal(), 1500);
    }
}

// 3. PROCESAR REGISTRO
window.handleRegister = async function (e) {
    e.preventDefault();

    const terms = document.getElementById('reg-terms').checked;
    if (!terms) {
        showMessage('⚠️ Debes aceptar la Política de Datos.', 'error');
        return;
    }

    showMessage('📝 Creando expediente...', 'neutral');

    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const inputName = document.getElementById('reg-name').value;

    // Generar un ID técnico seguro (ej: "Juan Perez" -> "juan_perez")
    // Agregamos un número aleatorio corto para evitar CUALQUIER colisión manual
    const randomSuffix = Math.floor(Math.random() * 1000);
    const cleanUsername = inputName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') + "_" + randomSuffix;

    const { data, error } = await supabaseClientClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: inputName,
                username: cleanUsername,
                terms_accepted: true,
                terms_accepted_at: new Date().toISOString()
            },
            redirectTo: 'https://geekworldland.com/'
        }
    });

    if (error) {
        console.error("Error Registro:", error);
        // Mostrar el error real para que sepas qué pasa
        showMessage('❌ Error: ' + error.message, 'error');
    } else {
        showMessage('✅ ¡Registro exitoso! Revisa tu correo.', 'success');
        // Limpiar campos
        document.getElementById('reg-email').value = '';
        document.getElementById('reg-password').value = '';
        document.getElementById('reg-name').value = '';
    }
}

// 4. PROCESAR RECUPERACIÓN (RESET PASSWORD)
window.handleRecovery = async function (e) {
    e.preventDefault();
    showMessage('📡 Buscando usuario...', 'neutral');
    const email = document.getElementById('rec-email').value;
    const redirectUrl = 'https://geekworldland.com/reset-password.html';
    const { data, error } = await supabaseClientClient.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
    });

    if (error) {
        showMessage('❌ ' + error.message, 'error');
    } else {
        showMessage('✅ Enlace enviado. Revisa tu bandeja de entrada.', 'success');
    }
}

function showWelcomeSuccess() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.classList.remove('active');
    const welcomeModal = document.getElementById('welcomeModal');
    if (welcomeModal) welcomeModal.classList.add('active');
}

function closeWelcomeModal() {
    document.getElementById('welcomeModal').classList.remove('active');
}

function openLogoutModal(userName) {
    const modal = document.getElementById('logoutModal');
    const msgText = document.getElementById('logout-message-text');
    const confirmBtn = document.getElementById('confirmLogoutBtn');

    if (modal && msgText && confirmBtn) {
        msgText.textContent = `¿Confirmas desconectar tu cuenta ${userName}?`;
        modal.classList.add('active');

        confirmBtn.onclick = async () => {
            confirmBtn.innerText = "Desconectando...";
            try {
                await supabaseClientClient.auth.signOut();
                window.location.reload();
            } catch (err) {
                console.error("Error logout:", err);
                window.location.reload();
            }
        };
    }
}

window.openFreelancerModal = function (e) {
    if (e) e.preventDefault();
    console.log("🔓 Abriendo Modal Freelancer...");
    const modal = document.getElementById('freelancerModal');
    if (modal) {
        modal.classList.add('active');
    } else {
        console.error("❌ ERROR: No se encontró el modal 'freelancerModal'");
    }
}

window.closeFreelancerModal = function () {
    const modal = document.getElementById('freelancerModal');
    if (modal) modal.classList.remove('active');
}

window.redirectToPortfolio = function () {
    console.log("🚀 Redirigiendo a Portafolio...");
    window.location.href = 'portafolio.html';
}

window.executeSearch = function () {
    const input = document.getElementById('searchInputOverlay');
    const query = input?.value.trim();

    if (query) {
        console.log('🔎 Ejecutando búsqueda:', query);

        const overlay = document.getElementById('searchOverlay');
        if (overlay) overlay.classList.remove('active');

        window.location.href = `Arsenal-Geek.html?q=${encodeURIComponent(query)}`;
    } else {
        showNotification('⚠️ Por favor ingresa un término de búsqueda');
    }
}

window.executeSearch = function () {
    const input = document.getElementById('searchInputOverlay');
    const query = input?.value.trim();

    if (!query) {
        showNotification('⚠️ Por favor ingresa un término de búsqueda');
        return;
    }

    console.log('🔎 Ejecutando búsqueda:', query);

    const overlay = document.getElementById('searchOverlay');
    if (overlay) overlay.classList.remove('active');

    const isInArsenal = document.getElementById('productsGrid');

    if (isInArsenal && typeof window.applySearchFromOverlay === 'function') {
        window.applySearchFromOverlay(query);
    } else {
        window.location.href = `Arsenal-Geek.html?q=${encodeURIComponent(query)}`;
    }
}

window.handleSearchKey = function (event) {
    if (event.key === 'Enter') {
        executeSearch();
    }
}

function initGlobalEvents() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }

    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearch = document.getElementById('closeSearchBtn');
    const searchInput = document.getElementById('searchInputOverlay');

    if (searchBtn && searchOverlay && searchInput) {
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchOverlay.classList.add('active');
            setTimeout(() => searchInput.focus(), 100);
        });

        if (closeSearch) {
            closeSearch.addEventListener('click', () => {
                searchOverlay.classList.remove('active');
                searchInput.value = '';
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                searchOverlay.classList.remove('active');
                searchInput.value = '';
            }
        });

        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
                searchInput.value = '';
            }
        });
    }

    const menuToggle = document.getElementById('menuToggle');
    const navLeft = document.querySelector('.nav-left');
    if (menuToggle && navLeft) {
        const newToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newToggle, menuToggle);
        newToggle.addEventListener('click', () => {
            newToggle.classList.toggle('active');
            navLeft.classList.toggle('active');
        });
    }

    document.addEventListener('click', (e) => {
        const nav = document.querySelector('.nav-left');
        const toggle = document.getElementById('menuToggle');

        if (nav && nav.classList.contains('active')) {
            if (!nav.contains(e.target) && toggle && !toggle.contains(e.target)) {
                nav.classList.remove('active');
                toggle.classList.remove('active'); // También remover el estado del botón
            }
        }
    });
}

/* HERO SECTION */
async function loadDynamicHero() {
    const container = document.getElementById('hero-dynamic-container');
    if (!container || !supabaseClient) return;

    const { data: trendingProducts, error } = await supabaseClientClient
        .from('products')
        .select('name, legend, description, card_middle_url')
        .eq('is_trending', true)
        .order('created_at', { ascending: false });

    if (error) console.error("Error Hero:", error);

    const isCatalogPage = document.getElementById('productsGrid');
    const btnAction = isCatalogPage
        ? "document.getElementById('productos').scrollIntoView({behavior: 'smooth'})"
        : "location.href='Arsenal-Geek.html'";

    let itemsHtml = "";
    if (trendingProducts && trendingProducts.length > 0) {
        itemsHtml = trendingProducts.map((product, index) => `
            <div class="item">
                <img src="${product.card_middle_url}" alt="${product.name}">
                <div class="introduce neon-card-style">
                    <div class="title">TENDENCIA #${index + 1}</div>
                    <div class="topic">${product.name}</div>
                    <div class="des">${product.legend || product.description || "Artefacto disponible."}</div>
                    <button class="seeMore" onclick="${btnAction}">EXPLORAR ARSENAL &#8595;</button>
                </div>
            </div>
        `).join('');
    }

    container.innerHTML = `
        <div class="carousel">
            <div class="list">${itemsHtml}</div>
            <div class="arrows">
                <button id="prevHero"><i class='bx bx-chevron-left'></i></button>
                <button id="nextHero">></button>
            </div>
            <div class="carousel-bg-glow"></div>
        </div>`;

    initHeroCarousel();
}

function initHeroCarousel() {
    const nextBtn = document.getElementById('nextHero');
    const prevBtn = document.getElementById('prevHero');
    const carousel = document.querySelector('.carousel');
    const listHTML = document.querySelector('.carousel .list');

    if (!nextBtn || !carousel) return;

    const showSlider = (type) => {
        carousel.classList.remove('next', 'prev');
        let items = document.querySelectorAll('.carousel .list .item');
        if (items.length === 0) return;

        if (type === 'next') {
            listHTML.appendChild(items[0]);
            carousel.classList.add('next');
        } else {
            listHTML.prepend(items[items.length - 1]);
            carousel.classList.add('prev');
        }
    }
    let autoRun = setInterval(() => { showSlider('next'); }, 5000);
    const resetTimer = () => {
        clearInterval(autoRun);
        autoRun = setInterval(() => { showSlider('next'); }, 5000);
    }

    // Cloning to remove old listeners
    const newNext = nextBtn.cloneNode(true);
    const newPrev = prevBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);
    prevBtn.parentNode.replaceChild(newPrev, prevBtn);

    newNext.onclick = function () { showSlider('next'); resetTimer(); }
    newPrev.onclick = function () { showSlider('prev'); resetTimer(); }
}


function renderArsenalGrid(products, container) {
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding: 50px;">
                <i class='bx bx-ghost' style="font-size:4rem; color:var(--text-muted);"></i>
                <h3 style="color:white; margin-top:20px;">No se encontraron especímenes.</h3>
                <p style="color:#94a3b8;">Intenta con otro término de búsqueda.</p>
                <button onclick="window.location.href='Arsenal-Geek.html'" style="margin-top:20px; padding:10px 20px; background:var(--primary-purple); border:none; color:white; border-radius:5px; cursor:pointer;">
                    Ver todo el Arsenal
                </button>
            </div>`;
        return;
    }

    container.innerHTML = products.map(product => {
        const price = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.base_price);
        const finalImage = product.card_middle_url || product.card_front_url || 'images/Logo Header.png';

        return `
        <div class="product-card neon-card-style">
            <div class="product-image">
                <img src="${finalImage}" alt="${product.name}" loading="lazy">
                ${product.is_trending ? '<span class="badge-trending">TENDENCIA</span>' : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-desc">${product.description ? product.description.substring(0, 60) + '...' : 'Sin descripción'}</p>
                <div class="product-meta">
                    <span class="price">${price}</span>
                    <button class="add-btn" onclick="addToCartFromCatalog('${product.id}', '${product.name}', ${product.base_price}, '${finalImage}')">
                        <i class='bx bx-cart-add'></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function renderArsenalGrid(products, container) {
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding: 50px;">
                <i class='bx bx-ghost' style="font-size:4rem; color:var(--text-muted);"></i>
                <h3 style="color:white; margin-top:20px;">No se encontraron especímenes.</h3>
                <p style="color:#94a3b8;">Intenta con otro término de búsqueda.</p>
                <button onclick="window.location.href='Arsenal-Geek.html'" style="margin-top:20px; padding:10px 20px; background:var(--primary-purple); border:none; color:white; border-radius:5px; cursor:pointer;">
                    Ver todo el Arsenal
                </button>
            </div>`;
        return;
    }

    container.innerHTML = products.map(product => {
        const price = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.base_price);
        const finalImage = product.card_middle_url || product.card_front_url || 'images/Logo Header.png';

        return `
        <div class="product-card neon-card-style">
            <div class="product-image">
                <img src="${finalImage}" alt="${product.name}" loading="lazy">
                ${product.is_trending ? '<span class="badge-trending">TENDENCIA</span>' : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-desc">${product.description ? product.description.substring(0, 60) + '...' : 'Sin descripción'}</p>
                <div class="product-meta">
                    <span class="price">${price}</span>
                    <button class="add-btn" onclick="addToCartFromCatalog('${product.id}', '${product.name}', ${product.base_price}, '${finalImage}')">
                        <i class='bx bx-cart-add'></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

window.addToCartFromCatalog = function (id, name, price, image) {
    addToCart({
        id: id,
        name: name,
        base_price: price,
        image_url: image
    });
}

/* CARRITO */
function addToCart(product, quantity = 1) {
    if (!product) return;
    const variantColor = product.selected_color || "Estándar";
    const uniqueCartId = `${product.id}-${variantColor.replace(/\s+/g, '')}`;
    const existingItem = cart.find(item => item.uniqueId === uniqueCartId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        const price = product.price || product.base_price || 0;
        cart.push({
            ...product,
            uniqueId: uniqueCartId,
            selected_color: variantColor,
            quantity: quantity,
            base_price: price
        });
    }
    updateCart();
    showNotification(`✅ Muestra recolectada: ${product.name} (${variantColor})`);
}

function updateCart() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const subtotalEl = document.getElementById('cartSubtotal');
    const ufoBadge = document.getElementById('ufoCount');

    localStorage.setItem('geekCart', JSON.stringify(cart));

    const total = cart.reduce((sum, item) => sum + (item.base_price * item.quantity), 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const maxPrice = cart.length > 0 ? Math.max(...cart.map(i => i.base_price)) : 0;

    const formattedTotal = '$' + total.toLocaleString('es-CO');
    if (totalEl) totalEl.textContent = formattedTotal;
    if (subtotalEl) subtotalEl.textContent = formattedTotal;
    if (ufoBadge) ufoBadge.textContent = count;

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart" style="grid-column:1/-1; text-align:center; color:#666;">
                <i class='bx bx-ghost' style="font-size:3rem; margin-bottom:10px;"></i>
                <p>Cámara de mutación vacía...</p>
            </div>`;
        return;
    }

    container.innerHTML = cart.map((item, index) => {
        const isMvp = item.base_price === maxPrice ? 'mvp-item' : '';
        const delayStyle = `style="--i:${index};"`;

        let displayImage = item.card_middle_url || item.image_url;
        if (!displayImage || displayImage === item.name || !displayImage.includes('/')) {
            displayImage = 'https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif';
        }

        const colorDisplay = item.selected_color !== "Estándar"
            ? `<span style="font-size:0.8rem; color:var(--primary-lime); display:block;">Color: ${item.selected_color}</span>`
            : '';

        return `
        <div class="cart-item ${isMvp}" ${delayStyle}>
            <button class="remove-btn" onclick="removeFromCart('${item.uniqueId}')" title="Purgar Espécimen">
                <i class='bx bxs-trash'></i>
            </button>
            
            <img src="${displayImage}" alt="${item.name}" onerror="this.src='images/Initial Background.png'">
            
            <div class="cart-item-info">
                <h4 style="font-size:1.3rem; margin-bottom:2px; color:white;">${item.name}</h4>
                ${colorDisplay} <p class="cart-item-price" style="color:var(--primary-cyan); font-weight:bold;">$${item.base_price.toLocaleString('es-CO')}</p>
                <p class="cart-item-qty" style="font-size:0.8rem; color:#aaa;">Cant: ${item.quantity}</p>
            </div>
            
            ${isMvp ? '<div style="position:absolute; top:8px; left:8px; font-size:0.65rem; background:var(--primary-lime); color:black; padding:2px 6px; border-radius:4px; font-weight:bold; box-shadow:0 0 10px var(--primary-lime);">MVP</div>' : ''}
        </div>`;
    }).join('');
}

window.removeFromCart = function (uniqueIdToRemove) {
    cart = cart.filter(item => item.uniqueId !== uniqueIdToRemove);
    updateCart();
};

window.toggleCart = function () {
    const modal = document.getElementById('cartModal');
    if (modal) modal.classList.toggle('active');
};

window.checkout = function () {
    if (cart.length === 0) {
        showNotification("La cámara está vacía. Selecciona especímenes primero.");
        return;
    }
    const modal = document.getElementById('cartModal');
    if (modal) modal.classList.add('abducting');
    setTimeout(() => {
        window.location.href = 'Terminal_Transaccional.html';
    }, 1400);
};

function showNotification(msg) {
    const notif = document.createElement('div');
    notif.className = 'notification-bubble';
    notif.innerHTML = `<i class='bx bxs-invader'></i> ${msg}`;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.animation = 'popOut 0.5s forwards';
        setTimeout(() => notif.remove(), 500);
    }, 3000);
}

/* ZYLOX MENU */
function renderUfoMenu() {
    const placeholder = document.getElementById('ufo-component-placeholder');
    if (!placeholder) return;
    const currentCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    placeholder.innerHTML = `
    <div class="ufo-container">
        <ul class="ufo-menu">
            <div class="ufo-toggle">
                <img src="https://res.cloudinary.com/degcddlab/image/upload/v1765661180/Zylox_Menu_bxmdh4.png" alt="Menu Alien">
                <span class="ufo-badge" id="ufoCount">${currentCount}</span>
            </div>
            <li style="--i:6; --clr:#84cc16;"><a href="Terminal_Transaccional.html" onclick="toggleCart(); return false;"><i class='bx bx-cart'></i> <span class="ufo-label">Ver Carrito</span></a></li>
            <li style="--i:7; --clr:#25d366;"><a href="https://wa.me/message/7D7ZCLVFNLZ4A1" target="_blank"><i class='bx bxl-whatsapp'></i><span class="ufo-label">WhatsApp</span></a></li>
            <li style="--i:5; --clr:#ec4899;"><a href="https://www.instagram.com/geekworldland?igsh=ejJzejdnd3FzYnEx" target="_blank"><i class='bx bxl-instagram'></i><span class="ufo-label">Instagram</span></a></li>
            <li style="--i:3; --clr:#1877f2;"><a href="https://www.facebook.com/profile.php?id=100069820063553" target="_blank"><i class='bx bxl-facebook'></i><span class="ufo-label">Facebook</span></a></li>
            <li style="--i:4; --clr:#00f2ea;"><a href="http://tiktok.com/@geekworldlandgy" target="_blank"><i class='bx bxl-tiktok'></i><span class="ufo-label">TikTok</span></a></li>
            <li style="--i:2; --clr:#fed75a;"><a href="#"><i class='bx bx-right-arrow-alt'></i><span class="ufo-label">Pronto</span></a></li>
            <li style="--i:1; --clr:#ffffff;"><a href="#"><i class='bx bx-ghost'></i><span class="ufo-label">Secreto</span></a></li>
            <li style="--i:0; --clr:#a855f7;"><a href="#"><i class='bx bx-planet'></i><span class="ufo-label">Próximamente</span></a></li>
        </ul>
    </div>`;
    initUfoEvents();
}

function initUfoEvents() {
    const ufoToggle = document.querySelector('.ufo-toggle');
    const ufoMenu = document.querySelector('.ufo-menu');
    if (ufoToggle && ufoMenu) {
        const newToggle = ufoToggle.cloneNode(true);
        ufoToggle.parentNode.replaceChild(newToggle, ufoToggle);
        newToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            ufoMenu.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!ufoMenu.contains(e.target) && !newToggle.contains(e.target)) {
                ufoMenu.classList.remove('active');
            }
        });
    }
}

/* FOOTER */
function injectFooter() {
    const container = document.getElementById("footer-container");
    if (container) {
        container.innerHTML = `
        <footer class="footer">
            <div class="footer__parralax">
                <div class="footer__parralax-trees"></div>
                <div class="footer__parralax-moto"></div> <div class="footer__parralax-secondplan"></div>
                <div class="footer__parralax-premierplan"></div>
                <div class="footer__parralax-voiture"></div> </div>

            <div class="container">
                <div class="footer__columns">
                    <div class="footer__col">
                        <h3 class="footer__col-title">
                            <i class='bx bx-file'></i> <span>LEGAL</span>
                        </h3>
                        <nav class="footer__nav">
                            <ul class="footer__nav-list">
                                <li class="footer__nav-item"><span class="footer__nav-link"><i class='bx bx-check-shield'></i> Licencia comercial respaldada</span></li>
                                <li class="footer__nav-item"><span class="footer__nav-link"><i class='bx bx-copyright'></i> Imágenes autorizadas</span></li>
                                <li class="footer__nav-item"><span class="footer__nav-link"><i class='bx bx-registered'></i> Derechos reservados</span></li>
                            </ul>
                        </nav>
                    </div>

                    <div class="footer__col center-col">
                        <div class="footer-logo-container">
                            <img src="https://res.cloudinary.com/degcddlab/image/upload/v1765665180/Logo_Header_vgrszo.png" alt="Geek Worldland Logo" class="footer-logo">
                        </div>
                    </div>

                    <div class="footer__col">
                        <h3 class="footer__col-title">
                            <i class='bx bx-send'></i> <span>CONTACTO</span>
                        </h3>
                        <nav class="footer__nav">
                            <ul class="footer__nav-list">
                                <li class="footer__nav-item"><a href="mailto:GeekworlandGY@gmail.com" class="footer__nav-link"><i class='bx bx-envelope'></i> GeekworlandGY@gmail.com</a></li>
                                <li class="footer__nav-item"><a href="https://wa.me/573054585777" target="_blank" class="footer__nav-link"><i class='bx bxl-whatsapp'></i> +57 305 458 5777</a></li>
                                <li class="footer__nav-item"><span class="footer__nav-link"><i class='bx bxs-map'></i> Bogotá, Colombia</span></li>
                            </ul>
                        </nav>
                    </div>
                </div>
                <div class="footer__copyrights">
                    <p>&copy; 2025 Geek Worldland. <span class="zylox-signature">| Powered by Zylox</span></p>
                </div>
            </div>
        </footer>`;
    }
}


