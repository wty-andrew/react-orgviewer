# react-orgviewer
 
A react component that renders org format
-----

## Demo

see [example](https://wty-andrew.github.io/react-orgviewer/)


## Installation

```
npm install react-orgviewer
```


## Basic usage

```js
import React from 'react'
import ReactDOM from 'react-dom'
import OrgViewer from 'react-orgviewer'

const source = '* Headline\n  - item 1\n  - item 2\n  - item 3\n'

ReactDOM.render(
  <OrgViewer source={source} />,
  document.getElementById('root')
)
```
