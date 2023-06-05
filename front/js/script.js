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

}

/**
 * Calling API to get products info
 * @returns {products} API product
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
            console.log( 'teddies :', products );
            return products
        } )
        .catch( function ( err ) {
            console.log( 'error :', err );
            //alert( "Erreur" )
        } )
}

/**
 * displaying HTML content for each card
 * @param {object} product API retrieved product to display 
 */
function showProducts( product ) {
    console.log( 'products :', product )
    const itemsSection = document.getElementById( 'items' );
    const showList = document.createElement( 'li' );
    const showAnchor = document.createElement( 'a' );
    const showArticle = document.createElement( 'article' );
    const showImage = document.createElement( 'img' );
    const showHeading = document.createElement( 'h3' );
    showAnchor.setAttribute( 'href', './product.html?id=' + product._id );
    showImage.setAttribute( 'src', product.imageUrl );
    showImage.alt = product.name;
    showHeading.innerText = product.name;
    showHeading.classList.add( 'productName' );
    showImage.classList.add( 'listImage' );
    showAnchor.appendChild( showArticle );
    showArticle.appendChild( showHeading );
    showArticle.appendChild( showImage );
    showList.appendChild( showAnchor );
    itemsSection.appendChild( showList );
}