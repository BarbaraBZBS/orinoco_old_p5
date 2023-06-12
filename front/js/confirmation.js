/**
 * finding which order id is to be displayed
 * @returns {idInUrl} Retrieved id in url
 */
function findOrderId() {
    const paramsString = window.location.href;
    const url = new URL( paramsString );
    const searchParams = new URLSearchParams( url.search );
    const idInUrl = searchParams.get( 'id' );
    return idInUrl;
};

/**
 * finding which order price is to be displayed
 * @returns {priceInUrl} Retrieved price in url
 */
function findOrderPrice() {
    const paramsString = window.location.href;
    const url = new URL( paramsString );
    const searchParams = new URLSearchParams( url.search );
    const priceInUrl = searchParams.get( 'am' );
    return priceInUrl;
};

// console.log( 'id in Url :', findOrderId() );
// console.log( 'price in Url :', findOrderPrice() );

/**
 *  Page loading
 */
document.addEventListener( 'DOMContentLoaded', function () {
    loadOrderData();
} );

/**
 * Displaying confirmation info
 */
function loadOrderData() {
    let formatPrice = new Intl.NumberFormat( 'fr-FR', {
        style: 'currency',
        currency: 'EUR'
    } );
    const globalPrice = formatPrice.format( findOrderPrice() );
    document.getElementById( 'orderId' ).textContent = findOrderId();
    document.getElementById( 'orderPrice' ).textContent = globalPrice;
    localStorage.clear()
};
