globalTestObject = {
    
    sampleText : "This text is the property value of an object defined in the JavaScript global scope and it's used to demonstrate simple data binding in JPF."
};

window.onload = function(e) {
    var bindingSpan = document.getElementById("bindingSpan");
    Jpf.setElementBindingSource(bindingSpan, globalTestObject);

    var listElement = document.getElementById("list");
    var list = new List(listElement);
    list.items = [];
    for (var i = 0; i < 100; i++) {
        list.items.push(i);
    }
    list.scrollTo(11);
};