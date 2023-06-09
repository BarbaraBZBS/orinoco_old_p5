/**
 *  Page loading
 */
document.addEventListener( 'DOMContentLoaded', function () {
    load();
} );

/**
 * Loading each product card on home page
 */
async function load() {
    const products = await getTeddies();
    for ( let product of products ) {
        showProducts( product )
    }
};

/**
 * Calling API to get products info
 * @returns {products} API products
 */
function getTeddies() {
    //getting data after checking validity response then catching error
    return fetch( "http://localhost:3000/api/teddies" )
        .then( function ( res ) {
            if ( res.ok ) {
                return res.json()
            }
        } )
        .then( function ( products ) {
            //console.log( 'teddies :', products );
            return products
        } )
        .catch( function ( err ) {
            console.log( 'error :', err );
            document.querySelector( 'section.presentation_i' ).classList.add( 'serverError' );
            document.querySelector( 'section.presentation_i' ).textContent = "Oups... Il y a une erreur de serveur !";
        } )
};

/**
 * displaying HTML content for each card
 * @param {object} product API retrieved product to display 
 */
function showProducts( product ) {
    const itemsSection = document.getElementById( 'items' );
    const showList = document.createElement( 'li' );
    showList.classList.add( 'list' );
    const showAnchor = document.createElement( 'a' );
    showAnchor.classList.add( 'anchor' );
    const showArticle = document.createElement( 'article' );
    //const imageDiv = document.createElement( 'div' );
    const showImage = document.createElement( 'img' );
    const showHeading = document.createElement( 'h3' );
    showAnchor.setAttribute( 'href', './product.html?id=' + product._id );
    showImage.setAttribute( 'src', product.imageUrl );
    showImage.alt = "Ours " + product.name;
    showHeading.innerText = product.name;
    showHeading.classList.add( 'productName' );
    showImage.classList.add( 'listImage' );
    showImage.classList.add( 'scale' );
    showArticle.appendChild( showHeading );
    showArticle.appendChild( showAnchor );
    showAnchor.appendChild( showImage );
    showList.appendChild( showArticle );
    itemsSection.appendChild( showList );
};

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