import React, { Component } from 'react'

import OrgViewer from '../src/OrgViewer'
import orgfile from './orgfile'

import 'github-markdown-css'

class App extends Component {
  state = {
    source: orgfile,
    showEditor: true,
    toc: [],
  }

  handleChange = text => {
    this.setState(() => ({ source: text }))
  }

  toggleEditor = () => {
    this.setState(prevState => ({ showEditor: !prevState.showEditor }))
  }

  setTableOfContents = nodes => {
    this.setState(() => ({ toc: nodes }))
  }

  renderLink = node => {
    return (
      <li key={node.title + node.index}>
        <a href={`#${node.index}`}>{node.title}</a>
        {node.children.length > 0 && (
          <ul>{node.children.map(this.renderLink)}</ul>
        )}
      </li>
    )
  }

  render() {
    const { source, showEditor, toc } = this.state

    return (
      <div className="container">
        <div className="toc">
          <ul>{toc.map(this.renderLink)}</ul>
        </div>

        <div className="content">
          <OrgViewer
            source={source}
            className="markdown-body"
            tocCallback={this.setTableOfContents}
          />
        </div>

        <div className="editor">
          <textarea
            value={source}
            style={{ visibility: showEditor ? 'visible' : 'hidden' }}
            onChange={e => this.handleChange(e.target.value)}
          />
          <button className="btn" onClick={() => this.toggleEditor()}>
            Toggle Editor
          </button>
        </div>
      </div>
    )
  }
}

export default App
