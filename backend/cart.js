/**
 * Created by Nat on 10.09.2015.
 */


var cartItems = [];
var totalPrice = 0;
var cartCount = $('.cartCounter').value;

/**
 * Aktualisiert die Produkt-Anzahl, wenn bei einem Produkt auf den Warenkorb geklickt wird
 * Die Anzahl im Lager wird reduziert, an die Warenkorbmethode wird �bergeben, um welches Produkt es sich handelt
 * Sind keine Produkte mehr auf Lager, wird eine Infonachricht dar�ber erzeugt.
 * @param pid
 * @param amount
 */
var updateProductQuantity = function (pid, amount) {
    amount = parseInt(amount);
    console.log("Anzahl der Produkte wird um 1 reduziert");
    DB.Product.load(pid).then(function (cartProduct) {
        if (cartProduct.stueckzahl >= amount) {
            cartProduct.stueckzahl = cartProduct.stueckzahl - amount;
            cartProduct.gesamtverkauf = cartProduct.gesamtverkauf + amount;
            cartProduct.update();
            $('.stueckZahl').text(cartProduct.stueckzahl);
            updateCartItem(pid, amount);
            if (typeof cartCount === "undefined") {
                cartCount = 0;
            }
            cartCount = cartCount + amount;
            $('.cartCounter').text(cartCount);
        } else {
            window.alert("Keine mehr auf Lager!");
        }
    });
};

/**
 * Die Produkte im Warenkorb werden aktualisiert
 * Dabei wird gepr�ft, ob ein Produkt sich bereits im Warenkorb befindet, ist dies der Fall, wird die Anzahl
 * erh�ht
 * @param pid
 * @param amount
 */
var updateCartItem = function (pid, amount) {
    DB.Product.load(pid).then(function (product) {
        var productExists = false;
        cartItems.forEach(function (product) {
            if (product.p.id === pid) {
                product.a += amount;
                productExists = true;
            }
        });
        // Wenn das Produkt noch nicht im Warenkorb existiert, wird es der Liste hinzugef�gt
        if (!productExists) {
            cartItems.push({p: product, a: 1});
        }
    });
    console.log("Cart Items: " + JSON.stringify(cartItems));
};

/**
 * Hier wird die eigentliche Warenkorb Seite erzeugt
 */
var buildCartPage = function () {
    cartItems.forEach(function (product) {
        var name = product.p.name;
        if (name.length > 10) {
            name = name.substring(0, 9) + "...";
        }
        $("#cartPage").append("<div class=\"row\">" +
            "<div id=\"" + product.p.id + "\" class=\"cartItem productLink col-md-2\">" +
            "<img src=\"" + product.p.bild + "\"></div>" +
            "<div class=\"col-md-2\">" + name + " </div>" +
            "<div class=\"col-md-2\">" + product.p.preis + " Euro</div>" +
            "<div class=\"col-md-2\">" +
            "<input class=\"cartAmountInput\" min='0' type=" + "number" + " id=" + "" + product.p.id + "a" + "" + " value=" + "" + product.a + "" + ">" +
            "</input></div>" +
            "<div class=\"col-md-2 deleteFromCart\" id=\"" + product.p.id + "d" + "\">  Delete" +
            "</div></div></div>");
    });
    clickAction();
    changeCartAmountAction();
    deleteFromCart();
};

/**
 * Der komplette Preis von allen Produkten im Warenkorb wird berechnet
 * Diese Methode wird ausgef�hrt, wenn ein einzelnes Produkt �ber den Warenkorb Button in den Warenkorb
 * hinzugef�gt wird oder eine Produktmenge im Warenkorb ver�ndert wird
 */
var changeAndCalculateFullPrice = function () {
    console.log("Calculate Full Price");
    totalPrice = 0;
    if (cartItems.length === 0 || cartItems.length === null) {
        $('.totalPrice').text("0 Euro");
    } else {
        cartItems.forEach(function (cartProduct) {
            var productPrice = cartProduct.p.preis;
            var oldAmount = cartProduct.a;
            var newAmount = $('#' + cartProduct.p.id + 'a').val();
            newAmount = parseInt(newAmount);
            var inStock = 0;
            DB.Product.load(cartProduct.p.id).then(function (product) {
                console.log("Aktualisiere Produkt in DB");
                inStock = product.stueckzahl;
                console.log("New Amount: " + newAmount + " Old Amount: " + oldAmount + " Auf Lager " + inStock);
                var inStockPlusOldAmount = (oldAmount + inStock);
                // Hier wird sichergestellt, dass nicht mehr Produkte in den Warenkorb gelegt werden, als auf Lager sind

                if (newAmount > 0) {
                    if ((newAmount <= parseInt(inStockPlusOldAmount))) {
                        console.log("New Amount: " + newAmount + " Auf Lager und Old Amount: " + inStockPlusOldAmount);
                        cartProduct.a = newAmount;
                        totalPrice = totalPrice + (productPrice * newAmount);
                        $('.totalPrice').text(totalPrice + " Euro");
                        var diffAmount = newAmount - oldAmount;
                        // Update Product in DB
                        updateCart(product, diffAmount);


                        // Wenn die Produktanzahl zu hoch ist, gibt es Fehlermeldungen
                    } else if (inStock > 0) {
                        setBackAmount(cartProduct, oldAmount);
                        window.alert("Bitte geben Sie einen gueltigen Wert ein!");
                    } else {
                        setBackAmount(cartProduct, oldAmount);
                        window.alert("Bitte geben Sie einen gueltigen Wert ein!");
                    }
                } else {
                    setBackAmount(cartProduct, oldAmount);
                    window.alert("Bitte geben Sie einen gueltigen Wert ein!");
                }
            });
        });
    }
};

var setBackAmount = function (cartProduct, oldAmount) {
    cartProduct.a = oldAmount;
    $('#' + cartProduct.p.id + 'a').val(oldAmount);
};

var updateCart = function (product, diffAmount) {
    product.stueckzahl = product.stueckzahl - diffAmount;
    product.gesamtverkauf = product.gesamtverkauf + diffAmount;
    product.update();
    console.log("Produkt erfolgreich in DB aktualisiert");
    cartCount = parseInt(cartCount + diffAmount);
    $('.cartCounter').text(parseInt(cartCount));
};

/**
 * L�scht ein Produkt aus dem Warenkorb
 * @param pid
 */
var deleteProductFromCart = function (pid) {
    cartItems.forEach(function (product) {
        if (product.p.id + "d" === pid) {
            var productPosition = cartItems.indexOf(product);
            var productAmount = product.a;
            productAmount = parseInt(productAmount);
            productAmount = productAmount * -1;

            cartCount += productAmount;
            $('.cartCounter').text(cartCount);

            updateDBItem(product.p.id, productAmount);
            cartItems.splice(productPosition, 1);

            console.log("Produkt wurde erfolgreich entfernt!");
            console.log("Cart Items: " + JSON.stringify(cartItems));
        }
    });
};

/**
 * aktualisiert das Produkt auf der DB
 * @param pid
 * @param amount
 */
var updateDBItem = function (pid, amount) {
    DB.Product.load(pid).then(function (DBProduct) {
        DBProduct.stueckzahl = DBProduct.stueckzahl - amount;
        DBProduct.gesamtverkauf = DBProduct.gesamtverkauf + amount;
        DBProduct.update();
    })
};


/**
 * Der Gesamtpreis wird auf der Oberfl�che wiedergegeben
 */
var printTotalPrice = function () {
    $("#fullPrice").append("<div class=\"row\">" +
        "<div class=\"col-md-6\"></div>" +
        "<div class=\"totalPrice col-md-2\">" + totalPrice + " Euro</div>" +
        "<div class=\"jetztKaufen col-md-2\"><button>Jetzt kaufen!</button></div>" +
        "</div></div></div>");
    clickJetztKaufen();
};


var clickJetztKaufen = function () {
    $('.jetztKaufen').click(function () {
        window.history.replaceState({info: "Mainpage"}, null, "?main");
       location.reload();
    });
};

