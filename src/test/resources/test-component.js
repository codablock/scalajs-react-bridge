/*
A generic component to facilitate testing.

This component allows passing any properties (scalar, array, map, and functions) and
creates children elements for each of them in such a way that tests can do simple
assertions to ensure that the bridging logic works as expected.

The created component nests one <span> child per property with the id set to the property
name and the text content set to the value encoded in the following manner:

- Scalar: string version of the value.
  Example: {name: "foo"} -> <span id="name">foo</span>
- Array: comma-separated list of encoded elements
  Example: {info: ["foo",5]} -> <span id="info">[foo,5]<span>
           {info: ["foo", [5,6]]} -> <span id="info">[foo,[5,6]]<span>
- Map: comma-separated list of encoded elements in the key->value format
  Example: {coordinate: {x: 5, y:6}} -> <span id="coordinate">{x->5,y->6}<span>

For functions, an `onClick` handler is installed, which calls the function set as the
property with array value set in TestComponent.eventTestData as individual parameters
to the function. For example, to test a (String,Int,String) => Unit function, you could set
TestComponent.eventTestData to, say, ["foo",5,"bar"]. Now when test simulates a click, the
TestComponent will invoke the function set as the property f("foo", 5, "bar").
*/

TestComponent = React.createClass({
    render: function () {
        var props = this.props;

        var propKeys = Object.keys(props).filter(function(key) {
            return !(key == "children" || key == "key" || key == "ref");
        });

        var propElems = propKeys.map(function(key) {
            var value = props[key];
            if (typeof(value) === 'function') {
                return React.DOM.span({id: key, key: key, onClick: TestComponent.testFunction(key, value)})
            } else {
                return React.DOM.span({id: key, key: key}, TestComponent.toTestString(props[key]))
            }
        });

        return React.DOM.div(null, propElems);
    }
});

TestComponent.toTestString = function(value) {
    if (Array.isArray(value)) {
        var encodedArray = value.map(function(element) {
            return TestComponent.toTestString(element);
        }).join(',')
        return '[' + encodedArray +']';
    } else if (typeof(value) === "object") {
        var keys = Object.keys(value)
        var strings = keys.map(function(key) {
            var v = value[key];
            return key + "->" + TestComponent.toTestString(v);
        });
        return '{' + strings.join(',') + '}';
    } else {
        return value;
    }
}

// A way to pass back data on the next click
TestComponent.eventTestData = [];

TestComponent.testFunction = function(key, f) {
    return function(e) {
        f.apply(this, TestComponent.eventTestData)
    }
}
