globalTestObject = {
    
    sampleText : "This text is the property value of an object defined in the JavaScript global scope and it's used to demonstrate simple data binding in JPF."
};

window.onload = function(e) {
    var bindingSpan = document.getElementById("bindingSpan");
    Jpf.setElementBindingSource(bindingSpan, globalTestObject);
};