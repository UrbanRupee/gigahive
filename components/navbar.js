function navbar(){
    return `<div id="samratfirst">
    <a href="./index.html">
        <div id="logo-container">
            <h1 id="brand-logo">GigaHive</h1>
            <p id="brand-subtitle">Private Limited</p>
        </div>
    </a>
    <div id="inner1">
        <div id="searchbut">
            <input type="text" placeholder="Search products..." id="search">
            <button id="search-btn" type="button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="https://www.w3.org/2000/svg">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
            
        
        <div id="loc">
            <a id="flash" href="flashdeals.html">FLASH DEALS</a>
            <a id="clearance" href="samrat_clearance_sale.html">CLEARANCE SALE</a>
            <a id="top" href="women's.html">WOMEN's</a>
            <a id="live" href="phones.html">PHONES</a>
            <a id="live" href="jewelry.html">JEWELERY</a>
            <a id="live" href="HomeAppliances.html">HOME & APPLIANCES</a>
            <a id="live" href="automobile.html">AUTOMOBILE</a>
        </div>
    </div>
    
    <div id="inner2">
        <div>
            <h4>Language</h4>
        </div>
        
        <div id="divflag">  
            <span>English</span>
        </div>
    </div>
    
    <div id="sign">
        <a href="signin.html">
            <img id="signlogo" src="./images/sign.png" alt="Sign In">
            <div>
                <p id="hello">Hello</p>
                <p id="in">User</p>
            </div>
        </a>
    </div>
    
    <a href="cart.html">
        <div id="cart">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="https://www.w3.org/2000/svg">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 17.9 19 19 19C20.1 19 21 18.1 21 17V13M9 19.5C9.8 19.5 10.5 20.2 10.5 21C10.5 21.8 9.8 22.5 9 22.5C8.2 22.5 7.5 21.8 7.5 21C7.5 20.2 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21C21.5 21.8 20.8 22.5 20 22.5C19.2 22.5 18.5 21.8 18.5 21C18.5 20.2 19.2 19.5 20 19.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="number">
                <h1>0</h1>
            </div>
        </div>
    </a>
</div>`
}

export default navbar
