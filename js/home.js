// Home page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadRestaurants();
    setupSearch();
    setupFilters();
});

function loadCategories() {
    const data = loadDataFromLocalStorage();
    const categoryGrid = document.getElementById('categoryGrid');
    
    categoryGrid.innerHTML = data.categories.map(category => `
        <div class="category-item" onclick="filterByCategory('${category.id}')">
            <img src="${category.image}" alt="${category.name}">
            <h4>${category.name}</h4>
        </div>
    `).join('');
}

function loadRestaurants(filter = 'all') {
    const data = loadDataFromLocalStorage();
    const restaurantGrid = document.getElementById('restaurantGrid');
    
    let restaurants = Object.values(data.restaurants);
    
    // Apply filters
    switch(filter) {
        case 'rating':
            restaurants = restaurants.filter(r => r.rating >= 4.0);
            break;
        case 'fast':
            restaurants = restaurants.filter(r => parseInt(r.deliveryTime) <= 25);
            break;
        case 'offers':
            restaurants = restaurants.filter(r => r.discount);
            break;
    }
    
    restaurantGrid.innerHTML = restaurants.map(restaurant => `
        <div class="restaurant-card" onclick="openRestaurant('${restaurant.id}')">
            <div class="restaurant-image">
                <img src="${restaurant.image}" alt="${restaurant.name}">
                ${restaurant.discount ? `<div class="discount-badge">${restaurant.discount}</div>` : ''}
            </div>
            <div class="restaurant-info">
                <h3>${restaurant.name}</h3>
                <div class="restaurant-meta">
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span>${restaurant.rating}</span>
                    </div>
                    <div class="delivery-time">${restaurant.deliveryTime}</div>
                </div>
                <div class="cuisine">${restaurant.cuisine}</div>
                <div class="restaurant-footer">
                    <div class="price-range">${restaurant.priceRange}</div>
                    <button class="order-btn" onclick="event.stopPropagation(); openRestaurant('${restaurant.id}')">
                        Order Now
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        searchRestaurants(query);
    });
}

function searchRestaurants(query) {
    if (!query) {
        loadRestaurants();
        return;
    }
    
    const data = loadDataFromLocalStorage();
    const restaurants = Object.values(data.restaurants);
    
    const filtered = restaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.cuisine.toLowerCase().includes(query) ||
        restaurant.menu.some(item => 
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        )
    );
    
    const restaurantGrid = document.getElementById('restaurantGrid');
    restaurantGrid.innerHTML = filtered.map(restaurant => `
        <div class="restaurant-card" onclick="openRestaurant('${restaurant.id}')">
            <div class="restaurant-image">
                <img src="${restaurant.image}" alt="${restaurant.name}">
                ${restaurant.discount ? `<div class="discount-badge">${restaurant.discount}</div>` : ''}
            </div>
            <div class="restaurant-info">
                <h3>${restaurant.name}</h3>
                <div class="restaurant-meta">
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span>${restaurant.rating}</span>
                    </div>
                    <div class="delivery-time">${restaurant.deliveryTime}</div>
                </div>
                <div class="cuisine">${restaurant.cuisine}</div>
                <div class="restaurant-footer">
                    <div class="price-range">${restaurant.priceRange}</div>
                    <button class="order-btn" onclick="event.stopPropagation(); openRestaurant('${restaurant.id}')">
                        Order Now
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            loadRestaurants(filter);
        });
    });
}

function filterByCategory(categoryId) {
    const data = loadDataFromLocalStorage();
    const restaurants = Object.values(data.restaurants);

    const filtered = restaurants.filter(restaurant =>
        restaurant.menu.some(item => {
            const itemCat = item.category.toLowerCase();
            if (categoryId === 'southindian') {
                return itemCat === 'south indian';
            }
            if (categoryId === 'icecream') {
                return itemCat === 'ice cream' || itemCat === 'sundae';
            }
            // For other categories, the id should match the category name (e.g. 'pizza', 'burgers')
            return itemCat === categoryId;
        })
    );

    const restaurantGrid = document.getElementById('restaurantGrid');
    restaurantGrid.innerHTML = filtered.map(restaurant => `
        <div class="restaurant-card" onclick="openRestaurant('${restaurant.id}')">
            <div class="restaurant-image">
                <img src="${restaurant.image}" alt="${restaurant.name}">
                ${restaurant.discount ? `<div class="discount-badge">${restaurant.discount}</div>` : ''}
            </div>
            <div class="restaurant-info">
                <h3>${restaurant.name}</h3>
                <div class="restaurant-meta">
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span>${restaurant.rating}</span>
                    </div>
                    <div class="delivery-time">${restaurant.deliveryTime}</div>
                </div>
                <div class="cuisine">${restaurant.cuisine}</div>
                <div class="restaurant-footer">
                    <div class="price-range">${restaurant.priceRange}</div>
                    <button class="order-btn" onclick="event.stopPropagation(); openRestaurant('${restaurant.id}')">
                        Order Now
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}
function updateLocation() {
    const locationInput = document.getElementById('locationInput');
    locationInput.addEventListener('change', function(e) {
        let newLocation = e.target.value;
        newLocation = newLocation.trim().toUpperCase();
        localStorage.setItem('userLocation', newLocation);
        // Optionally reload restaurants based on location
        document.querySelectorAll('.loc').forEach(el => {
            el.textContent = newLocation;
        });
        loadRestaurants();
    });

    // Set input value from localStorage if available
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
        locationInput.value = savedLocation;
    }
}
function openRestaurant(restaurantId) {
    window.location.href = `restaurants/${restaurantId}.html`;
}
