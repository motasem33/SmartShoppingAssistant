/**
 * Smart Shopping Assistant - Core Application Logic
 * Managed by: Abdulrahman Adel Al-Qawasmeh
 */

// 1. إعدادات الأدمن (Front-end Only)
const ADMIN_CONFIG = {
    email: "admin@smart.com",
    password: "Admin123",
    dashboardUrl: "/admin-dashboard.html"
};

// 2. وظيفة زر الأدمن - تعبئة البيانات تلقائياً
function adminMode() {
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');

    if (emailInput && passInput) {
        emailInput.value = ADMIN_CONFIG.email;
        passInput.value = ADMIN_CONFIG.password;

        const msg = document.getElementById('responseMessage');
        if (msg) {
            msg.style.color = "#4f46e5";
            msg.innerText = "تم تفعيل وضع المشرف. اضغط دخول للمتابعة.";
        }
    }
}

// 3. منطق شاشة تسجيل الدخول (Login)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const msg = document.getElementById('responseMessage');

        msg.innerText = "جاري المصادقة...";
        msg.style.color = "#4f46e5";

        if (email === ADMIN_CONFIG.email && password === ADMIN_CONFIG.password) {
            msg.style.color = "#059669";
            msg.innerText = "🚀 مرحباً أيها المدير! جاري الدخول للوحة التحكم...";
            setTimeout(() => {
                window.location.href = ADMIN_CONFIG.dashboardUrl;
            }, 1500);
            return;
        }

        try {
            const response = await fetch('/api/Auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                msg.style.color = "#059669";
                msg.innerText = "✅ مرحباً بك! تم الدخول بنجاح.";
                localStorage.setItem('userToken', data.token);
                setTimeout(() => {
                    window.location.href = '/products.html';
                }, 1500);
            } else {
                msg.style.color = "#dc2626";
                msg.innerText = "❌ فشل الدخول: " + (data.message || "البيانات خاطئة");
            }
        } catch (error) {
            msg.style.color = "#dc2626";
            msg.innerText = "⚠️ خطأ: السيرفر غير متصل.";
        }
    });
}

// 4. منطق شاشة إنشاء الحساب (Register)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('regEmail').value;
        const pass = document.getElementById('regPassword').value;
        const confirmPass = document.getElementById('confirmPassword').value;
        const msg = document.getElementById('regMessage');

        if (pass !== confirmPass) {
            msg.style.color = "#dc2626";
            msg.innerText = "❌ كلمات المرور غير متطابقة!";
            return;
        }

        msg.style.color = "#4f46e5";
        msg.innerText = "جاري إنشاء الحساب في قاعدة البيانات...";

        try {
            const response = await fetch('/api/Auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: pass
                })
            });

            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            }

            if (response.ok) {
                msg.style.color = "#059669";
                msg.innerText = "✅ تم إنشاء الحساب بنجاح! جاري تحويلك لصفحة الدخول...";
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                msg.style.color = "#dc2626";
                let errorDetail = "فشل التسجيل";
                if (data && data.errors) {
                    errorDetail = Object.values(data.errors).flat()[0];
                } else if (data && data.message) {
                    errorDetail = data.message;
                }
                msg.innerText = "❌ " + errorDetail;
            }
        } catch (error) {
            msg.style.color = "#dc2626";
            msg.innerText = "⚠️ خطأ: لا يمكن الوصول للسيرفر.";
            console.error("Register Error:", error);
        }
    });
}

/* =========================================
   إدارة المنتجات (Admin Products CRUD)
   ========================================= */

function openModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('modalMsg').innerText = '';
    }
}

function closeModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('addProductForm').reset();
    }
}

async function fetchAdminProducts() {
    const tableBody = document.getElementById('adminProductsTable');
    if (!tableBody) return;

    try {
        const response = await fetch('/api/Products', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('userToken') }
        });

        if (response.ok) {
            const products = await response.json();
            tableBody.innerHTML = '';

            if (products.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">لا توجد منتجات حالياً.</td></tr>';
                return;
            }

            products.forEach(p => {
                const imgTag = p.imageUrl ? `<img src="${p.imageUrl}" style="width:30px; height:30px; border-radius:5px; vertical-align:middle; margin-left:10px; object-fit:cover;">` : '';

                tableBody.innerHTML += `
                    <tr>
                        <td>#${p.id}</td>
                        <td>${imgTag} ${p.name}</td>
                        <td style="color: #4ade80; font-weight: bold;">$${p.price}</td>
                        <td>
                            <button class="btn-action edit" onclick="editProduct(${p.id}, '${p.name}', ${p.price}, '${p.imageUrl || ''}')"><i class="fas fa-edit"></i></button>
                            <button class="btn-action delete" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #ef4444;">⚠️ فشل الاتصال بالخادم.</td></tr>';
    }
}

const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
    addProductForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('prodName').value;
        const price = document.getElementById('prodPrice').value;
        const imageUrl = document.getElementById('prodImage') ? document.getElementById('prodImage').value : '';
        const msg = document.getElementById('modalMsg');

        msg.style.color = "#818cf8";
        msg.innerText = "جاري الحفظ...";

        try {
            const response = await fetch('/api/Products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('userToken')
                },
                body: JSON.stringify({
                    Name: name,
                    Price: parseFloat(price),
                    ImageUrl: imageUrl,
                    Description: "بدون وصف",
                    Category: "عام",
                    StockQuantity: 10
                })
            });

            if (response.ok) {
                msg.style.color = "#4ade80";
                msg.innerText = "✅ تم إضافة المنتج بنجاح!";
                fetchAdminProducts();
                setTimeout(closeModal, 1000);
            } else {
                msg.style.color = "#ef4444";
                msg.innerText = "❌ فشل الإضافة، تأكد من صحة البيانات.";
            }
        } catch (error) {
            msg.style.color = "#ef4444";
            msg.innerText = "⚠️ خطأ في الاتصال بالخادم.";
        }
    });
}

async function editProduct(id, currentName, currentPrice, currentImageUrl) {
    const newName = prompt("أدخل اسم المنتج الجديد:", currentName);
    if (!newName) return;
    const newPrice = prompt("أدخل السعر الجديد:", currentPrice);
    if (!newPrice) return;
    const newImage = prompt("أدخل رابط الصورة الجديد (اختياري):", currentImageUrl);

    try {
        const response = await fetch(`/api/Products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            },
            body: JSON.stringify({
                Id: id,
                Name: newName,
                Price: parseFloat(newPrice),
                ImageUrl: newImage,
                Description: "بدون وصف",
                Category: "عام",
                StockQuantity: 10
            })
        });

        if (response.ok) {
            alert("تم تحديث بيانات المنتج بنجاح!");
            fetchAdminProducts();
            if (document.getElementById('customerProductsGrid')) {
                fetchCustomerProducts();
            }
        } else {
            alert("فشل تحديث بيانات المنتج.");
        }
    } catch (error) {
        console.error("Error updating product:", error);
    }
}

async function deleteProduct(id) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        try {
            const response = await fetch(`/api/Products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('userToken') }
            });

            if (response.ok) {
                fetchAdminProducts();
            } else {
                alert('فشل الحذف من السيرفر');
            }
        } catch (error) {
            alert('⚠️ خطأ في الاتصال بالسيرفر');
        }
    }
}

/* =========================================
   إدارة المستخدمين (Admin Users CRUD)
   ========================================= */

function openUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('userModalMsg').innerText = '';
    }
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('addUserForm').reset();
    }
}

async function fetchAdminUsers() {
    const tableBody = document.getElementById('adminUsersTable');
    if (!tableBody) return;

    try {
        const response = await fetch('/api/Users', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('userToken') }
        });

        if (response.ok) {
            const users = await response.json();
            tableBody.innerHTML = '';

            if (users.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">لا يوجد مستخدمين حالياً.</td></tr>';
                return;
            }

            users.forEach((user, index) => {
                const roleBadge = user.role === 'Admin'
                    ? '<span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem;">مشرف</span>'
                    : '<span style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem;">مستخدم</span>';

                tableBody.innerHTML += `
                    <tr>
                        <td>#${index + 1}</td>
                        <td>${user.email}</td>
                        <td>${roleBadge}</td>
                        <td>
                            <button class="btn-action edit" onclick="editUser('${user.id}', '${user.email}')"><i class="fas fa-edit"></i></button>
                            <button class="btn-action delete" onclick="deleteUser('${user.id}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #ef4444;">⚠️ فشل الاتصال بالخادم.</td></tr>';
    }
}

const addUserForm = document.getElementById('addUserForm');
if (addUserForm) {
    addUserForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('userEmail').value;
        const password = document.getElementById('userPassword').value;
        const role = document.getElementById('userRole').value;
        const msg = document.getElementById('userModalMsg');

        msg.style.color = "#818cf8";
        msg.innerText = "جاري حفظ المستخدم...";

        try {
            const response = await fetch('/api/Users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('userToken')
                },
                body: JSON.stringify({ Email: email, Password: password, Role: role })
            });

            if (response.ok) {
                msg.style.color = "#4ade80";
                msg.innerText = "✅ تم إضافة المستخدم بنجاح!";
                fetchAdminUsers();
                setTimeout(closeUserModal, 1000);
            } else {
                msg.style.color = "#ef4444";
                msg.innerText = "❌ فشل الإضافة، تأكد من صحة البيانات.";
            }
        } catch (error) {
            msg.style.color = "#ef4444";
            msg.innerText = "⚠️ خطأ في الاتصال بالخادم.";
        }
    });
}

async function editUser(id, currentEmail) {
    const newEmail = prompt("أدخل البريد الإلكتروني الجديد:", currentEmail);
    if (!newEmail || newEmail === currentEmail) return;

    try {
        const response = await fetch(`/api/Users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            },
            body: JSON.stringify({ Email: newEmail, Role: "User" })
        });

        if (response.ok) {
            alert("تم تحديث بيانات المستخدم");
            fetchAdminUsers();
        } else {
            alert("فشل تحديث البيانات");
        }
    } catch (error) {
        console.error("Error updating user:", error);
    }
}

async function deleteUser(id) {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        try {
            const response = await fetch(`/api/Users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('userToken') }
            });
            if (response.ok) fetchAdminUsers();
        } catch (error) {
            alert('حدث خطأ أثناء الحذف');
        }
    }
}

/* =========================================
   إدارة الطلبات (Admin Orders CRUD) 
   ========================================= */

async function fetchAdminOrders() {
    const tableBody = document.getElementById('adminOrdersTable');
    if (!tableBody) return;

    try {
        const response = await fetch('/api/Orders', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('userToken') }
        });

        if (response.ok) {
            const orders = await response.json();
            tableBody.innerHTML = '';

            if (orders.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">لا توجد طلبات حالياً.</td></tr>';
                return;
            }

            orders.forEach(order => {
                const orderDate = new Date(order.orderDate).toLocaleDateString('ar-EG');

                tableBody.innerHTML += `
                    <tr>
                        <td>#${order.id}</td>
                        <td>${order.customerName || 'مستخدم غير معروف'}</td>
                        <td>${orderDate}</td>
                        <td style="color: #4ade80; font-weight: bold;">$${order.totalAmount}</td>
                        <td>
                            <select onchange="updateOrderStatus(${order.id}, this.value)" style="background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 5px; padding: 5px; outline: none;">
                                <option style="color: black;" value="قيد الانتظار" ${order.status === 'قيد الانتظار' ? 'selected' : ''}>قيد الانتظار</option>
                                <option style="color: black;" value="مشحون" ${order.status === 'مشحون' ? 'selected' : ''}>مشحون</option>
                                <option style="color: black;" value="مكتمل" ${order.status === 'مكتمل' ? 'selected' : ''}>مكتمل</option>
                            </select>
                        </td>
                        <td>
                            <button class="btn-action delete" onclick="deleteOrder(${order.id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ef4444;">⚠️ فشل الاتصال بالخادم.</td></tr>';
    }
}

async function updateOrderStatus(id, newStatus) {
    try {
        const response = await fetch(`/api/Orders/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            },
            body: JSON.stringify(newStatus)
        });

        if (!response.ok) {
            alert('فشل تحديث حالة الطلب');
            fetchAdminOrders();
        }
    } catch (error) {
        alert('⚠️ خطأ في الاتصال بالخادم');
    }
}

async function deleteOrder(id) {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
        try {
            const response = await fetch(`/api/Orders/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('userToken') }
            });
            if (response.ok) fetchAdminOrders();
        } catch (error) {
            alert('حدث خطأ أثناء حذف الطلب');
        }
    }
}

/* =========================================
   إعدادات النظام (Admin Settings)
   ========================================= */

const storeSettingsForm = document.getElementById('storeSettingsForm');
if (storeSettingsForm) {
    storeSettingsForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const msg = document.getElementById('storeMsg');

        msg.style.color = "#4ade80";
        msg.innerText = "✅ تم حفظ إعدادات المتجر بنجاح!";

        setTimeout(() => { msg.innerText = ""; }, 3000);
    });
}

const securitySettingsForm = document.getElementById('securitySettingsForm');
if (securitySettingsForm) {
    securitySettingsForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const pass1 = document.getElementById('newPassword').value;
        const pass2 = document.getElementById('confirmNewPassword').value;
        const msg = document.getElementById('securityMsg');

        if (pass1 !== pass2) {
            msg.style.color = "#ef4444";
            msg.innerText = "❌ كلمات المرور غير متطابقة!";
            return;
        }

        msg.style.color = "#4ade80";
        msg.innerText = "✅ تم تحديث كلمة المرور بنجاح!";
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';

        setTimeout(() => { msg.innerText = ""; }, 3000);
    });
}

/* =========================================
   صفحة الزبائن (السلة، المفضلة، الفلاتر، والتوصيات)
   ========================================= */

// ذاكرة تخزين السلة والمفضلة والمنتجات للفلترة
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
let wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
let globalProductsList = [];

function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (badge) badge.innerText = cartItems.length;

    const wishlistBadge = document.getElementById('wishlistBadge');
    if (wishlistBadge) wishlistBadge.innerText = wishlistItems.length;
}

// دالة إضافة منتج للسلة
function addToCart(id, name, price, img) {
    cartItems.push({ id, name, price, img });
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartBadge();
    alert(`تمت إضافة "${name}" إلى سلة المشتريات 🛒`);
}

// دالة تفعيل قلب المفضلة وحفظه
function toggleWishlist(btn, id, name, price, img) {
    const icon = btn.querySelector('i');

    // إذا تم تمرير الـ id، معناه إننا بنحفظ بالداتا الوهمية للمفضلة
    if (id !== undefined) {
        const index = wishlistItems.findIndex(item => item.id === id);
        if (index === -1) {
            wishlistItems.push({ id, name, price, img });
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#ef4444';
        } else {
            wishlistItems.splice(index, 1);
            icon.classList.remove('fas');
            icon.classList.add('far');
            icon.style.color = '';
        }
        localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
        updateCartBadge();
    } else {
        // تفاعل شكلي للكروت الثابتة اللي بالـ HTML
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#ef4444';
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            icon.style.color = '';
        }
    }
}

// تفعيل أزرار الهيدر وزر "تسوق الآن"
function initializeCustomerButtons() {
    updateCartBadge();

    const shopNowBtn = document.getElementById('shopNowBtn');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', () => {
            const grid = document.getElementById('customerProductsGrid');
            if (grid) grid.scrollIntoView({ behavior: 'smooth' });
        });
    }

    const headerCartBtn = document.getElementById('headerCartBtn');
    if (headerCartBtn) {
        headerCartBtn.addEventListener('click', () => {
            if (cartItems.length > 0) {
                alert(`سلتك تحتوي على ${cartItems.length} منتجات. سيتم برمجتها قريباً!`);
            } else {
                alert('سلة المشتريات فارغة حالياً.');
            }
        });
    }

    const wishlistHeaderBtn = document.getElementById('wishlistHeaderBtn');
    if (wishlistHeaderBtn) {
        wishlistHeaderBtn.addEventListener('click', () => {
            alert(wishlistItems.length > 0 ? `لديك ${wishlistItems.length} منتجات في المفضلة ❤️` : 'المفضلة فارغة.');
        });
    }

    const bellBtn = document.getElementById('bellBtn');
    if (bellBtn) {
        bellBtn.addEventListener('click', () => alert('لا توجد إشعارات جديدة 🔕'));
    }

    const userAccountBtn = document.getElementById('userAccountBtn');
    if (userAccountBtn) {
        userAccountBtn.addEventListener('click', () => alert('مرحباً بك في حسابك الشخصي 👤'));
    }
}

// رسم المنتجات في الـ HTML (للفلاتر والتوصيات)
function renderProducts(productsToRender, containerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    grid.innerHTML = '';
    if (productsToRender.length === 0) {
        grid.innerHTML = '<h3 style="color:white; text-align:center; width:100%;">لا توجد منتجات مطابقة.</h3>';
        return;
    }

    productsToRender.forEach(p => {
        const img = p.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=500';
        const isWished = wishlistItems.some(w => w.id === p.id);
        const heartClass = isWished ? 'fas' : 'far';
        const heartColor = isWished ? 'style="color: #ef4444;"' : '';
        const safeName = p.name ? p.name.replace(/'/g, "\\'") : 'منتج';

        grid.innerHTML += `
            <div class="product-card">
                <button class="wishlist-btn" onclick="toggleWishlist(this, ${p.id}, '${safeName}', ${p.price}, '${img}')">
                    <i class="${heartClass} fa-heart" ${heartColor}></i>
                </button>
                <div class="product-image">
                    <img src="${img}" alt="${p.name}">
                </div>
                <div class="product-details">
                    <span style="font-size:0.7rem; color:#a855f7; border:1px solid #a855f7; padding:2px 5px; border-radius:5px;">${p.category || 'عام'}</span>
                    <h3 style="margin-top:5px;">${p.name}</h3>
                    <div class="rating">
                        <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                    </div>
                    <div class="price">$${p.price}</div>
                    <button class="add-to-cart-btn" onclick="addToCart(${p.id}, '${safeName}', ${p.price}, '${img}')">
                        <i class="fas fa-cart-plus"></i> أضف للسلة
                    </button>
                </div>
            </div>
        `;
    });
}

// دالة الفلترة (السعر، الاسم، القسم، الترتيب)
function applyFilters() {
    let filtered = [...globalProductsList];

    const nameVal = document.getElementById('filterName')?.value.toLowerCase();
    const catVal = document.getElementById('filterCategory')?.value;
    const minVal = parseFloat(document.getElementById('filterMinPrice')?.value);
    const maxVal = parseFloat(document.getElementById('filterMaxPrice')?.value);
    const sortVal = document.getElementById('filterSort')?.value;

    if (nameVal) filtered = filtered.filter(p => p.name.toLowerCase().includes(nameVal));
    if (catVal) filtered = filtered.filter(p => p.category === catVal);
    if (!isNaN(minVal)) filtered = filtered.filter(p => p.price >= minVal);
    if (!isNaN(maxVal)) filtered = filtered.filter(p => p.price <= maxVal);

    if (sortVal === 'price_asc') filtered.sort((a, b) => a.price - b.price);
    else if (sortVal === 'price_desc') filtered.sort((a, b) => b.price - a.price);
    else if (sortVal === 'newest') filtered.sort((a, b) => b.id - a.id);

    renderProducts(filtered, 'customerProductsGrid');
}

// توصيات ذكية (اختيار 3 منتجات عشوائية)
function renderSmartRecommendations() {
    if (globalProductsList.length === 0) return;
    let shuffled = [...globalProductsList].sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, 3);
    renderProducts(selected, 'recommendationsGrid');
}

// جلب المنتجات للزبائن مع الفلاتر والتوصيات
async function fetchCustomerProducts() {
    const grid = document.getElementById('customerProductsGrid');
    if (!grid) return;

    try {
        const response = await fetch('/api/Products', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('userToken') }
        });

        if (response.ok) {
            const products = await response.json();
            globalProductsList = products; // تخزين المنتجات للفلترة

            applyFilters(); // رسم المنتجات الأساسية
            renderSmartRecommendations(); // رسم التوصيات
        }
    } catch (error) { console.error("Error fetching customer products:", error); }
}

// تشغيل العداد التنازلي
function startCountdown() {
    const timerElement = document.getElementById('countdownTimer');
    if (!timerElement) return;

    const countDownDate = new Date().getTime() + (24 * 60 * 60 * 1000);

    setInterval(function () {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timerElement.innerHTML =
            (hours < 10 ? "0" + hours : hours) + ":" +
            (minutes < 10 ? "0" + minutes : minutes) + ":" +
            (seconds < 10 ? "0" + seconds : seconds);
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAdminProducts();
    fetchAdminUsers();
    fetchAdminOrders();

    // تشغيل دوال الزبون إذا كنا في صفحة المنتجات
    if (document.getElementById('customerProductsGrid')) {
        fetchCustomerProducts();
        initializeCustomerButtons();
        startCountdown();
    }
});