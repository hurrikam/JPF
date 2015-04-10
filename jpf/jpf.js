var Jpf = Jpf || new (function () {

    /* JPF binding attribute syntax and expressions */

    var bindingAttributePrefix = "jpf-bind-";
    var bindingSourcePropertyName = "jpfBindingSource";

    /* Property change notification */

    var addPropertyChangedHandlerName = "addPropertyChangedHandler";
    var removePropertyChangedHandlerName = "removePropertyChangedHandler";

    var handleBindingSourcePropertyChanged = function (source, propertyName) {
        var bindings = getBindingsToSource(source);
        if (bindings) {
            var bindingsToProperty = bindings.toProperty(propertyName);
            if (bindingsToProperty) {
                for (var i = 0; i < bindingsToProperty.length; i++) {
                    var binding = bindingsToProperty[i];
                    updateBinding(binding);
                }
            }
        }
    };

    var isObservable = function (obj) {
        if (obj) {
            return (obj[addPropertyChangedHandlerName] !== undefined);
        }
        return false;
    };

    var addPropertyChangedHandler = function (obj) {
        if (isObservable(obj)) {
            obj[addPropertyChangedHandlerName](handleBindingSourcePropertyChanged);
        }
    };

    var removePropertyChangedHandler = function (obj) {
        if (isObservable(obj)) {
            obj[removePropertyChangedHandlerName](handleBindingSourcePropertyChanged);
        }
    };

    /* Functions for creating, updating and disposing bindings on DOM Elements */

    var isAttributeBindingDefinition = function(attribute) {
        return (attribute.name.trim().toLowerCase().indexOf(bindingAttributePrefix) === 0);
    };

    var getAttributeBindingSourceProperty = function (attribute) {
        return attribute.value;
    };

    var getAttributeBindingTargetProperty = function(attribute) {
        return attribute.name.substr(bindingAttributePrefix.length);
    };

    /* This is the global map of binding sources. The fundamental concept behind using a weak map here is that it allows 
    the referenced objects (and so the associated entries) to be garbage collected when no strong references to them exist. */
    var bindingSourceMap = new WeakMap();

    /* Creates an entry for the global binding source map */
    var bindingSourceMapEntry = function () {

        var propertyMap = {};

        this.toProperty = function (propertyName) {
            if (!propertyMap[propertyName]) {
                return propertyMap[propertyName];
            }
            return null;
        };

        this.addPropertyBinding = function(propertyName, targetElement, targetPropertyName) {
            var bindingsToProperty = this.toProperty(propertyName);
            if (!bindingsToProperty) {
                propertyMap[propertyName] = [];
            }
            var propertyBindings = propertyMap[propertyName];
            var binding = { target: targetElement, targetProperty: targetPropertyName, sourceProperty: propertyName };
            propertyBindings.push(binding);
            return binding;
        };
    };

    /* This function should be O(1) in returning bindings for the specified source and thus should be implemented using
    a dictionary/hash table. Also, weak references should be used to avoid memory leaks */
    var getBindingsToSource = function(source) {
        if (source) {
            var sourceKey = source.hash.toString();
            return bindingSourceMap[sourceKey];
        }
        return null;
    };

    var updateBinding = function (binding, source) {
        var bindingValue = source[binding.sourceProperty];
        if (binding.target && (bindingValue !== undefined)) {
            binding.target[binding.targetProperty] = bindingValue;
        }
    };

    var setElementBinding = function(element, elementProperty, source, sourceProperty) {
        if (isObservable(source)) {
            /* Create an entry in the global binding table for the specified source, if it doesn't exist yet */
            if (!bindingSourceMap.has(source)) {
                bindingSourceMap.set(source, new bindingSourceMapEntry());
                addPropertyChangedHandler(source);
            }
            var bindings = bindingSourceMap.get(source);
            var binding = bindings.addPropertyBinding(sourceProperty, element, elementProperty);
            updateBinding(binding, source);
        } else {
            var oneTimeBinding = { target: element, targetProperty: elementProperty, sourceProperty: sourceProperty };
            updateBinding(oneTimeBinding, source);
        }
    };

    var findElementBindingSource = function (element) {
        /*
        1) Check if a binding source is already set for the element
        2) Recursively check parent elements
        */
        if (!element) {
            return null;
        }
        if (element[bindingSourcePropertyName]) {
            return element[bindingSourcePropertyName];
        }
        return findElementBindingSource(element.parentElement);
    };

    var findBindingSource = function (bindingAttribute) {
        if (bindingAttribute) {
            return findElementBindingSource(bindingAttribute.ownerElement);
        }
        return null;
    };

    var findElementProperty = function (element, propertyName) {
        for (var propName in element) {
            if (propName.trim().toLowerCase() === propertyName.toLowerCase()) {
                return propName;
            }
        }
        return null;
    };

    var createElementBindings = function(element) {
        var attributes = element.attributes;
        if (attributes) {
            for (var i = 0; i < attributes.length; i++) {                
                var attribute = attributes[i];
                if (isAttributeBindingDefinition(attribute)) {
                    var source = findBindingSource(attribute);
                    if (source) {
                        var sourceProperty = getAttributeBindingSourceProperty(attribute);
                        var targetProperty = getAttributeBindingTargetProperty(attribute);
                        if (sourceProperty && targetProperty) {
                            var targetDomProperty = findElementProperty(element, targetProperty);
                            if (targetDomProperty) {
                                setElementBinding(element, targetDomProperty, source, sourceProperty);
                            }
                        }
                    }
                }
            }
        }
    };

    var createElementBindingsRecursive = function(element) {
        createElementBindings(element);
        for (var i = 0; i < element.childElementCount; i++) {
            createElementBindingsRecursive(element.children[i]);
        }
    };

    this.setElementBindingSource = function (element, source) {
        if (element) {
            if (source) {
                element[bindingSourcePropertyName] = source;
                createElementBindingsRecursive(element);
            } else {
                delete element[bindingSourcePropertyName];
            }
        }
    };

    /* Functions for handling changes in the DOM */

    window.addEventListener("load", function (e) {
        createElementBindingsRecursive(document.body);
    }.bind());

    /* Add an handler for the add/remove/change event of an Element node. The function should dispose
    bindings for the old tree and update bindings for the new one */

    /* Add an handler for changes to a JPF attribute */

})();