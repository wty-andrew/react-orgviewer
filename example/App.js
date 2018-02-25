import React, { Component } from 'react'

import OrgViewer from '../src/OrgViewer'
import orgfile from './orgfile'

import 'github-markdown-css'

class App extends Component {
  render() {
    return (
      <div>
        <OrgViewer
          source={orgfile}
          className="markdown-body"
          tocCallback={nodes => console.log(nodes)}
        />
      </div>
    )
  }
}

export default App
