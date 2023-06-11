( function checkLocalStorage() {
    if ( !localStorage.getItem( 'cart' ) ) {
        console.log( 'empty cart' );
        document.getElementById( 'cart_main_section' ).textContent = "Votre panier est vide, sélectionnez un ours depuis la page d'accueil et ajoutez le à votre panier.";
    }
    else {
        console.log( 'local storage loaded', localStorage );
        load();
    }
} )();

async function getProducts() {
    return fetch( "http://localhost:3000/api/teddies" )
        .then( function ( res ) {
            if ( res.ok ) {
                return res.json();
            }
        } )
        .then( function ( products ) {
            console.log( 'products : ', products )
            return products;
        } )
        .catch( function ( err ) {
            console.log( 'err : ', err );
            document.getElementById( 'cart_main_section' ).textContent = "Oups... Il y a une erreur de serveur !";
            document.getElementById( 'cart_main_section' ).style.color = 'indianred';
            document.getElementById( 'cart_main_section' ).style.fontWeight = 'bold';
            document.getElementById( 'cart_main_section' ).style.fontSize = '24px';
            document.getElementById( 'cart_main_section' ).style.margin = '30px';
            document.getElementById( 'cart_main_section' ).style.paddingTop = '50px';
        } )
};

async function getCartItems() {

    let cartItems = JSON.parse( localStorage.getItem( 'cart' ) );
    if ( cartItems != null ) {
        return cartItems;
    }
    else {
        console.log( 'no cart' );
        document.getElementById( 'empty_cart_msg' ).textContent = "Votre panier est vide, sélectionnez un ours depuis la page d'accueil et ajoutez le à votre panier.";
    }
};

async function load() {
    const cartItems = await getCartItems();
    for ( let cartItem of cartItems ) {
        showCart( cartItem );
    }
};

async function showCart() {
    const products = await getProducts();
    const thisCart = await getCartItems();

    if ( thisCart.length > 0 ) {

        let htmltxt = "";
        let priceP;
        for ( const el of thisCart ) {
            for ( let product of products ) {
                if ( el.productId === product._id ) {
                    priceP = product.price;
                    //console.log( 'this item price : ', priceP )
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
                                </div>
                                <div class="cart_item_content_settings_delete">
                                    <button class="delete_item">Supprimer du panier</button>
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

async function showGlobalQuantity() {
    const thisCart = await getCartItems();
    let quantity = 0;
    for ( const el of thisCart ) {
        quantity += parseInt( el.amount );
    }
    document.getElementById( 'totalQuantity' ).textContent = quantity;
};

async function showGlobalPrice() {
    const thisCart = await getCartItems();
    let total = 0;
    let idx = 0;
    const totalPrices = document.querySelectorAll( '.item_tot_price' );
    for ( let el of thisCart ) {
        console.log( el.amount );
        console.log( 'idx : ', idx );
        const tot = totalPrices[ idx ].innerText;
        total += parseInt( tot );
        idx++;
    };
    document.getElementById( 'totalPrice' ).textContent = total;
};

function updateItemAmount() {
    let itemAmountInput = document.getElementsByClassName( 'itemQuantity' );
    console.log( 'quant : ', itemAmountInput );
    let cartItemId;
    let cartItemAmount;
    let cartItemColor;
    if ( itemAmountInput.length > 0 ) {
        for ( const amount of itemAmountInput ) {
            console.log( 'amount btn : ', amount )
            amount.addEventListener( 'change', function ( event ) {
                console.log( 'new amount : ', event.target.value );
                cartItemId = event.target.closest( 'article' ).dataset.id;
                cartItemColor = event.target.closest( 'article' ).dataset.color;
                cartItemAmount = amount.value;
                console.log( cartItemId );
                console.log( cartItemColor );
                console.log( cartItemAmount );
                if ( amount.value == 0 || amount.value < 0 || amount.value == "" || amount.value > 10 ) {
                    alert( "Choisissez une nouvelle quantité comprise entre 1 et 10 !" );
                    showCart()
                }
                else {
                    let cartItems = JSON.parse( localStorage.getItem( 'cart' ) );
                    for ( item of cartItems ) {
                        if ( item.productId == cartItemId && item.color == cartItemColor ) {
                            item.amount = cartItemAmount
                            console.log( 'new amount : ', item.amount );
                            console.log( 'cart : ', cartItems );
                        }
                    }
                    localStorage.setItem( 'cart', JSON.stringify( cartItems ) );
                    showCart();
                    showGlobalQuantity();
                    showGlobalPrice();
                }
            } )
        }
    }
};

function removeItem() {
    let deleteBtn = document.getElementsByClassName( 'delete_item' );
    console.log( 'delete buttons : ', deleteBtn )

    for ( const btn of deleteBtn ) {
        console.log( 'delete button : ', btn )
    }
};