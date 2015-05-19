function List(element) {

    var ownerElement = element;
    var itemsContainer = document.createElement("div");
    itemsContainer.style.height = "200px";
    itemsContainer.style.position = "relative"; //allows the items container to scroll within the parent owner element
    ownerElement.appendChild(itemsContainer);
    var items = null;
    var firstRenderedItem = null;
    var lastRenderedItem = null;

    var itemTemplate = function(item, index) {
        var itemElement = document.createElement("div");
        itemElement.style.width = "150px";
        itemElement.style.height = "200px";
        itemElement.style.background = "yellow";
        itemElement.style.margin = "5px";
        itemElement.style.display = "inline-block";
        itemElement.style.textAlign = "center";
        itemElement.innerText = "Item " + index;
        return itemElement;
    };

    function render(fromIndex) {
        if (!fromIndex) {
            fromIndex = 0;
        }
        if (fromIndex >= this.itemsCount) {
            fromIndex = items.count - 1;
        }
        if (fromIndex < 0) {
            fromIndex = 0;
        }
        while (itemsContainer.hasChildNodes()) {
            itemsContainer.removeChild(itemsContainer.firstChild);
        }
        var viewportWidth = window.getComputedStyle(itemsContainer).width;
        if (items) {
            for (var i = fromIndex; i < items.length; i++) {
                var itemElement = itemTemplate(items[i], i);
                itemsContainer.appendChild(itemElement);
            }
        }
    };

    this.__defineGetter__("items", function () {
        return items;
    });

    this.__defineSetter__("items", function (val) {
        items = val;
        render();
    });

    this.__defineGetter__("hasItems", function () {
        return (items && items.length > 0);
    });

    this.__defineGetter__("itemsCount", function () {
        if (this.hasItems) {
            return items.length;
        }
        return 0;
    });

    this.__defineGetter__("itemTemplate", function () {
        return itemTemplate;
    });

    this.__defineSetter__("itemTemplate", function (val) {
        itemTemplate = val;
        render();
    });

    function calculateSequenceLength(index) {
        
    };

    this.scrollTo = function (index) {
        render(index);
        //if (index >= 0 && index < this.itemsCount) {
        //    itemsContainer.style.left = "-155px";
        //}
    };
};