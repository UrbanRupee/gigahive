

var detailobj = JSON.parse(localStorage.getItem('detail'))

let addcartarr = JSON.parse(localStorage.getItem('atc')) || []
const MAX_QTY_PER_ITEM = 10;

display(detailobj)

function display(data){
    let detailbox = document.querySelector('#detailbox')

    let imagebox = document.createElement('div')

    let image = document.createElement('img')
    image.src = data.prodimage

    let restbox = document.createElement('div')

    let name = document.createElement('h2')
    name.innerText = data.prodname
    name.id = "name"

    let pricebox = document.createElement('div')
    pricebox.id= "pricebox"

    let price = document.createElement('h2')
    price.innerText = data.prodprice

    let strike  = document.createElement('s')
    strike.innerText = data.striked

    let disc = document.createElement('p')
    disc.innerText = data.proddisc

    pricebox.append(price,strike,disc)

    let buttonbox = document.createElement('div')
    buttonbox.id = "buttonbox"

    let addcart = document.createElement('button')
    addcart.innerText= "Add to Cart"
    addcart.addEventListener('click', function(){
        addcartfunc(data)
    })

    let buynow = document.createElement('button')
    buynow.innerText = "Buy Now"
    buynow.addEventListener("click", buynowfunc)

    buttonbox.append(buynow,addcart)
    pricebox.append(price,strike,disc)
    restbox.append(name,pricebox,buttonbox)
    imagebox.append(image)
    detailbox.append(imagebox,restbox)
    
}
function buynowfunc(){
    alert("Allow Current Location to access your Location")

    setTimeout(function(){
       alert("Yes, the Item will be delivered in your area")
    },3000)
}

function addcartfunc(el){
    // Ensure item has a stable key
    const key = el && (el.id || `${el.prodname || ''}|${el.prodimage || ''}`);
    if (!key) return;

    const cart = JSON.parse(localStorage.getItem('atc')) || [];
    let found = false;

    for (let i = 0; i < cart.length; i++) {
        const itemKey = cart[i] && (cart[i].id || `${cart[i].prodname || ''}|${cart[i].prodimage || ''}`);
        if (itemKey === key) {
            const currentQty = parseInt(cart[i].quantity) || 1;
            if (currentQty >= MAX_QTY_PER_ITEM) {
                alert("Maximum quantity per item is " + MAX_QTY_PER_ITEM);
                cart[i].quantity = MAX_QTY_PER_ITEM;
            } else {
                cart[i].quantity = Math.min(currentQty + 1, MAX_QTY_PER_ITEM);
            }
            found = true;
            break;
        }
    }

    if (!found) {
        // Create a clean copy with properly formatted price
        const obj = {
            id: el.id,
            prodname: el.prodname,
            prodimage: el.prodimage,
            prodprice: typeof el.prodprice === 'string' 
                ? parseFloat(el.prodprice.replace(/[\u20B9₹$,]/g, '')) || 0
                : parseFloat(el.prodprice) || 0,
            prodorg_prc: el.prodorg_prc,
            proddisc: el.proddisc,
            striked: el.striked,
            quantity: Math.min(parseInt(el.quantity) || 1, MAX_QTY_PER_ITEM)
        };
        cart.push(obj);
    }

    localStorage.setItem('atc', JSON.stringify(cart));
    addcartarr = cart;
}

import navbar from "../components/navbar.js"
document.querySelector('#navbar').innerHTML = navbar()

import footer from "../components/footer.js"
document.querySelector('#totalfooter').innerHTML = footer()