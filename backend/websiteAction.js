/**
 * Created by Nat on 07.09.2015.
 */


/**
 * Togglet die Top-Produkte Ansicht in Hide/Show wenn "m" gedr�ckt wird
 * TODO Bei m (more) verstecken, unterproduktansicht anzeigen
 */
var main = function () {
    $(document).on('keydown', function (event) {
        // Keypress "strg+m"
        if (event.ctrlKey && ( String.fromCharCode(event.which) === 'm' || String.fromCharCode(event.which) === 'M')) {
            $('.bestsellerRow').hide();
            $('.bestsellerText').hide();
            $('.more').hide();
            $('.moreBestseller').html("").show();
            DB.ready(allSales);
            // Keypress "strg+h"
        } else if (event.ctrlKey && ( String.fromCharCode(event.which) === 'y' || String.fromCharCode(event.which) === 'Y')) {
            $('.bestsellerRow').show();
            $('.bestsellerText').show();
            $('.more').show();
            $(".moreBestseller").html("").hide();
        }
    });
    $('.searchbar').keyup(function (){
        $('.bestsellerRow').hide();
        $('.bestsellerText').hide();
        $('.more').hide();
        $('.moreBestseller').html("").show();
        searchBarAction();
    });
};


$(document).ready(main);