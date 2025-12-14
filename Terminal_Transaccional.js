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
    const deptSelect = document.getElementById('departmentSelect');

    Object.keys(colombiaData).sort().forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        deptSelect.appendChild(option);
    });

    renderCheckoutSummary();
    checkUserAndPrefill();

    // ✅ PRIMERO verificamos si venimos de un redirect de Wompi
    await checkTransactionStatus();

    // Eventos
    document.getElementById('btnApplyDiscount').addEventListener('click', applyDiscount);
    document.getElementById('btnInitTransaction').addEventListener('click', processPayment);
});

// ========== CARGAR CIUDADES ==========
window.loadCities = function () {
    const deptSelect = document.getElementById('departmentSelect');
    const citySelect = document.getElementById('citySelect');
    const selectedDept = deptSelect.value;

    citySelect.innerHTML = '<option value="">Seleccionar...</option>';

    if (selectedDept && colombiaData[selectedDept]) {
        citySelect.disabled = false;
        colombiaData[selectedDept].sort().forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    } else {
        citySelect.disabled = true;
    }
}

// ========== RENDERIZAR RESUMEN ==========
function renderCheckoutSummary() {
    const container = document.getElementById('checkoutItems');
    const cart = JSON.parse(localStorage.getItem('geekCart')) || [];
    currentProductsTotal = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p style="color:#aaa; text-align:center; padding: 20px;">Tu carga está vacía.<br><a href="Geek-Worldland.html" style="color:var(--primary-cyan)">Volver al radar</a></p>';
        updateTotalsDisplay(0, 0, 0);
        return;
    }

    container.innerHTML = cart.map((item, index) => {
        currentProductsTotal += item.base_price * item.quantity;
        const imgSrc = item.card_middle_url || item.image_url || 'images/Logo Header.png';

        // --- NUEVO CÓDIGO: LÓGICA DE VISUALIZACIÓN DE VARIANTE ---
        const variantColor = item.selected_color || "Base";
        // ---------------------------------------------------------

        return `<div class="order-summary-item">
        <img src="${imgSrc}" class="prod-img" onerror="this.src='images/Logo Header.png'">
        <div class="prod-details">
            <h4>${item.name}</h4>
            
            <div style="font-size: 0.85rem; color: var(--primary-cyan); margin-bottom: 4px;">
                <i class='bx bxs-palette'></i> ${variantColor}
            </div>

            <p>Cant: ${item.quantity}</p>
        </div>
        <div class="prod-price">$${(item.base_price * item.quantity).toLocaleString('es-CO')}</div>
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

    const { data, error } = await supabase
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
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const saveCheck = document.getElementById('saveInfoCheck');
        if (saveCheck) saveCheck.checked = true;

        const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
        const { data: address } = await supabase.from('user_addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).limit(1).single();

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

    // 1. VALIDACIÓN
    const required = ['fullName', 'nickname', 'phone1', 'addressHome', 'departmentSelect', 'citySelect'];
    let valid = true;
    required.forEach(id => {
        const el = document.getElementById(id);
        if (!el.value.trim()) {
            el.style.borderColor = 'red';
            valid = false;
        } else {
            el.style.borderColor = 'rgba(255,255,255,0.2)';
        }
    });

    if (!valid) {
        showNotification("⚠️ Faltan datos de la misión.");
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
        // 2. OBTENER USUARIO
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Debes iniciar sesión.");

        // 3. GUARDAR DATOS Y PERMISOS
        if (document.getElementById('saveInfoCheck').checked) {
            await supabase.from('users').update({
                full_name: document.getElementById('fullName').value,
                phone: document.getElementById('phone1').value,
                marketing_consent: document.getElementById('promoConsentCheck').checked
            }).eq('id', user.id);
        }

        // 4. PREPARAR DATOS WOMPI
        const amountInCents = Math.round(window.cartTotalValue * 100);
        const reference = `ORD-${Date.now()}-${user.id.slice(0, 8)}`;
        const currency = 'COP';

        // 5. CREAR ORDEN EN BASE DE DATOS
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_id: user.id,
                total_amount: window.cartTotalValue,
                status: 'pending_payment',
                payment_method: 'Wompi',
                wompi_reference: reference,
                currency: 'COP',
                shipping_address: {
                    address: document.getElementById('addressHome').value,
                    city: document.getElementById('citySelect').value,
                    dept: document.getElementById('departmentSelect').value,
                    postal_code: document.getElementById('postalCode').value || '',
                    delivery_window: document.getElementById('deliveryTime')?.value || 'Anytime',
                    additional_notes: document.getElementById('addressDetails')?.value || ''
                }
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        console.log("✅ Orden creada:", orderData.id);

        // 6. CREAR ORDER ITEMS (En tabla separada)
        const cart = JSON.parse(localStorage.getItem('geekCart')) || [];

        if (cart.length > 0) {
            const orderItems = cart.map(item => ({
                order_id: orderData.id,
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.base_price,
                subtotal: item.base_price * item.quantity,
                selected_color: item.selected_color || 'Base',
                selected_size: item.selected_size || null,
                custom_notes: item.custom_notes || null
            }));

            const { error: itemsError } = await supabase
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
        widgetContainer.style.display = 'none';

        const script = document.createElement('script');
        script.src = "https://checkout.wompi.co/widget.js";
        script.setAttribute('data-render', 'button');
        script.setAttribute('data-public-key', WOMPI_CONFIG.PUBLIC_KEY);
        script.setAttribute('data-currency', currency);
        script.setAttribute('data-amount-in-cents', amountInCents);
        script.setAttribute('data-reference', reference);
        script.setAttribute('data-signature:integrity', integritySignature);
        script.setAttribute('data-redirect-url', window.location.href);

        // Datos del cliente
        script.setAttribute('data-customer-data:email', user.email);
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
            // 2. ACTUALIZAR ORDEN EN SUPABASE
            const { data: updateData, error: updateError } = await supabase
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

            console.log("✅ Orden actualizada:", updateData);

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