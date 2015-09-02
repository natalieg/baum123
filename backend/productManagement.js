//Connect
DB.connect("http://baum123.baqend.com");

//Let's create a Product item
var newProduct = function () {
    var myProduct = new DB.Product();
    myProduct.name = "My Todo";
    myProduct.beschreibung = "Testbeschreibung";
    myProduct.preis = 24;
    myProduct.liste = "Baum";
    printItem(myProduct);
};

// L�dt alle Produkte aus der Datenbank und druckt diese
var productFindAndPrint = function () {
    DB.Product.find()
        .ascending("name")
        .resultList(function (result) {
            result.forEach(function (product) {
                console.log(product.name);
            });
            printItems("Produkte", result)
        });
};

// L�dt alle Produkte aus der Datenbank
var productFind = function () {
    return DB.Product.find()
        .ascending("name")
        .resultList();
};

function loadProductAndUpdate() {
    DB.Product.find()
        .ascending("name")
        .resultList(function (result) {
            productUpdate(result)
        });
}

function productUpdate(products) {
    products.forEach(function (product) {
        var preis = document.getElementById(product.id).value;
        if (preis != null && preis != product.preis) {
            product.preis = preis;
            product.update();
        }
    });
}

//hier werden die Methoden ausgef�hrt, wenn die Datenbank bereit ist
DB.ready(newProduct);
DB.ready(productFindAndPrint);


//Boilerplate code below -----------------------------------------------------------------------------------------------

// Gibt ein neu eingef�gtes Produkt auf der Oberfl�che aus
function printItem(product) {
    $("#hello").append(JSON.stringify(product.toJSON(true), null, "  "));
};

//Gibt die Produkte auf der Oberfl�che aus
function printItems(msg, products) {
    $("#hello2 h4").html(msg);
    products.forEach(function (product) {
        $("#hello2 table").append("<tr><td class=" + "productTD" + ">" + (product).name + " </td> " +
            "<td class=" + "productTD" + "> Preis: " +
            "<input type=" + "text" + " id=" + "" + (product).id + "" + " value=" + "" + (product).preis + "" + "></input></td>" + "</tr>");
    });
}

// TOLLER KOMMENTAR
