/**
 * finding which id/product is to be displayed
 * @returns {idInUrl} Retrieved id in url
 */
function findIdInPage() {
    const paramsString = window.location.href;
    const url = new URL( paramsString );
    const searchParams = new URLSearchParams( url.search );
    const idInUrl = searchParams.get( 'id' );
    return idInUrl;
};
console.log( 'id in Url :', findIdInPage() );

document.addEventListener( 'DOMContentLoaded', function () {
    load();
} );

/**
 * Loading product to display 
 */
async function load() {
    const product = await getProduct();
    console.log( 'product :', product )
    showProduct( product )

}

/**
 * calling API and get product info
 * @returns {product} api product by Id
 */
function getProduct() {
    return fetch( "http://localhost:3000/api/teddies/" + findIdInPage() )
        .then( function ( res ) {
            if ( res.ok ) {
                return res.json();
            }
        } )
        .then( function ( product ) {
            console.log( 'product : ', product )
            return product
        } )
        .catch( function ( err ) {
            console.log( 'error :', err );
            document.querySelector( 'main' ).textContent = "Oups... Il y a une erreur de serveur !";
            document.querySelector( 'main' ).style.color = 'indianred';
            document.querySelector( 'main' ).style.fontSize = '24px';
            document.querySelector( 'main' ).style.fontWeight = 'bold';
            document.querySelector( 'main' ).style.margin = '30px';
            document.querySelector( 'main' ).style.paddingTop = '50px';
            document.querySelector( 'main' ).style.textAlign = "center";
        } )
}

/**
 * displaying page html content
 * @param {object} product API retrieved array element
 */
function showProduct( product ) {
    const productImgSection = document.querySelector( 'div.product_img' );
    const showProductImg = document.createElement( 'img' );
    showProductImg.classList.add( 'prodImg' );
    showProductImg.src = product.imageUrl;
    showProductImg.alt = "Ours " + product.name;
    productImgSection.appendChild( showProductImg );
    const productTitle = document.getElementById( 'title' );
    productTitle.innerText = product.name;
    const productPrice = document.getElementById( 'price' );
    //modify price for format
    const newPrice = parseInt( product.price ) / 100;
    // Format the price to € using the locale, style, and currency.
    let priceToFormat = new Intl.NumberFormat( 'fr-FR', {
        style: 'currency',
        currency: 'EUR'
    } );
    const priceFormat = priceToFormat.format( newPrice )
    productPrice.innerText = priceFormat;
    const productDescription = document.getElementById( 'description' );
    productDescription.innerText = product.description;
    const productColor = document.getElementById( 'colors' );
    const colors = Object.values( product.colors );

    for ( let color of colors ) {
        console.log( 'color : ', color );
        const optionSelect = document.createElement( 'option' );
        optionSelect.value = color;
        optionSelect.text = color;
        productColor.add( optionSelect );
    }
    const totalPrice = document.getElementById( 'totPrice' );

    document.getElementById( 'quantity' ).addEventListener( 'input', function ( event ) {
        const val = event.target.value;
        console.log( 'input', val );
        console.log( 'value quantity : ', val )
        const priceAll = priceToFormat.format( parseInt( priceFormat ) * val );
        totalPrice.innerText = ( priceAll );
        return val
    } )

}

/**
 * filling localstorage for the first time with product details
 */
function fillCart() {
    let selectedQuantity = document.getElementById( 'quantity' ).value;
    let selectedColor = document.getElementById( 'colors' ).value;
    console.log( 'quantity : ', selectedQuantity, 'color : ', selectedColor );
    const cart = [ {
        productId: findIdInPage(),
        amount: selectedQuantity,
        color: selectedColor,
        name: document.getElementById( 'title' ).innerText,
        image: document.querySelector( '.product_img img' ).src,
        description: document.getElementById( 'description' ).innerText,
        alt: document.querySelector( '.product_img img' ).alt
    } ];

    if ( !localStorage.getItem( 'cart' ) ) {
        localStorage.setItem( 'cart', JSON.stringify( cart ) );
        console.log( selectedColor, selectedQuantity );
        document.getElementById( 'msg' ).textContent = "Article ajouté au panier !";
        document.getElementById( 'msg' ).style.color = 'green';
        setTimeout( () => {
            document.getElementById( 'msg' ).classList.add( 'fadeout' )
        }, 2000 )
        document.getElementById( 'msg' ).classList.remove( 'fadeout' )
        //alert( "Article ajouté au panier !" );
        console.log( 'empty cart added new item' );
    }

    else {
        if ( checkSameCartItem() == false ) {
            console.log( 'not same cart item' );
            console.log( selectedColor, selectedQuantity );
            addItemToCart();
            document.getElementById( 'msg' ).textContent = "Article ajouté au panier !";
            document.getElementById( 'msg' ).style.color = 'green';
            setTimeout( () => {
                document.getElementById( 'msg' ).classList.add( 'fadeout' )
            }, 2000 )
            document.getElementById( 'msg' ).classList.remove( 'fadeout' )
            //alert( "Article ajouté au panier !" );
        }
        else {
            console.log( 'same cart item' );
            console.log( selectedColor, selectedQuantity );
            updateAmount();
        }
    }
};

/**
 * verifying if same product with same option is in cart
 * @returns {boolean} State of product to be added to cart
 */
function checkSameCartItem() {
    let checker = false;
    let selectedColor = document.getElementById( 'colors' ).value;
    let cartToCheck = JSON.parse( localStorage.getItem( 'cart' ) );
    for ( let item of cartToCheck ) {
        console.log( 'cart item :', item );
        if ( item.productId == findIdInPage() && item.color == selectedColor ) {
            checker = true;
        }
    }
    return checker;
};

/**
 * adding new item to cart if there is already something in cart
 */
function addItemToCart() {
    let selectedQuantity = document.getElementById( 'quantity' ).value;
    let selectedColor = document.getElementById( 'colors' ).value;
    console.log( 'quantity : ', selectedQuantity, 'color : ', selectedColor );
    let oldCart = JSON.parse( localStorage.getItem( 'cart' ) );
    //making sure parsed cart is an array
    const array = Array.from( oldCart );
    console.log( 'array? :', array );
    array.push(
        {
            productId: findIdInPage(),
            amount: selectedQuantity,
            color: selectedColor,
            name: document.getElementById( 'title' ).innerText,
            image: document.querySelector( '.product_img img' ).src,
            description: document.getElementById( 'description' ).innerText,
            alt: document.querySelector( '.product_img img' ).alt
        },
    );
    localStorage.setItem( 'cart', JSON.stringify( array ) );
};

/**
 * updating quantity if same product with same option has already been added to cart
 */
function updateAmount() {

    let selectedQuantity = document.getElementById( 'quantity' ).value;
    let selectedColor = document.getElementById( 'colors' ).value;
    let cartToUpdate = JSON.parse( localStorage.getItem( 'cart' ) );
    for ( let item of cartToUpdate ) {
        if ( item.productId == findIdInPage() && item.color == selectedColor && ( parseInt( item.amount ) + parseInt( selectedQuantity ) > 10 ) ) {
            console.log( 'quantity error : ', item.amount );
            document.getElementById( 'msg' ).textContent = "Toutes nos excuses, la quantité maximum est limitée à 10 ! Vous avez déjà "
                + item.amount + " peluches " + item.name + " de cette couleur dans votre panier.";
            document.getElementById( 'msg' ).style.color = 'red';
            setTimeout( () => {
                document.getElementById( 'msg' ).classList.add( 'fadeout' )
            }, 4000 )
            document.getElementById( 'msg' ).classList.remove( 'fadeout' )
            //alert( "Toutes nos excuses, les stocks sont limités et vous ne pouvez acheter plus de 10 articles d'un même ours !
            // Vous avez déjà " + item.amount + " peluches " + item.name + " de cette couleur dans votre panier." );
        }
        else if ( item.productId == findIdInPage() && item.color == selectedColor && ( parseInt( item.amount ) + parseInt( selectedQuantity ) <= 10 ) ) {
            item.amount = parseInt( item.amount ) + parseInt( selectedQuantity );
            console.log( 'amount : ', item.amount );
            document.getElementById( 'msg' ).textContent = "La quantité pour " +
                document.getElementById( 'title' ).innerText + " en " +
                document.getElementById( 'colors' ).value + " a bien été augmentée !";
            document.getElementById( 'msg' ).style.color = 'green';
            setTimeout( () => {
                document.getElementById( 'msg' ).classList.add( 'fadeout' )
            }, 3000 )
            document.getElementById( 'msg' ).classList.remove( 'fadeout' )
            //alert( "Vous venez d'augmenter la quantité pour " +
            //    document.getElementById( 'title' ).innerText + " en " +
            //    document.getElementById( 'colors' ).value + " avec succès !" );
        }
    }
    localStorage.setItem( 'cart', JSON.stringify( cartToUpdate ) );
};

/**
 * verifying user input value/selection
 * @returns {boolean} State of user selection
 */
function checkInputFill() {
    let amountInput = document.getElementById( 'quantity' );
    if ( amountInput.value == 0 || amountInput.value > 10 || amountInput.value < 0 ) {
        document.getElementById( 'msg' ).textContent = "Choisissez une quantité de 1 à 10 !";
        document.getElementById( 'msg' ).style.color = 'red';
        setTimeout( () => {
            document.getElementById( 'msg' ).classList.add( 'fadeout' )
        }, 2000 )
        document.getElementById( 'msg' ).classList.remove( 'fadeout' )
        //alert( "Il y a erreur sur la quantité (max. 10) !" );
        return false;
    }
    else if ( document.getElementById( 'colors' ).value == "" ) {
        document.getElementById( 'msg' ).textContent = "Choisissez la couleur !";
        document.getElementById( 'msg' ).style.color = 'red';
        setTimeout( () => {
            document.getElementById( 'msg' ).classList.add( 'fadeout' )
        }, 2000 )
        document.getElementById( 'msg' ).classList.remove( 'fadeout' )

        //alert( "Choisissez la couleur !" );
        return false;
    }
    else {
        //console.log('ok');
        return true;
    }
};

/**
 * clicking addtocart button triggers localstorage fill
 */
document.getElementById( 'addToCart' ).addEventListener( 'click', function () {
    if ( checkInputFill() ) {
        fillCart();
        //console.log( 'Storage :', localStorage );
    }
} );