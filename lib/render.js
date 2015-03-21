/**
 * Created by cecheveria on 2/12/14.
 */

/**
 * Function to build a html content using the parameter slot as a reference. It will
 * merge the slot data fields with the html template binded to this slot.
 *
 * @param slot
 * @param elmId
 * @return html content
 */
render = function(slot, elmId, flush) {
    var htmlContent = renderMain(slot);//XX

    if(elmId) {
        document.getElementById(elmId).innerHTML = flush == undefined || flush
                                                   ? htmlContent    // Replace all current content
                                                   : document.getElementById(elmId).innerHTML + htmlContent    // Append to previous content
                                                   ;
    }

    return htmlContent;
}

add = function(slot, elmId) {
    return render(slot, elmId, false /*Flush false*/);
}

renderMain = function(slot) {
    if(slot instanceof Array) {
        var htmlContent = "";

        for(x in slot) {
            htmlContent += renderOne(slot[x]);
        }

        return htmlContent;
    }
    else {
        return renderOne(slot);
    }
}

renderOne = function(slot) {
    var htmlContent = slot.layout
            ? unscape(slot.layout())
            : "" /* no layout() method defined on this slot */,
        field,
        val;

    for(x in Object.keys(slot)) {
        field = Object.keys(slot)[x];

        val = slot[field];
        val = typeof val == "object"
            ? renderMain(val)
            : (typeof val == "function"
               ? "" /*render(val.create())*/
               : val
              )
            ;
        //console.log(field + " " + val);

        htmlContent = htmlContent.replace(RegExp("{@" + field + "@}","g"), val + "");
    }

    return htmlContent;
}

unscape = function (html) {
    return html
        .replace(RegExp("@@SLR@@","g"), "\r")
        .replace(RegExp("@@SLN@@","g"), "\n")
        .replace(RegExp("@@SLT@@","g"), "\t")
        .replace(RegExp("@@SQUOTE@@","g"), "'")
        .replace(RegExp("@@DQUOTE@@","g"), "\"")
        .replace(RegExp("@@LT@@","g"), "<")
        .replace(RegExp("@@GT@@","g"), ">")
        .replace(RegExp("@@ASTE@@","g"), "*")
        .replace(RegExp("@@BSLASH@@","g"), "/")
        ;
}

module.exports.render = render;
module.exports.add = add;
module.exports.unscape = unscape;

/* x.1
var ca1 = new cards();
ca1.cardTitle="El carrito 1";
ca1.ki="8.15";
ca1.priceInteger="11";
ca1.priceDecimal=34;
//
var ca2 = new cards();
ca2.cardTitle="El carrito 2";
ca2.ki="9.15";
ca2.priceInteger="10";
ca2.priceDecimal=10;

//toyota-4runner-1.jpg
//toyota-fj-cruiser-4x4-1.jpg

//var travelsIns = new Object();
var travelsIns = [ca1, ca2];

Slot.render(travelsIns, "travelsIns");
*/
