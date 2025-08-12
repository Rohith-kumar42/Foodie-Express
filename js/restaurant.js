let currentRestaurant = null;

function initializeRestaurant(restaurantId) {
    const data = loadDataFromLocalStorage();
    currentRestaurant = data.restaurants[restaurantId];
    
    if (!currentRestaurant) {
        console.error('Restaurant not found');
        return;
    }
    
    loadMenu();
    setupCategoryTabs();
}

function loadMenu(category = 'all') {
    if (!currentRestaurant) return;
    
    const menuGrid = document.getElementById('menuGrid');
    let menuItems = currentRestaurant.menu;
    
    if (category !== 'all') {
        menuItems = menuItems.filter(item => item.category === category);
    }
    
    menuGrid.innerHTML = menuItems.map(item => `
        <div class="menu-item">
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="item-details">
                <div class="item-header">
                    <div>
                        <h3 class="item-name">${item.name}</h3>
                    </div>
                    <div class="veg-indicator ${item.veg ? 'veg' : 'non-veg'}"></div>
                </div>
                <p class="item-description">${item.description}</p>
                <div class="item-footer">
                    <span class="item-price">₹${item.price}</span>
                    <button class="add-to-cart-btn" onclick="addToCart('${item.id}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function setupCategoryTabs() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            loadMenu(category);
        });
    });
}

function addToCart(itemId) {
    if (!currentRestaurant) return;
    
    const item = currentRestaurant.menu.find(menuItem => menuItem.id === itemId);
    if (item) {
        cart.addItem(item, currentRestaurant.id);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const addItemForm = document.getElementById('addItemForm');
    if (addItemForm) {
        addItemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const newItem = {
                id: `${currentRestaurant.id}_${Date.now()}`,
                name: document.getElementById('itemName').value,
                description: document.getElementById('itemDescription').value,
                price: parseInt(document.getElementById('itemPrice').value),
                image: document.getElementById('itemImage').value,
                category: document.getElementById('itemCategory').value,
                veg: document.getElementById('itemVeg').checked
            };
            currentRestaurant.menu.push(newItem);
            const data = loadDataFromLocalStorage();
            data.restaurants[currentRestaurant.id] = currentRestaurant;
            localStorage.setItem('restaurantsData', JSON.stringify(data.restaurants));
            loadMenu();
            closeAddItemModal();
            showSuccessMessage('Item added successfully!');
        });
    }
});

function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message success';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #48c479;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}