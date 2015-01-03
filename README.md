# react-diff

Highlights differences between two strings, uses the [diff](https://www.npmjs.com/package/diff) module

## Installation

```
npm install react-diff
```

## Demo

http://cezary.github.io/react-diff/

## Example

```javascript
var React = require('react');
var Diff = require('react-diff');

var Component = React.createClass({
  render: function() {
    return (
      <Diff inputA="gogol" inputB="google" type="chars" />
    );
  }
});
```

## License

MIT
