/**
 * checking local storage condition
 * @returns {boolean} localStorage condition
 */
( function checkLocalStorage() {
    if ( !localStorage.getItem( 'cart' ) ) {
        console.log( 'empty cart' );
        localStorage.clear();
        document.getElementById( 'cart_main_section' ).classList.add( 'cartEmpty' );
        document.getElementById( 'cart_main_section' ).textContent = "Votre panier est vide, sélectionnez un ours depuis la page d'accueil et ajoutez le à votre panier.";
    }
    else {
        //console.log( 'local storage loaded', localStorage );
        load();
        firstNameForm();
        lastNameForm();
        addressForm();
        cityForm();
        emailForm();
        // validAll()
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
        let formattedPrice;
        let formattedTotal;
        for ( const el of thisCart ) {
            for ( let product of products ) {
                if ( el.productId === product._id ) {
                    priceP = product.price;
                    formattedPrice = formatPrice( product.price )
                    formattedTotal = formatPrice( product.price * el.amount )
                }
                //console.log( 'price? : ', formattedPrice )
            };
            htmltxt += `<article class="cart_item" data-id="${ el.productId }" data-color="${ el.color }">
                        <div class="cart_item_img">
                            <img class="cartImg" src="${ el.image }" alt="${ el.alt }">
                        </div>
                        <div class="cart_item_content">
                            <div class="cart_item_content_info">
                                <h2 class="item_name">${ el.name }</h2>
                                <p class="item_color">${ el.color }</p>
                                <p class="item_tot_price">${ formattedTotal }</p>
                                <p class="item_sing_price">(${ formattedPrice } la pièce)</p>
                            </div>
                            <div class="cart_item_content_settings">
                                <div class="cart_item_content_settings_quantity">
                                    <p>Qté : </p>
                                    <input class="itemQuantity" name="itemQuantity" type="number" min="1" max="10"
                                        value="${ el.amount }">
                                    <p class="errorQuantity"></p>
                                </div>
                                <div class="cart_item_content_settings_delete">
                                    <button class="delete_item">Supprimer</button>
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
    let formatTotal = new Intl.NumberFormat( 'fr-FR', {
        style: 'currency',
        currency: 'EUR'
    } );
    const globalPrice = formatTotal.format( total )

    document.getElementById( 'totalPrice' ).textContent = globalPrice;
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
                    localStorage.setItem( "cart", JSON.stringify( cartItems ) );
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


/**
 * firstName field validation
*/
function firstNameForm() {
    const firstName = document.getElementById( 'firstName' );
    const lastName = document.getElementById( 'lastName' );
    const address = document.getElementById( 'address' );
    const city = document.getElementById( 'city' );
    const email = document.getElementById( 'email' );
    firstName.addEventListener( 'change', function ( event ) {
        if ( /^[A-Z][A-Za-z -ïîëéèùûêâôöçäü]{1,45}$/.test( event.target.value ) ) {
            document.getElementById( 'firstNameErrorMsg' ).textContent = "";
            firstName.style.border = 'solid medium green';
            if ( lastName.style.border == 'medium solid green' &&
                address.style.border == 'medium solid green' &&
                city.style.border == 'medium solid green' &&
                email.style.border == 'medium solid green' ) {
                console.log( 'style:', firstName.style.border )
                document.getElementById( 'order' ).removeAttribute( 'disabled' );
            }
        }
        else if ( event.target.value == "" ) {
            document.getElementById( 'firstNameErrorMsg' ).textContent = "";
            firstName.style.border = 'currentColor solid 2px';
            document.getElementById( 'order' ).setAttribute( 'disabled', 'true' );
        }
        else {
            document.getElementById( 'firstNameErrorMsg' ).textContent = "Veuillez renseigner votre prénom... (ex. Gwen)";
            firstName.style.border = 'solid thin red';
            document.getElementById( 'order' ).setAttribute( 'disabled', 'true' );
        }
    } )
};

/**
 * lastName field validation
 */
function lastNameForm() {
    const firstName = document.getElementById( 'firstName' );
    const lastName = document.getElementById( 'lastName' );
    const address = document.getElementById( 'address' );
    const city = document.getElementById( 'city' );
    const email = document.getElementById( 'email' );
    lastName.addEventListener( 'change', function ( event ) {
        if ( /^[A-Z][A-Za-z -ïîëéèùûêâôöçäü]{1,45}$/.test( event.target.value ) ) {
            document.getElementById( 'lastNameErrorMsg' ).textContent = "";
            lastName.style.border = 'solid medium green';
            if ( firstName.style.border == 'medium solid green' &&
                address.style.border == 'medium solid green' &&
                city.style.border == 'medium solid green' &&
                email.style.border == 'medium solid green' ) {
                document.getElementById( 'order' ).disabled = false;
            }
        }
        else if ( event.target.value == "" ) {
            document.getElementById( 'lastNameErrorMsg' ).textContent = "";
            lastName.style.border = 'currentColor solid 2px';
            document.getElementById( 'order' ).setAttribute( 'disabled', 'true' );
        }
        else {
            document.getElementById( 'lastNameErrorMsg' ).textContent = "Veuillez renseigner votre nom... (ex. Dupont)";
            lastName.style.border = 'solid thin red';
            document.getElementById( 'order' ).setAttribute( 'disabled', 'true' );
        }
    } )
};

/**
 * address field validation
 */
function addressForm() {
    const firstName = document.getElementById( 'firstName' );
    const lastName = document.getElementById( 'lastName' );
    const address = document.getElementById( 'address' );
    const city = document.getElementById( 'city' );
    const email = document.getElementById( 'email' );
    address.addEventListener( 'change', function ( event ) {
        if ( /^[a-zA-Z0-9\s,'-.ç _àçïîëéêèûâùôöäü]*^.{6,}$/.test( event.target.value ) ) {
            document.getElementById( 'addressErrorMsg' ).textContent = "";
            address.style.border = 'solid medium green';
            if ( lastName.style.border === 'medium solid green' &&
                firstName.style.border === 'medium solid green' &&
                city.style.border === 'medium solid green' &&
                email.style.border === 'medium solid green' ) {
                document.getElementById( 'order' ).disabled = false;
            }
        }
        else if ( event.target.value == "" ) {
            document.getElementById( 'addressErrorMsg' ).textContent = "";
            address.style.border = 'currentColor solid 2px';
            document.getElementById( 'order' ).setAttribute( 'disabled', 'true' );
        }
        else {
            document.getElementById( 'addressErrorMsg' ).textContent = "Veuillez renseigner votre adresse... (ex. 10 rue des prés)";
            address.style.border = 'solid thin red';
            document.getElementById( 'order' ).setAttribute( 'disabled', 'true' );
        }
    } )
};

/**
 * city field validation
 */
function cityForm() {
    const firstName = document.getElementById( 'firstName' );
    const lastName = document.getElementById( 'lastName' );
    const address = document.getElementById( 'address' );
    const city = document.getElementById( 'city' );
    const email = document.getElementById( 'email' );
    city.addEventListener( 'change', function ( event ) {
        if ( /^[A-Z][A-Za-z\s'-. _àçïîëéêèûâùôöçäü]*$/.test( event.target.value ) ) {
            document.getElementById( 'cityErrorMsg' ).textContent = "";
            city.style.border = 'solid medium green';
            if ( lastName.style.border == 'medium solid green' &&
                address.style.border == 'medium solid green' &&
                firstName.style.border == 'medium solid green' &&
                email.style.border == 'medium solid green' ) {
                document.getElementById( 'order' ).disabled = false;
            }
        }
        else if ( event.target.value == "" ) {
            document.getElementById( 'cityErrorMsg' ).textContent = "";
            city.style.border = 'currentColor solid 2px';
            document.getElementById( 'order' ).setAttribute( 'disabled', 'true' );
        }
        else {
            document.getElementById( 'cityErrorMsg' ).textContent = "Veuillez renseigner votre ville... (ex. Grenoble)";
            city.style.border = 'solid thin red';
            document.getElementById( 'order' ).setAttribute( 'disabled', 'true' );
        }
    } )
};

/**
 * email field validation
 */
function emailForm() {
    const firstName = document.getElementById( 'firstName' );
    const lastName = document.getElementById( 'lastName' );
    const address = document.getElementById( 'address' );
    const city = document.getElementById( 'city' );
    const email = document.getElementById( 'email' );
    email.addEventListener( 'change', function ( event ) {
        if ( /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test( event.target.value ) ) {
            document.getElementById( 'emailErrorMsg' ).textContent = "";
            email.style.border = 'solid medium green';
            if ( lastName.style.border == 'medium solid green' &&
                address.style.border == 'medium solid green' &&
                city.style.border == 'medium solid green' &&
                firstName.style.border == 'medium solid green' ) {
                document.getElementById( 'order' ).disabled = false;
            }
        }
        else if ( event.target.value == "" ) {
            document.getElementById( 'emailErrorMsg' ).textContent = "";
            email.style.border = 'currentColor solid 2px';
            document.getElementById( 'order' ).setAttribute( 'disabled', 'true' );
        }
        else {
            document.getElementById( 'emailErrorMsg' ).textContent = "Veuillez renseigner une adresse email valide... (ex. j.vincent@google.org)";
            email.style.border = 'solid thin red';
            document.getElementById( 'order' ).setAttribute( 'disabled', 'true' );
        }
    } )
};


/**
 * sending form to server
 * @param {object} event submit button event listener
 */
function sendFormToServer( event ) {
    let form = document.querySelector( '.cart_form_fill' );
    event.preventDefault();
    let valid = form.checkValidity();
    if ( valid == true ) {
        //console.log( 'validity', valid );
        const formOrder = requestForm();
        //console.log( 'order', formOrder );
        fetch( "http://localhost:3000/api/teddies/order",
            {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify( formOrder )
            } )
            .then( function ( res ) {
                if ( res.ok ) {
                    //console.log( 'res', res )
                    return res.json();
                }
            } )
            .then( function ( formOrder ) {
                const priceT = document.getElementById( 'totalPrice' ).innerText;
                const price = priceT.replace( /[^\w]/g, "" ) / 100;
                alert( "Merci pour votre commande !" );
                // console.log( 'order products : ', formOrder.products )
                // console.log( 'success :', formOrder );
                location.href = 'confirmation.html?id=' + formOrder.orderId + '&am=' + price;
            } )
            .catch( function ( err ) {
                console.log( "an error occurred", err );
                alert( "erreur" )
            } )
    }
};

/**
 * building post request element
 * @returns {object} formOrder built post request
 */
function requestForm() {
    const formOrder = {
        contact: {
            firstName: document.getElementById( 'firstName' ).value,
            lastName: document.getElementById( 'lastName' ).value,
            address: document.getElementById( 'address' ).value,
            city: document.getElementById( 'city' ).value,
            email: document.getElementById( 'email' ).value
        },
        products: requestStrings(),
    };
    return formOrder;
};

/**
 * retrieving product strings needed while building post element
 * @returns {array} products
 */
function requestStrings() {
    let cartItems = JSON.parse( localStorage.getItem( "cart" ) );
    const getStrings = [];
    for ( let item of cartItems ) {
        const id = item.productId;
        getStrings.push( id );
    };
    return getStrings;
};

/**
 * form event listener
 */
document.querySelector( '.cart_form_fill' ).addEventListener( 'submit', sendFormToServer );

/**
 * calling scroll function on scroll
 */
window.onscroll = function () {
    scroll()
};

/**
 * make back to top button appear when scrolling
 */
function scroll() {
    const btn = document.getElementById( 'btnTop' );
    if ( document.body.scrollTop > 200 || document.documentElement.scrollTop > 200 ) {
        btn.classList.add( 'show' );
    }
    else {
        btn.classList.remove( 'show' );
    }
};

/**
 * back to top button event listener
 */
document.getElementById( 'btnTop' ).addEventListener( 'click', function ( event ) {
    event.preventDefault();
    window.scrollTo( { top: 0, behavior: 'smooth' } );
} );