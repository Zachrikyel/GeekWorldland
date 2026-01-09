const colombiaData = {
    "Amazonas": ["Leticia", "Puerto Nariño"],
    "Antioquia": ["Medellín", "Bello", "Itagüí", "Envigado", "Apartadó", "Rionegro", "Turbo", "Caucasia", "Sabaneta", "La Estrella"],
    "Arauca": ["Arauca", "Arauquita", "Saravena", "Tame"],
    "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Galapa"],
    "Bolívar": ["Cartagena", "Magangué", "Turbaco", "El Carmen de Bolívar", "Arjona"],
    "Boyacá": ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa", "Villa de Leyva"],
    "Caldas": ["Manizales", "La Dorada", "Chinchiná", "Villamaría", "Riosucio"],
    "Caquetá": ["Florencia", "San Vicente del Caguán"],
    "Casanare": ["Yopal", "Aguazul", "Villanueva", "Paz de Ariporo"],
    "Cauca": ["Popayán", "Santander de Quilichao", "Puerto Tejada", "Patía"],
    "Cesar": ["Valledupar", "Aguachica", "Codazzi", "Bosconia"],
    "Chocó": ["Quibdó", "Istmina", "Tadó"],
    "Córdoba": ["Montería", "Lorica", "Sahagún", "Cereté", "Montelíbano"],
    "Cundinamarca": ["Bogotá D.C.", "Soacha", "Zipaquirá", "Fusagasugá", "Facatativá", "Chía", "Mosquera", "Madrid", "Funza", "Cajicá", "Girardot"],
    "Guainía": ["Inírida"],
    "Guaviare": ["San José del Guaviare", "Calamar"],
    "Huila": ["Neiva", "Pitalito", "Garzón", "La Plata"],
    "La Guajira": ["Riohacha", "Maicao", "Uribia", "Fonseca"],
    "Magdalena": ["Santa Marta", "Ciénaga", "Zona Bananera", "Fundación", "El Banco"],
    "Meta": ["Villavicencio", "Acacías", "Granada", "Puerto López"],
    "Nariño": ["Pasto", "Tumaco", "Ipiales", "Túquerres"],
    "Norte de Santander": ["Cúcuta", "Ocaña", "Villa del Rosario", "Los Patios", "Pamplona"],
    "Putumayo": ["Mocoa", "Puerto Asís", "Orito"],
    "Quindío": ["Armenia", "Calarcá", "La Tebaida", "Montenegro", "Quimbaya"],
    "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"],
    "San Andrés y Providencia": ["San Andrés", "Providencia"],
    "Santander": ["Bucaramanga", "Floridablanca", "Barrancabermeja", "Girón", "Piedecuesta", "San Gil", "Socorro"],
    "Sucre": ["Sincelejo", "Corozal", "San Onofre"],
    "Tolima": ["Ibagué", "Espinal", "Melgar", "Chaparral", "Líbano"],
    "Valle del Cauca": ["Cali", "Buenaventura", "Palmira", "Tuluá", "Yumbo", "Cartago", "Jamundí", "Buga", "Candelaria"],
    "Vaupés": ["Mitú"],
    "Vichada": ["Puerto Carreño"]
};

// ========== VARIABLES GLOBALES ==========
let selectedPaymentMethod = 'wompi';
let cartTotalValue = 0;
const TAX_RATE = 0.05;
let currentTaxValue = 0;
let currentProductsTotal = 0;
let isProcessingPayment = false; // ✅ FLAG PARA PREVENIR MÚLTIPLES CLICKS

// Configuración Wompi
const WOMPI_CONFIG = {
    PUBLIC_KEY: 'pub_prod_Rod7Z75KWyc81CwF4qkppsbuG9fsRrqW',
    INTEGRITY_SECRET: 'prod_integrity_FUbxnBEcWdrAf5elSawvMn9OQEzoXUGc'
};

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar dropdowns personalizados
    initCustomDropdowns();
    populateDepartments();
    initDeliveryDropdown();

    renderCheckoutSummary();
    checkUserAndPrefill();

    // ✅ PRIMERO verificamos si venimos de un redirect de Wompi
    await checkTransactionStatus();

    // Eventos
    document.getElementById('btnApplyDiscount').addEventListener('click', applyDiscount);
    document.getElementById('btnInitTransaction').addEventListener('click', processPayment);

    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-dropdown')) {
            document.querySelectorAll('.custom-dropdown.open').forEach(d => d.classList.remove('open'));
        }
    });
});

// ========== DROPDOWNS PERSONALIZADOS ==========
function initCustomDropdowns() {
    document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
        const selected = dropdown.querySelector('.dropdown-selected');

        selected.addEventListener('click', () => {
            if (dropdown.classList.contains('disabled')) return;

            // Cerrar otros dropdowns abiertos
            document.querySelectorAll('.custom-dropdown.open').forEach(d => {
                if (d !== dropdown) d.classList.remove('open');
            });

            dropdown.classList.toggle('open');
        });
    });
}

function populateDepartments() {
    const optionsList = document.getElementById('departmentOptions');
    optionsList.innerHTML = '';

    Object.keys(colombiaData).sort().forEach(dept => {
        const li = document.createElement('li');
        li.textContent = dept;
        li.dataset.value = dept;
        li.addEventListener('click', () => selectDepartment(dept));
        optionsList.appendChild(li);
    });
}

function selectDepartment(dept) {
    const dropdown = document.getElementById('departmentDropdown');
    const selected = dropdown.querySelector('.dropdown-selected');
    const hiddenInput = document.getElementById('departmentSelect');

    // Actualizar visual
    selected.querySelector('span').textContent = dept;
    selected.dataset.value = dept;
    hiddenInput.value = dept;

    // Marcar como seleccionado
    dropdown.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
    dropdown.querySelector(`li[data-value="${dept}"]`)?.classList.add('selected');

    // Cerrar dropdown
    dropdown.classList.remove('open');

    // Cargar ciudades
    loadCities(dept);
}

// ========== CARGAR CIUDADES ==========
window.loadCities = function (selectedDept) {
    const cityDropdown = document.getElementById('cityDropdown');
    const cityOptions = document.getElementById('cityOptions');
    const cityHidden = document.getElementById('citySelect');
    const citySelected = cityDropdown.querySelector('.dropdown-selected');

    // Limpiar
    cityOptions.innerHTML = '';
    cityHidden.value = '';
    citySelected.querySelector('span').textContent = 'Seleccionar...';
    citySelected.dataset.value = '';

    if (selectedDept && colombiaData[selectedDept]) {
        // Habilitar dropdown
        cityDropdown.classList.remove('disabled');

        // Poblar ciudades
        colombiaData[selectedDept].sort().forEach(city => {
            const li = document.createElement('li');
            li.textContent = city;
            li.dataset.value = city;
            li.addEventListener('click', () => selectCity(city));
            cityOptions.appendChild(li);
        });
    } else {
        cityDropdown.classList.add('disabled');
    }
}

function selectCity(city) {
    const dropdown = document.getElementById('cityDropdown');
    const selected = dropdown.querySelector('.dropdown-selected');
    const hiddenInput = document.getElementById('citySelect');

    // Actualizar visual
    selected.querySelector('span').textContent = city;
    selected.dataset.value = city;
    hiddenInput.value = city;

    // Marcar como seleccionado
    dropdown.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
    dropdown.querySelector(`li[data-value="${city}"]`)?.classList.add('selected');

    // Cerrar dropdown
    dropdown.classList.remove('open');
}

// ========== DROPDOWN ATERRIZAJE ==========
function initDeliveryDropdown() {
    const deliveryOptions = document.getElementById('deliveryOptions');
    if (!deliveryOptions) return;

    deliveryOptions.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
            const dropdown = document.getElementById('deliveryDropdown');
            const selected = dropdown.querySelector('.dropdown-selected');
            const hiddenInput = document.getElementById('deliveryTime');
            const value = li.dataset.value;
            const text = li.textContent;

            // Actualizar visual
            selected.querySelector('span').textContent = text;
            selected.dataset.value = value;
            hiddenInput.value = value;

            // Marcar como seleccionado
            deliveryOptions.querySelectorAll('li').forEach(l => l.classList.remove('selected'));
            li.classList.add('selected');

            // Cerrar dropdown
            dropdown.classList.remove('open');
        });
    });
}

// ========== RENDERIZAR RESUMEN ==========
function renderCheckoutSummary() {
    const container = document.getElementById('checkoutItems');
    const cart = JSON.parse(localStorage.getItem('geekCart')) || [];
    currentProductsTotal = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p style="color:#aaa; text-align:center; padding: 20px;">Tu carga está vacía.<br><a href="Arsenal-Geek.html" style="color:var(--primary-cyan)">Volver al radar</a></p>';
        updateTotalsDisplay(0, 0, 0);
        return;
    }

    container.innerHTML = cart.map((item, index) => {
        // ✅ USAR PRECIO YA CALCULADO DEL CARRITO
        // El carrito debe tener base_price ya calculado correctamente
        const unitPrice = item.base_price || 0;

        // ⚠️ VALIDACIÓN: Si base_price es 0, recalcular
        if (unitPrice === 0) {
            console.warn(`⚠️ Item sin precio válido: ${item.name}. Recalculando...`);
            // Intentar recalcular usando la función global
            const recalculated = window.calculateFinalPrice(item);
            if (recalculated > 0) {
                item.base_price = recalculated;
                unitPrice = recalculated;
            }
        }

        currentProductsTotal += unitPrice * item.quantity;
        const imgSrc = item.card_middle_url || item.image_url || 'images/Logo Header.png';
        const variantColor = item.selected_color || "Base";

        return `<div class="order-summary-item">
        <img src="${imgSrc}" class="prod-img" onerror="this.src='images/Logo Header.png'">
        <div class="prod-details">
            <h4>${item.name}</h4>
            
            <div style="font-size: 0.85rem; color: var(--primary-cyan); margin-bottom: 4px;">
                <i class='bx bxs-palette'></i> ${variantColor}
            </div>

            <p>Cant: ${item.quantity}</p>
        </div>
        <div class="prod-price">$${(unitPrice * item.quantity).toLocaleString('es-CO')}</div>
        <button class="btn-delete-item" onclick="removeItem(${index})" title="Expulsar del arsenal">
            <i class='bx bxs-trash'></i>
        </button>
    </div>`;
    }).join('');

    calculateAndShowTotals();
}

// ========== ELIMINAR ITEM ==========
window.removeItem = function (index) {
    let cart = JSON.parse(localStorage.getItem('geekCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('geekCart', JSON.stringify(cart));

    if (typeof showNotification === 'function') showNotification("🗑️ Artefacto eliminado.");

    document.getElementById('discountCode').value = '';
    const btn = document.getElementById('btnApplyDiscount');
    if (btn) {
        btn.textContent = "APLICAR";
        btn.disabled = false;
    }

    renderCheckoutSummary();

    if (typeof updateCartCount === 'function') updateCartCount();
}

// ========== CALCULAR TOTALES ==========
function calculateAndShowTotals(discountAmount = 0) {
    currentTaxValue = currentProductsTotal * TAX_RATE;
    const grandTotal = (currentProductsTotal + currentTaxValue) - discountAmount;

    document.getElementById('checkoutTax').textContent = '$' + currentTaxValue.toLocaleString('es-CO');
    document.getElementById('checkoutSubtotal').textContent = '$' + currentProductsTotal.toLocaleString('es-CO');
    document.getElementById('checkoutDiscount').textContent = '-$' + discountAmount.toLocaleString('es-CO');
    document.getElementById('checkoutTotal').textContent = '$' + grandTotal.toLocaleString('es-CO');

    window.cartTotalValue = grandTotal;
}

// ========== APLICAR DESCUENTO ==========
window.applyDiscount = async function () {
    const codeInput = document.getElementById('discountCode');
    const btn = document.getElementById('btnApplyDiscount');
    const code = codeInput.value.trim().toUpperCase();

    if (!code) return;

    btn.textContent = "...";
    btn.disabled = true;

    const { data, error } = await window.supabaseClient
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('active', true)
        .single();

    if (error || !data) {
        if (typeof showNotification === 'function') showNotification("❌ Código inválido");
        else alert("Código inválido");
        btn.textContent = "APLICAR";
        btn.disabled = false;
        return;
    }

    const discountAmount = currentProductsTotal * (data.discount_percentage / 100);
    calculateAndShowTotals(discountAmount);

    btn.textContent = "✅";
    showNotification(`✅ Descuento de ${data.discount_percentage}% aplicado`);
}

// ========== PRE-LLENAR DATOS ==========
async function checkUserAndPrefill() {
    if (!window.supabaseClient) return;
    const { data: { user } } = await window.supabaseClient.auth.getUser();

    // Mostrar/ocultar campo de email para invitados
    const guestEmailGroup = document.getElementById('guest-email-group');
    if (guestEmailGroup) {
        guestEmailGroup.style.display = user ? 'none' : 'block';
    }

    if (user) {
        const saveCheck = document.getElementById('saveInfoCheck');
        if (saveCheck) saveCheck.checked = true;

        const { data: profile } = await window.supabaseClient.from('users').select('*').eq('id', user.id).single();
        const { data: address } = await window.supabaseClient.from('user_addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).limit(1).single();

        if (profile) {
            if (document.getElementById('fullName')) document.getElementById('fullName').value = profile.full_name || '';
            if (document.getElementById('nickname')) document.getElementById('nickname').value = profile.username || '';
            if (document.getElementById('phone1')) document.getElementById('phone1').value = profile.phone || '';

            const promoCheckbox = document.getElementById('promoConsentCheck');
            if (promoCheckbox) {
                promoCheckbox.checked = profile.marketing_consent || false;
            }
        }

        if (address) {
            if (document.getElementById('addressHome')) document.getElementById('addressHome').value = address.address_line_1 || '';
            if (document.getElementById('postalCode')) document.getElementById('postalCode').value = address.zip_code || '';
        }
    }
}

// ========== SELECCIONAR MÉTODO DE PAGO ==========
window.selectPayment = function (method, element) {
    if (element.classList.contains('disabled')) return;
    selectedPaymentMethod = method;
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
}

// ========== PROCESAR PAGO (CORREGIDO) ==========
window.processPayment = async function () {
    // ✅ PREVENIR MÚLTIPLES EJECUCIONES
    if (isProcessingPayment) {
        console.log("⚠️ Ya hay un proceso de pago en curso");
        return;
    }

    const btn = document.getElementById('btnInitTransaction');

    // 1. VALIDACIÓN - Obtener usuario primero para saber qué campos requerir
    const { data: { user } } = await window.supabaseClient.auth.getUser();

    // Si NO hay usuario, requerimos email para invitado
    const required = ['fullName', 'nickname', 'phone1', 'addressHome', 'departmentSelect', 'citySelect'];
    if (!user) {
        required.push('guestEmail'); // Campo de email para invitados
    }

    let valid = true;
    required.forEach(id => {
        const el = document.getElementById(id);
        if (!el || !el.value.trim()) {
            if (el) el.style.borderColor = 'red';
            valid = false;
        } else {
            el.style.borderColor = 'rgba(255,255,255,0.2)';
        }
    });

    if (!valid) {
        if (!user && !document.getElementById('guestEmail')?.value.trim()) {
            showNotification("⚠️ Ingresa tu email para continuar como invitado.");
        } else {
            showNotification("⚠️ Faltan datos de la misión.");
        }
        return;
    }

    if (window.cartTotalValue <= 0) {
        showNotification("⚠️ Tu carrito está vacío");
        return;
    }

    // ✅ BLOQUEAR PROCESAMIENTO
    isProcessingPayment = true;
    btn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> PROCESANDO...";
    btn.disabled = true;

    try {
        // 2. EMAIL PARA TRANSACCIÓN (usuario logueado o invitado)
        const guestEmailInput = document.getElementById('guestEmail');
        const guestEmail = guestEmailInput ? guestEmailInput.value.trim() : '';
        const customerEmail = user ? user.email : guestEmail;

        if (!customerEmail) {
            throw new Error("Se requiere un email para procesar el pago.");
        }

        // 3. GUARDAR DATOS Y PERMISOS (solo si hay usuario logueado)
        if (user && document.getElementById('saveInfoCheck')?.checked) {
            await window.supabaseClient.from('users').update({
                full_name: document.getElementById('fullName').value,
                phone: document.getElementById('phone1').value,
                marketing_consent: document.getElementById('promoConsentCheck')?.checked || false
            }).eq('id', user.id);
        }

        // 4. PREPARAR DATOS WOMPI
        const amountInCents = Math.round(window.cartTotalValue * 100);
        // Generar referencia única (con user.id si existe, o timestamp + random si es invitado)
        const reference = user
            ? `ORD-${Date.now()}-${user.id.slice(0, 8)}`
            : `ORD-${Date.now()}-G${Math.random().toString(36).slice(2, 8)}`;
        const currency = 'COP';

        // 🧠 CÁLCULO DE GANANCIA (PROFIT)
        const cart = JSON.parse(localStorage.getItem('geekCart')) || [];

        // Sumamos la ganancia individual de cada producto
        const totalProfit = cart.reduce((sum, item) => {
            const itemProfit = parseFloat(item.profit_margin) || 0;
            return sum + (itemProfit * item.quantity);
        }, 0);

        // Ganancia calculada (no mostrar en consola por seguridad)

        // 5. CREAR ORDEN EN BASE DE DATOS
        const orderPayload = {
            total_amount: window.cartTotalValue,
            status: 'pending_payment',
            payment_method: 'Wompi',
            wompi_reference: reference,
            currency: 'COP',
            total_profit: totalProfit,
            order_source: 'web',
            shipping_address: {
                address: document.getElementById('addressHome').value,
                city: document.getElementById('citySelect').value,
                dept: document.getElementById('departmentSelect').value,
                postal_code: document.getElementById('postalCode').value || '',
                delivery_window: document.getElementById('deliveryTime')?.value || 'Anytime',
                additional_notes: document.getElementById('addressDetails')?.value || ''
            }
        };

        // Usuario maestro para compras anónimas
        const MASTER_USER_ID = 'c4a011c5-d8af-47ab-bc2f-f245b3cf6462';

        // Agregar user_id (del usuario o del maestro para invitados)
        if (user) {
            orderPayload.user_id = user.id;
        } else {
            orderPayload.user_id = MASTER_USER_ID; // Asignar al usuario maestro
            orderPayload.guest_email = guestEmail; // Mantener email del invitado para contacto
        }

        const { data: orderData, error: orderError } = await window.supabaseClient
            .from('orders')
            .insert([orderPayload])
            .select()
            .single();

        if (orderError) throw orderError;

        console.log("✅ Orden creada:", orderData.id);

        // 6. CREAR ORDER ITEMS (En tabla separada)

        if (cart.length > 0) {
            const orderItems = cart.map(item => ({
                order_id: orderData.id,
                product_id: item.id,
                quantity: item.quantity,
                // Usamos el precio final real calculado
                unit_price: item.base_price || (item.sale_price > 0 ? item.sale_price : item.compare_at_price) || 0,
                subtotal: (item.base_price || (item.sale_price > 0 ? item.sale_price : item.compare_at_price) || 0) * item.quantity,
                selected_color: item.selected_color || 'Base',
                selected_size: item.selected_size || null,
                custom_notes: item.custom_notes || null
            }));

            const { error: itemsError } = await window.supabaseClient
                .from('order_items')
                .insert(orderItems);

            if (itemsError) {
                console.error("⚠️ Error creando items:", itemsError);
                // No lanzamos error aquí, la orden ya existe
            } else {
                console.log("✅ Items de orden creados:", orderItems.length);
            }
        }

        // 7. GENERAR FIRMA DE INTEGRIDAD
        const chain = `${reference}${amountInCents}${currency}${WOMPI_CONFIG.INTEGRITY_SECRET}`;
        const encondedText = new TextEncoder().encode(chain);
        const hashBuffer = await crypto.subtle.digest("SHA-256", encondedText);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const integritySignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        console.log("🔐 Firma generada:", integritySignature);

        // 8. CREAR WIDGET DE WOMPI
        const widgetContainer = document.getElementById('wompi-widget-container');
        widgetContainer.innerHTML = '';
        widgetContainer.style.display = 'block'; // Mostrar para debug/backup manual

        const script = document.createElement('script');
        script.src = "https://checkout.wompi.co/widget.js";
        script.setAttribute('data-render', 'button');
        script.setAttribute('data-public-key', WOMPI_CONFIG.PUBLIC_KEY);
        script.setAttribute('data-currency', currency);
        script.setAttribute('data-amount-in-cents', amountInCents);
        script.setAttribute('data-reference', reference);
        script.setAttribute('data-signature:integrity', integritySignature);
        script.setAttribute('data-redirect-url', window.location.href);

        // Datos del cliente (usar email del usuario o del invitado)
        script.setAttribute('data-customer-data:email', customerEmail);
        script.setAttribute('data-customer-data:full-name', document.getElementById('fullName').value);
        script.setAttribute('data-customer-data:phone-number', document.getElementById('phone1').value);
        script.setAttribute('data-customer-data:phone-number-prefix', '+57');

        const form = document.createElement('form');
        form.appendChild(script);
        widgetContainer.appendChild(form);

        // 9. AUTO-CLICK MEJORADO CON TIMEOUT
        btn.innerHTML = "🚀 CONECTANDO...";

        let attempts = 0;
        const maxAttempts = 30; // 15 segundos

        const clickInterval = setInterval(() => {
            const wompiBtn = widgetContainer.querySelector('.wompi-button');

            if (wompiBtn) {
                clearInterval(clickInterval);
                wompiBtn.click();
                btn.innerHTML = "💳 COMPLETAR EN WOMPI...";
                showNotification("🚀 Abriendo pasarela de pago...");
            } else {
                attempts++;
                if (attempts >= maxAttempts) {
                    clearInterval(clickInterval);
                    widgetContainer.style.display = 'block';
                    btn.style.display = 'none';
                    isProcessingPayment = false; // ✅ LIBERAR FLAG
                    showNotification("⚠️ Haz click en el botón azul de Wompi.");
                }
            }
        }, 500);

    } catch (err) {
        console.error("❌ Error:", err);
        showNotification("❌ Error: " + err.message);
        btn.disabled = false;
        btn.innerHTML = "🔄 REINTENTAR";
        isProcessingPayment = false; // ✅ LIBERAR FLAG EN CASO DE ERROR
    }
}

// ========== VERIFICAR ESTADO DE TRANSACCIÓN (CORREGIDO) ==========
async function checkTransactionStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('id');

    if (!transactionId) return; // No hay transacción que verificar

    console.log("🔍 Detectado retorno de Wompi. ID:", transactionId);

    const btn = document.getElementById('btnInitTransaction');
    if (btn) {
        btn.innerHTML = "🔄 VERIFICANDO PAGO...";
        btn.disabled = true;
    }

    try {
        // 1. CONSULTAR ESTADO EN WOMPI
        const response = await fetch(`https://sandbox.wompi.co/v1/transactions/${transactionId}`);

        if (!response.ok) {
            throw new Error('Error consultando Wompi');
        }

        const data = await response.json();
        const status = data.data.status;
        const reference = data.data.reference;

        console.log("📊 Estado Wompi:", status);
        console.log("📝 Referencia:", reference);

        if (status === 'APPROVED') {
            // 2. ACTUALIZAR ORDEN EN supabaseClient (A PAGADO)
            const { data: updateData, error: updateError } = await window.supabaseClient
                .from('orders')
                .update({
                    status: 'paid',
                    wompi_transaction_id: transactionId,
                    updated_at: new Date().toISOString()
                })
                .eq('wompi_reference', reference)
                .select()
                .single();

            if (updateError) {
                console.error("Error actualizando orden:", updateError);
                throw updateError;
            }

            console.log("✅ Orden pagada. Iniciando protocolo de inventario...");

            // 🧠 NUEVO: DESCONTAR STOCK (CRÍTICO) 📉
            // Paso A: Obtener qué productos tenía esa orden
            const { data: orderItems, error: itemsError } = await window.supabaseClient
                .from('order_items')
                .select('product_id, quantity')
                .eq('order_id', updateData.id);

            if (!itemsError && orderItems && orderItems.length > 0) {
                console.log(`📉 Descontando ${orderItems.length} tipos de items del arsenal...`);

                // Paso B: Recorrer y ejecutar la función segura (RPC) por cada item
                for (const item of orderItems) {
                    const { error: stockError } = await window.supabaseClient.rpc('decrease_stock_atomic', {
                        p_id: item.product_id,
                        qty: item.quantity
                    });

                    if (stockError) console.error(`❌ Error descontando ID ${item.product_id}:`, stockError);
                }
                console.log("✅ Inventario actualizado.");
            }

            // 3. MOSTRAR MODAL DE ÉXITO
            const successModal = document.getElementById('successModal');
            if (successModal) {
                successModal.classList.add('active');

                // Actualizar datos del modal
                const userSpan = document.getElementById('successUser');
                const orderSpan = document.getElementById('orderIdDisplay');

                if (userSpan) userSpan.textContent = document.getElementById('nickname').value || 'Agente';
                if (orderSpan) orderSpan.textContent = reference;
            }

            // 4. LIMPIAR CARRITO
            localStorage.removeItem('geekCart');
            if (typeof updateCartCount === 'function') updateCartCount();

            // 5. LIMPIAR URL
            window.history.replaceState({}, document.title, window.location.pathname);

            showNotification("✅ ¡Pago exitoso!");

        } else if (status === 'DECLINED') {
            showNotification("❌ Pago rechazado. Intenta con otro método.");
            if (btn) {
                btn.innerHTML = "🔄 REINTENTAR PAGO";
                btn.disabled = false;
            }
            window.history.replaceState({}, document.title, window.location.pathname);

        } else if (status === 'ERROR') {
            showNotification("⚠️ Error en la transacción. Intenta nuevamente.");
            if (btn) {
                btn.innerHTML = "🔄 REINTENTAR PAGO";
                btn.disabled = false;
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            // PENDING u otro estado
            showNotification(`⏳ Estado: ${status}. Refrescando...`);
            setTimeout(() => window.location.reload(), 3000);
        }

    } catch (error) {
        console.error("❌ Error verificando pago:", error);
        showNotification("⚠️ Error verificando estado del pago.");
        if (btn) {
            btn.innerHTML = "🔄 REINTENTAR";
            btn.disabled = false;
        }
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// ========== HELPER FUNCTIONS ==========
function updateTotalsDisplay(tax, sub, total) {
    document.getElementById('checkoutTax').textContent = '$0';
    document.getElementById('checkoutSubtotal').textContent = '$0';
    document.getElementById('checkoutTotal').textContent = '$0';
    document.getElementById('checkoutDiscount').textContent = '$0';
    window.cartTotalValue = 0;
}