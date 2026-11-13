
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", function () {

        navLinks.classList.toggle("active");

        const isOpen =
            navLinks.classList.contains("active");

        menuToggle.textContent = isOpen ? "✕" : "☰";

    });

}

// ELITE SHOPPING CART

function getCart() {
    return JSON.parse(localStorage.getItem("eliteCart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("eliteCart", JSON.stringify(cart));
}

function updateCartCount() {
    const count = document.getElementById("cartCount");

    if (count) {
        count.textContent = getCart().reduce(
            (total, item) => total + item.quantity, 0
        );
    }
}

// Add products to cart
document.querySelectorAll(
    ".product-card .add-cart"
).forEach(button => {

    button.addEventListener("click", function () {

        const name = this.dataset.name;
        const price = Number(this.dataset.price);

        if (!name || !Number.isFinite(price) || price <= 0) {
            alert("Product information is missing.");
            return;
        }

        const cart = getCart();

        const existing = cart.find(item => item.name === name);

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({
                name: name,
                price: price,
                quantity: 1
            });
        }

        saveCart(cart);
        updateCartCount();

        alert(name + " added to cart!");
    });
});


function displayCart() {
    const cartItems = document.getElementById("cartItems");

    if (!cartItems) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong>
                    <p>Price: MWK ${item.price.toLocaleString()}</p>

                    <div class="quantity-controls">
                        <button class="quantity-minus"
                            data-index="${index}">−</button>

                        <span>${item.quantity}</span>

                        <button class="quantity-plus"
                            data-index="${index}">+</button>
                    </div>

                    <p>Subtotal: MWK
                    ${(item.price * item.quantity).toLocaleString()}</p>
                </div>

                <button class="remove-item"
                    data-index="${index}">Remove</button>
            </div>
        `).join("");
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    const totalElement = document.getElementById("cartTotal");

    if (totalElement) {
        totalElement.textContent =
            "Total: MWK " + total.toLocaleString();
    }
}

// QUANTITY CONTROLS

document.addEventListener("click", function(event) {

    const cart = getCart();

    if (event.target.classList.contains("quantity-plus")) {
        const index = Number(event.target.dataset.index);

        if (cart[index]) {
            cart[index].quantity++;
        }
    }

    else if (event.target.classList.contains("quantity-minus")) {
        const index = Number(event.target.dataset.index);

        if (cart[index]) {
            cart[index].quantity--;

            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
        }
    }

    else {
        return;
    }

    saveCart(cart);
    displayCart();
    updateCartCount();
});

// CHECKOUT AND ORDER FORM

function displayCheckoutSummary() {

    const summary = document.getElementById("checkoutSummary");

    if (!summary) return;

    const cart = getCart();

    if (cart.length === 0) {
        summary.textContent = "Your shopping cart is empty.";
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    summary.innerHTML = `
        <h3>Order Summary</h3>
        <p>Products: ${cart.length}</p>
        <h3>Total: MWK ${total.toLocaleString()}</h3>
    `;
}

const checkoutForm = document.getElementById("checkoutForm");

if (checkoutForm) {

    displayCheckoutSummary();

    checkoutForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const cart = getCart();

        if (cart.length === 0) {
            alert("Your cart is empty. Add products first.");
            return;
        }

        const order = {
            orderNumber: "ELITE-" + Date.now(),
            customerName: document.getElementById("customerName").value,
            customerPhone: document.getElementById("customerPhone").value,
            customerEmail: document.getElementById("customerEmail").value,
            customerAddress: document.getElementById("customerAddress").value,
            paymentMethod: document.getElementById("paymentMethod").value,
            products: cart,
            total: cart.reduce(
                (sum, item) => sum + item.price * item.quantity, 0
            ),
            orderDate: new Date().toLocaleString()
        };

        const orders = JSON.parse(
            localStorage.getItem("eliteOrders")
        ) || [];

        orders.push(order);

        localStorage.setItem(
            "eliteOrders",
            JSON.stringify(orders)
        );

        localStorage.removeItem("eliteCart");

        document.getElementById("orderMessage").textContent =
            "Order placed successfully! Order Number: " +
            order.orderNumber;

        checkoutForm.reset();

        updateCartCount();
        displayCheckoutSummary();
    });
}

// ADIM ORDER MANAGEMENT 

function displayOrders() {

    const ordersList = document.getElementById("ordersList");

    if (!ordersList) return;

    const orders = JSON.parse(
        localStorage.getItem("eliteOrders")
    ) || [];

    document.getElementById("orderCount").textContent =
        "Total Orders: " + orders.length;

    ordersList.innerHTML = "";

    if (orders.length === 0) {
        ordersList.textContent = "No orders available yet.";
        return;
    }

    orders.forEach((order, index) => {

        if (!order.status) {
            order.status = "Pending";
        }

        const card = document.createElement("div");
        card.className = "order-card";

        const title = document.createElement("h3");
        title.textContent = "Order: " + order.orderNumber;
        card.appendChild(title);

        const details = [
            "Customer: " + order.customerName,
            "Phone: " + order.customerPhone,
            "Address: " + order.customerAddress,
            "Payment: " + order.paymentMethod,
            "Total: MWK " + order.total.toLocaleString(),
            "Date: " + order.orderDate
        ];

        details.forEach(detail => {
            const p = document.createElement("p");
            p.textContent = detail;
            card.appendChild(p);
        });

        const statusLabel = document.createElement("p");
        statusLabel.textContent = "Order Status: " + order.status;
        card.appendChild(statusLabel);

        const statusSelect = document.createElement("select");
        statusSelect.className = "order-status";
        statusSelect.dataset.index = index;

        ["Pending", "Processing", "Shipped", "Delivered"]
            .forEach(status => {

                const option = document.createElement("option");
                option.value = status;
                option.textContent = status;

                if (order.status === status) {
                    option.selected = true;
                }

                statusSelect.appendChild(option);
            });

        card.appendChild(statusSelect);

        (order.products || []).forEach(product => {
            const p = document.createElement("p");
            p.textContent =
                product.name + " × " + product.quantity;
            card.appendChild(p);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Order";
        deleteButton.className = "delete-order";
        deleteButton.dataset.index = index;

        card.appendChild(deleteButton);
        ordersList.appendChild(card);
    });

    localStorage.setItem("eliteOrders", JSON.stringify(orders));
}

// UPDATE ORDER STATUS

document.addEventListener("change", function(event) {

    if (event.target.classList.contains("order-status")) {

        const index = Number(event.target.dataset.index);

        const orders = JSON.parse(
            localStorage.getItem("eliteOrders")
        ) || [];

        if (!orders[index]) return;

        orders[index].status = event.target.value;

        localStorage.setItem(
            "eliteOrders",
            JSON.stringify(orders)
        );

        displayOrders();

        alert("Order status updated successfully!");
    }
});

// CUSTOMER ORDER TRACKING

const trackingForm = document.getElementById("trackingForm");

if (trackingForm) {

    trackingForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const enteredNumber = document
            .getElementById("trackingNumber")
            .value.trim();

        const result = document.getElementById("trackingResult");

        const orders = JSON.parse(
            localStorage.getItem("eliteOrders")
        ) || [];

        const order = orders.find(item =>
            item.orderNumber.toLowerCase() ===
            enteredNumber.toLowerCase()
        );

        result.innerHTML = "";

        if (!order) {

            result.className = "tracking-error";
            result.textContent =
                "Order not found. Please check your order number.";

            return;
        }

        result.className = "tracking-result";

        const heading = document.createElement("h2");
        heading.textContent = "Order Found!";
        result.appendChild(heading);

        const information = [
            "Order Number: " + order.orderNumber,
            "Customer: " + order.customerName,
            "Order Date: " + order.orderDate,
            "Order Status: " + (order.status || "Pending"),
            "Total: MWK " + order.total.toLocaleString()
        ];

        information.forEach(item => {
            const paragraph = document.createElement("p");
            paragraph.textContent = item;
            result.appendChild(paragraph);
        });
    });
}

// ELITE SHOP ADMIN DASHBOARD

function loadAdminDashboard() {

    const totalOrdersElement =
        document.getElementById("dashTotalOrders");

    if (!totalOrdersElement) return;

    const orders = JSON.parse(
        localStorage.getItem("eliteOrders")
    ) || [];

    const countStatus = status =>
        orders.filter(order =>
            (order.status || "Pending") === status
        ).length;

    const revenue = orders.reduce(
        (sum, order) => sum + Number(order.total || 0), 0
    );

    document.getElementById("dashTotalOrders").textContent =
        orders.length;

    document.getElementById("dashRevenue").textContent =
        "MWK " + revenue.toLocaleString();

    document.getElementById("dashPending").textContent =
        countStatus("Pending");

    document.getElementById("dashProcessing").textContent =
        countStatus("Processing");

    document.getElementById("dashShipped").textContent =
        countStatus("Shipped");

    document.getElementById("dashDelivered").textContent =
        countStatus("Delivered");

    const recentOrders =
        document.getElementById("recentOrders");

    recentOrders.innerHTML = "";

    if (orders.length === 0) {
        recentOrders.textContent = "No orders available yet.";
        return;
    }

    orders.slice(-5).reverse().forEach(order => {

        const item = document.createElement("div");
        item.className = "recent-order-item";

        const heading = document.createElement("h3");
        heading.textContent = order.orderNumber;
        item.appendChild(heading);

        const details = document.createElement("p");

        details.textContent =
            "Customer: " + order.customerName +
            " | Total: MWK " +
            Number(order.total).toLocaleString() +
            " | Status: " + (order.status || "Pending");

        item.appendChild(details);
        recentOrders.appendChild(item);
    });
}

loadAdminDashboard();
