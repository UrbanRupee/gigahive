var totalItems = 0;
var totalPrice = 0;
var isPromoCodeApplied = false;
var MAX_QTY_PER_ITEM = 10;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    setupEventListeners();
});

function getCartItemKey(item) {
    if (!item) return "";
    return item.id || `${item.prodname || ""}|${item.prodimage || ""}`;
}

function normalizeCartData(raw) {
    const src = Array.isArray(raw) ? raw : [];
    const map = new Map();
    let changed = false;

    for (const it of src) {
        if (!it || !it.prodname) {
            changed = true;
            continue;
        }

        const key = getCartItemKey(it);
        if (!key) {
            changed = true;
            continue;
        }

        let qty = parseInt(it.quantity);
        if (isNaN(qty) || qty < 1) {
            qty = 1;
            changed = true;
        }
        if (qty > MAX_QTY_PER_ITEM) {
            qty = MAX_QTY_PER_ITEM;
            changed = true;
        }

        if (!map.has(key)) {
            const base = { ...it, quantity: qty };
            map.set(key, base);
            if (it.quantity !== qty) changed = true;
        } else {
            const existing = map.get(key);
            const nextQty = Math.min((parseInt(existing.quantity) || 1) + qty, MAX_QTY_PER_ITEM);
            if (nextQty !== existing.quantity) changed = true;
            existing.quantity = nextQty;
            map.set(key, existing);
            changed = true; // duplicates were merged
        }
    }

    return { data: Array.from(map.values()), changed };
}

function renderCart() {
    var raw = JSON.parse(localStorage.getItem("atc")) || [];
    var normalized = normalizeCartData(raw);
    var data = normalized.data;
    var didClamp = normalized.changed;
    
    var product = document.querySelector(".productcont");
    if (!product) return;
    
    // Keep the h2 header, clear only product divs
    var h2Header = product.querySelector("h2");
    product.innerHTML = "";
    if (h2Header) {
        product.appendChild(h2Header);
    } else {
        var header = document.createElement("h2");
        header.innerText = "Products";
        product.appendChild(header);
    }
    
    totalItems = 0;
    totalPrice = 0;
    
    if (data.length === 0) {
        var emptyMsg = document.createElement("p");
        emptyMsg.innerText = "Your cart is empty.";
        emptyMsg.style.textAlign = "center";
        emptyMsg.style.padding = "20px";
        emptyMsg.style.color = "#9ca3af";
        product.appendChild(emptyMsg);
        document.querySelector(".totalItem").innerText = totalItems;
        showTotalCartValue(totalPrice);
        return;
    }
    
    data.forEach((element,i) => {
        // Skip invalid elements
        if (!element || !element.prodname) {
            console.warn("Invalid cart item at index", i, element);
            return;
        }
        
        // Parse price if it's a string
        let price = typeof element.prodprice === 'string' 
            ? parseFloat(element.prodprice.replace(/[\u20B9₹$,]/g, '')) 
            : parseFloat(element.prodprice) || 0;
        
        let quantity = parseInt(element.quantity) || 1;
        if (quantity < 1) {
            quantity = 1;
            didClamp = true;
        }
        if (quantity > MAX_QTY_PER_ITEM) {
            quantity = MAX_QTY_PER_ITEM;
            didClamp = true;
        }
        if (element.quantity !== quantity) {
            element.quantity = quantity;
            didClamp = true;
        }
        
        totalItems += quantity;
        totalPrice += price * quantity;

        var productDiv = document.createElement("div")
        productDiv.classList.add("product")

        var imgDiv = document.createElement("div")
        imgDiv.classList.add("imgDiv")

        var img = document.createElement("img")
        img.setAttribute("src", element.prodimage || "")
        img.setAttribute("alt", element.prodname || "Product image")

        var detailsDiv = document.createElement("div")
        detailsDiv.classList.add("detailsDiv")

        var productName = document.createElement("h3")
        productName.classList.add("productName")
        productName.innerText = element.prodname || "Unknown Product";

        var qty = document.createElement("h4")
        qty.innerText = "QTY : " ;
        let qtyInput = document.createElement("input");
        qtyInput.setAttribute("type", "number");
        qtyInput.setAttribute("id", "qty_" + i);
        qtyInput.setAttribute("min", 1);
        qtyInput.setAttribute("max", MAX_QTY_PER_ITEM);
        qtyInput.setAttribute("value", quantity);
        qtyInput.setAttribute("data-index", i);
        // Clamp live while typing so user can't keep >10 in the field UI
        qtyInput.addEventListener("input", function() {
            var v = parseInt(this.value);
            if (isNaN(v) || v < 1) this.value = 1;
            if (v > MAX_QTY_PER_ITEM) this.value = MAX_QTY_PER_ITEM;
        });
        qtyInput.addEventListener("change", function() {
            updateQuantity(i, this.value);
        });

        var priceEl = document.createElement("h3")
        let itemPrice = typeof element.prodprice === 'string' 
            ? parseFloat(element.prodprice.replace(/[\u20B9₹$,]/g, '')) 
            : parseFloat(element.prodprice) || 0;
        let itemQuantity = parseInt(element.quantity) || 1;
        priceEl.innerText = "Price : \u20B9" + (itemPrice * itemQuantity).toFixed(2);
        priceEl.classList.add("price")
        
        var deleteItem = document.createElement("button")
        deleteItem.innerText = "DELETE"
        deleteItem.addEventListener("click", function() {
            dele(element, i);
        })  
        
        qty.appendChild(qtyInput)
        imgDiv.append(img)
        detailsDiv.append(productName, qty, priceEl, deleteItem)
        productDiv.append(imgDiv, detailsDiv)
        product.append(productDiv)
    });
    
    var totalItemEl = document.querySelector(".totalItem");
    if (totalItemEl) {
        totalItemEl.innerText = totalItems;
    }
    showTotalCartValue(totalPrice);
    
    console.log("Cart rendered:", totalItems, "items, Total: \u20B9" + totalPrice.toFixed(2)); // Debug log

    // Persist any merging/clamping back to storage so refreshes are consistent
    if (didClamp) {
        localStorage.setItem("atc", JSON.stringify(data));
    }
}

function setupEventListeners() {


    var checkoutBtn = document.querySelector("#checkout");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", goToPayment);
    }
    
    var applyPromoBtn = document.querySelector("#applyPromo");
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener("click", addPromoCode);
    }
    
    var emptyCartBtn = document.querySelector("#emptyCart");
    if (emptyCartBtn) {
        emptyCartBtn.addEventListener("click", emptyCart);
    }
}

function goToPayment() {
    var checkout = document.querySelector("#checkout");
    if (checkout) {
        checkout.innerText = "Loading...";
        setTimeout(() => {
            window.location.href = "checkout.html";
        }, 3000);
    }
}

function addPromoCode() {
    var promocode = document.querySelector("#promoCode").value;
    console.log(promocode);
    
    // Recalculate total price from cart data
    var data = JSON.parse(localStorage.getItem("atc")) || [];
    var currentTotal = 0;
    data.forEach((element) => {
        let price = typeof element.prodprice === 'string' 
            ? parseFloat(element.prodprice.replace(/[\u20B9₹$,]/g, '')) 
            : parseFloat(element.prodprice) || 0;
        let quantity = parseInt(element.quantity) || 1;
        currentTotal += price * quantity;
    });

    if(promocode == "masai30" && isPromoCodeApplied == false)
    {
        isPromoCodeApplied = true;
        var discountedPrice = 0.7 * Number(currentTotal);
        showTotalCartValue(discountedPrice);
        alert("Promocode applied! 30% discount applied.");
    } else if(promocode == "masai30" && isPromoCodeApplied == true)
    {
        alert("Promocode already applied");
    } else {
        alert("Promocode is Wrong");
    }
}

function showTotalCartValue(totalPrice) {
    var totalElement = document.querySelector(".totalPrice");
    if (totalElement) {
        totalElement.innerText = "\u20B9"+totalPrice.toFixed(2);
    }
}

function emptyCart() {
    if (confirm("Are you sure you want to empty your cart?")) {
        localStorage.removeItem('atc');
        renderCart(); // Re-render instead of reload
    }
}

function dele(el, i) {
    if (confirm("Are you sure you want to remove this item?")) {
        var data = JSON.parse(localStorage.getItem("atc")) || [];
        data.splice(i, 1);
        localStorage.setItem("atc", JSON.stringify(data));
        renderCart(); // Re-render instead of reload
    }
}

function updateQuantity(index, newQuantity) {
    var qtyNum = parseInt(newQuantity);
    if (isNaN(qtyNum) || qtyNum < 1) {
        qtyNum = 1;
    }
    if (qtyNum > MAX_QTY_PER_ITEM) {
        qtyNum = MAX_QTY_PER_ITEM;
        alert("Maximum quantity per item is " + MAX_QTY_PER_ITEM);
    }
    var qtyInput = document.querySelector("#qty_" + index);
    if (qtyInput) {
        qtyInput.value = qtyNum;
    }
    
    var data = JSON.parse(localStorage.getItem("atc")) || [];
    if (data[index]) {
        data[index].quantity = qtyNum;
        localStorage.setItem("atc", JSON.stringify(data));
        renderCart(); // Re-render the entire cart to update everything
    }
}