/**
 * checking local storage condition
 * @returns {boolean} localStorage condition
 */
( function checkLocalStorage() {
    if ( !localStorage.getItem( 'cart' ) ) {
        console.log( 'empty cart' );
        document.getElementById( 'cart_main_section' ).classList.add( 'cartEmpty' );
        document.getElementById( 'cart_main_section' ).textContent = "Votre panier est vide, sélectionnez un ours depuis la page d'accueil et ajoutez le à votre panier.";
        return false
    }
    else {
        console.log( 'local storage loaded', localStorage );
        load();
        return true
    }
} )();

/**
 * calling API for missing info
 * @returns {products} API products
 */
async function getProducts() {
    return fetch( "http://localhost:3000/api/teddies" )
        .then( function ( res ) {
            if ( res.ok ) {
                return res.json();
            }
        } )
        .then( function ( products ) {
            return products;
        } )
        .catch( function ( err ) {
            console.log( 'err : ', err );
            document.getElementById( 'cart_main_section' ).classList.add( 'serverError' );
            document.getElementById( 'cart_main_section' ).textContent = "Oups... Il y a une erreur de serveur !";
        } )
};

/**
 * retrieving localStorage items
 * @returns {cartItems} localStorage items
 */
async function getCartItems() {
    let cartItems = JSON.parse( localStorage.getItem( 'cart' ) );
    if ( cartItems != null ) {
        return cartItems;
    }
    else {
        console.log( 'nothing in cart' );
    }
};

/**
 * loading cart items to display
 */
async function load() {
    const cartItems = await getCartItems();
    for ( let cartItem of cartItems ) {
        showCart( cartItem );
    }
};

/**
 * display DOM/HTML
 */
async function showCart() {
    const products = await getProducts();
    const thisCart = await getCartItems();
    if ( !thisCart ) {
        document.getElementById( 'cart_main_section' ).classList.add( 'cartEmpty' );
        document.getElementById( 'cart_main_section' ).textContent = "Votre panier est vide, sélectionnez un ours depuis la page d'accueil et ajoutez le à votre panier.";
    }
    else if ( thisCart.length > 0 ) {
        let htmltxt = "";
        let priceP;
        for ( const el of thisCart ) {
            for ( let product of products ) {
                if ( el.productId === product._id ) {
                    priceP = product.price;
                }
            };
            htmltxt += `<article class="cart_item" data-id="${ el.productId }" data-color="${ el.color }">
                        <div class="cart_img">
                            <img src="${ el.image }" alt="${ el.alt }">
                        </div>
                        <div class="cart_item_content">
                            <div class="cart_item_content_info">
                                <h2 class="item_name">${ el.name }</h2>
                                <p class="item_color">${ el.color }</p>
                                <p class="item_tot_price">${ priceP * el.amount } €</p>
                                <p class="item_sing_price">(prix unitaire : ${ priceP }) €</p>
                            </div>
                            <div class="cart_item_content_settings">
                                <div class="cart_item_content_settings_quantity">
                                    <p>Qté : </p>
                                    <input class="itemQuantity" name="itemQuantity" type="number" min="1" max="10"
                                        value="${ el.amount }">
                                    <span class="errorQuantity"></span>
                                </div>
                                <div class="cart_item_content_settings_delete">
                                    <button class="delete_item">Supprimer du panier</button>
                                    <span class="lastDeleted"></span>
                                </div>
                            </div>
                        </div>
                    </article>`;
        }
        document.getElementById( 'cart_items' ).innerHTML = htmltxt;
        showGlobalQuantity();
        showGlobalPrice();
        updateItemAmount();
        removeItem();
    }
};

/**
 * displaying cart global quantity
 */
async function showGlobalQuantity() {
    const thisCart = await getCartItems();
    let quantity = 0;
    for ( const el of thisCart ) {
        quantity += parseInt( el.amount );
    }
    document.getElementById( 'totalQuantity' ).textContent = quantity;
};

/**
 * displaying cart global price
 */
async function showGlobalPrice() {
    const thisCart = await getCartItems();
    let total = 0;
    let idx = 0;
    const totalPrices = document.querySelectorAll( '.item_tot_price' );
    for ( const el of thisCart ) {
        const tot = totalPrices[ idx ].innerText;
        total += parseInt( tot );
        idx++;
    };
    document.getElementById( 'totalPrice' ).textContent = total;
};

/**
 * cart item amount modifier
 */
async function updateItemAmount() {
    let itemAmountInput = document.getElementsByClassName( 'itemQuantity' );
    let cartItems = await getCartItems();
    let cartItemId;
    let cartItemAmount;
    let cartItemColor;
    if ( itemAmountInput.length > 0 ) {
        for ( const amount of itemAmountInput ) {
            amount.addEventListener( 'change', function ( event ) {
                cartItemId = event.target.closest( 'article' ).dataset.id;
                cartItemColor = event.target.closest( 'article' ).dataset.color;
                cartItemAmount = amount.value;
                if ( amount.value == 0 || amount.value < 0 || amount.value == "" || amount.value > 10 ) {
                    itemError = event.target.nextElementSibling
                    itemError.classList.add( 'errMsg' );
                    itemError.textContent = "Choisissez une nouvelle quantité comprise entre 1 et 10 !";
                    //alert( "Choisissez une nouvelle quantité comprise entre 1 et 10 !" );
                }
                else {
                    for ( item of cartItems ) {
                        if ( item.productId == cartItemId && item.color == cartItemColor ) {
                            item.amount = cartItemAmount
                        }
                    }
                    localStorage.setItem( 'cart', JSON.stringify( cartItems ) );
                    showCart();
                }
            } )
        }
    };
};

/**
 * single cart item eraser
 */
async function removeItem() {
    let deleteBtn = document.getElementsByClassName( 'delete_item' );
    let cartItems = await getCartItems();
    let cartItemId;
    let cartItemColor;
    let idx = 0;
    if ( deleteBtn.length > 0 ) {
        for ( const btn of deleteBtn ) {
            btn.addEventListener( 'click', function ( event ) {
                cartItemId = event.target.closest( 'article' ).dataset.id;
                cartItemColor = event.target.closest( 'article' ).dataset.color;
                for ( const item of cartItems ) {
                    if ( item.productId == cartItemId && item.color == cartItemColor ) {
                        cartItems.splice( idx, 1 );
                        console.log( 'removed' )
                    }
                    idx++
                }
                localStorage.setItem( 'cart', JSON.stringify( cartItems ) );
                event.target.closest( 'article' ).remove();
                showCart();
                if ( deleteBtn.length == 0 ) {
                    console.log( 'last deleted' );
                    document.getElementById( 'cart_main_section' ).classList.add( 'cartEmpty', 'errMsg' );
                    document.getElementById( 'cart_main_section' ).textContent = "Vous avez supprimé le dernier article de votre panier.";
                    setTimeout( () => {
                        document.getElementById( 'cart_main_section' ).classList.add( 'fadeout' );
                    }, 3500 )
                    setTimeout( () => {
                        document.getElementById( 'cart_main_section' ).classList.remove( 'fadeout' );
                        document.getElementById( 'cart_main_section' ).classList.remove( 'errMsg' );
                        localStorage.clear();
                        showCart();
                    }, 3501 )
                    //alert( "Vous avez supprimer le dernier article de votre panier." );
                }
            } );
        };
    };
};

/**
 * formatting price for display and computation
 * @param {Object} price to be formatted
 */
function formatPrice( price ) {
    //modify price for format
    const newPrice = parseInt( price ) / 100;
    // Format the price to € using the locale, style, and currency.
    let priceToFormat = new Intl.NumberFormat( 'fr-FR', {
        style: 'currency',
        currency: 'EUR'
    } );
    const priceFormat = priceToFormat.format( newPrice )
    return priceFormat
};


////------------------FORM-TO-FILL-------------------//// 