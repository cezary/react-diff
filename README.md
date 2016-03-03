# react-stylable-diff

Output differences between two strings in a stylable form.

Based on [react-diff](https://www.npmjs.com/package/react-diff). Uses the [diff](https://www.npmjs.com/package/diff) module

## Installation

```
npm install react-stylable-diff
```

## Usage

Pass text to compare as `props.inputA` and `props.inputB`:

```javascript
var React = require('react');
var Diff = require('react-stylable-diff');

var MyComponent = React.createClass({
  render: function() {
    return (
      <Diff inputA="worst" inputB="blurst"/>
    );
  }
});
```

You can also specify different values in `props.type`
to compare in different ways. Valid values are `'chars'`, `'words'`, `'wordsWit Space'`, `'lines'`, `'trimmedLines'`, `'sentences'`, `'css'`, and `'json'`. You can also use options (check it in [diff](https://github.com/kpdecker/jsdiff) module):


```javascript
var React = require('react');
var Diff = require('react-stylable-diff');

var MyComponent = React.createClass({
  render: function() {
    return (
      <Diff type="lines"
        options={ignoreWhitespace: true, newlineIsToken: true}
        inputA="It was the best of times\nIt was the worst of times"
        inputB="It was the best of times\n  It was the blurst of times\n"/>
    );
  }
});
```

### Styling

Outputs standard `<ins>` and `<del>` tags so you will at least
have the browser default styling for these. On my browser they
appear crossed-out or underlined.

You will probably want to add your own styles to look all fancy.

The output is wrapped in a div with class `'Difference'` so you can
attach all your style rules to that. You can override this class with
`props.className` if you like.

Here are some styles that might work:

```css
.Difference {
  font-family: monospace;
}

.Difference > del {
  background-color: rgb(255, 224, 224);
  text-decoration: none;
}

.Difference > ins {
  background-color: rgb(201, 238, 211);
  text-decoration: none;
}
```

## Example

```javascript
var React = require('react');
var Diff = require('react-stylable-diff');

var Component = React.createClass({
  render: function() {
    return (
      <Diff inputA="worst" inputB="blurst" type="chars" />
    );
  }
});
```

## License

MIT
