/* eslint-disable react/prop-types, react/display-name */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import org from 'org'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneLight } from 'react-syntax-highlighter/styles/hljs'
import shortid from 'shortid'

import { getLastChild, getTagString, generateToc } from './utils'

const randomId = () => shortid.generate()
const parser = new org.Parser()

const renderCodeBlock = (lang, content) => (
  <SyntaxHighlighter
    language={lang}
    style={atomOneLight}
    className={lang ? lang : ''}
  >
    {content}
  </SyntaxHighlighter>
)

const defaultRenderOptions = {
  renderSrc: {},
  renderPreformatted: {},
  renderLink: (src, renderElement) =>
    renderElement('a')({ href: src, target: '_blank' }),
  renderTag: {},
  anchorPrefix: 'section',
}

export class OrgViewer extends Component {
  static propTypes = {
    source: PropTypes.string.isRequired,
    tocCallback: PropTypes.func,
    renderOptions: PropTypes.object,
  }

  static defaultProps = {
    renderOptions: {},
  }

  state = {
    nodes: [],
    opts: { ...defaultRenderOptions, ...this.props.renderOptions },
  }

  componentWillMount() {
    this.parseSource(this.props.source)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.source !== this.props.source) {
      this.parseSource(nextProps.source)
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.source !== this.props.source
  }

  parseSource = source => {
    const { opts: { anchorPrefix } } = this.state
    const { tocCallback } = this.props
    const orgDocument = parser.parse(source || '')
    const { nodes } = orgDocument

    if (typeof tocCallback === 'function') {
      const headerNodes = nodes.filter(node => node.type === 'header')
      // side effect, an "index" property is inserted into each header node
      const headers = generateToc(anchorPrefix)(headerNodes)
      tocCallback(headers)
    }
    this.setState({ nodes })
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const { source, tocCallback, renderOptions, ...props } = this.props

    return <div {...props}>{this.state.nodes.map(this.renderNode)}</div>
  }

  renderElement = Tag => (children = [], props = {}) => {
    let childNodes
    if (children.length === 1 && children[0].type === 'inlineContainer') {
      // to avoid addtional tag add by renderInlineContainer
      childNodes = children[0].children.map(this.renderNode)
    } else {
      childNodes = children.map(this.renderNode)
    }

    return (
      <Tag key={randomId()} {...props}>
        {childNodes}
      </Tag>
    )
  }

  renderInlineContainer = ({ children }) => {
    return children.length > 1
      ? this.renderElement('span')(children)
      : this.renderNode(children[0])
  }

  renderDirective = ({ children, directiveName, directiveRawValue }) => {
    const { opts } = this.state

    switch (directiveName) {
      case 'quote':
        return this.renderElement('blockquote')(children)

      case 'example':
        return this.renderElement('pre')(children)

      case 'src': {
        const { children: render = renderCodeBlock, ...props } = opts.renderSrc

        return (
          <div key={randomId()} {...props}>
            {render(directiveRawValue, children[0].value)}
          </div>
        )
      }
      // TODO: add custom directives here, ex: title, date, etc

      default:
        return null
    }
  }

  renderPreformatted = ({ children }) => {
    const {
      children: render = renderCodeBlock,
      ...props
    } = this.state.opts.renderPreformatted

    return (
      <div key={randomId()} {...props}>
        {render(undefined, children[0].value)}
      </div>
    )
  }

  renderLink = ({ src, children }) => {
    const renderElementWithChildren = tag => props =>
      this.renderElement(tag)(children, props)
    return this.state.opts.renderLink(src, renderElementWithChildren)
  }

  renderHeader = node => {
    const { level, children, index } = node

    const headerTag = level > 5 ? 'h6' : `h${level}`
    const props = {}
    if (index) {
      props.id = index
    }

    const lastChild = getLastChild(node)
    if (lastChild.type !== 'text')
      return this.renderElement(headerTag)(children, props)

    const tagString = getTagString(lastChild.value)
    if (!tagString) return this.renderElement(headerTag)(children, props)

    lastChild.value = lastChild.value.replace(tagString, '')
    const tags = tagString
      .split(':')
      .filter(t => t.trim())
      .map(t => ({ type: 'tag', value: t }))

    const childrenWithTags = [...children].concat(tags)
    return this.renderElement(headerTag)(childrenWithTags, props)
  }

  renderTag = ({ value }) => (
    <span
      key={randomId()}
      style={{
        backgroundColor: '#eee',
        border: '1.5px solid #aaa',
        borderRadius: '4px',
        float: 'right',
        fontSize: '1rem',
        fontWeight: 'normal',
        marginLeft: '10px',
        padding: '0 10px',
      }}
      {...this.state.opts.renderTag}
    >
      {value}
    </span>
  )

  renderTable = ({ children }) => {
    return (
      <table key={randomId()}>{this.renderElement('tbody')(children)}</table>
    )
  }

  renderDefinitionList = ({ children }) => {
    const childNodes = []
    children.forEach(child => {
      let termValue
      try {
        termValue = child.term[0].children[0].value
      } catch (err) {
        return
      }

      // in case the term description is not provided
      if (termValue === '???') {
        childNodes.push(this.renderElement('dt')(child.children))
        return
      }

      childNodes.push(this.renderElement('dt')(child.term))
      childNodes.push(this.renderElement('dd')(child.children))
    })

    return <dl key={randomId()}>{childNodes}</dl>
  }

  renderNode = node => {
    switch (node.type) {
      case 'text':
        return node.value

      case 'inlineContainer':
        return this.renderInlineContainer(node)

      case 'header':
        return this.renderHeader(node)

      case 'link':
        return this.renderLink(node)

      case 'paragraph':
        return this.renderElement('p')(node.children)

      case 'bold':
        return this.renderElement('strong')(node.children)

      case 'italic':
        return this.renderElement('em')(node.children)

      case 'dashed':
        return this.renderElement('del')(node.children)

      case 'underline':
        return this.renderElement('ins')(node.children)

      case 'code':
        return this.renderElement('code')(node.children)

      case 'directive':
        return this.renderDirective(node)

      case 'table':
        return this.renderTable(node)

      case 'tableRow':
        return this.renderElement('tr')(node.children)

      case 'tableCell':
        return this.renderElement('td')(node.children)

      case 'orderedList':
        return this.renderElement('ol')(node.children)

      case 'unorderedList':
        return this.renderElement('ul')(node.children)

      case 'listElement':
        return this.renderElement('li')(node.children)

      case 'definitionList':
        return this.renderDefinitionList(node)

      case 'horizontalRule':
        return <hr key={randomId()} />

      case 'preformatted':
        return this.renderPreformatted(node)

      // added by the command "org-set-tags" in orgmode, appears at the end of
      // headers, :tag1:tag2:tag3:
      case 'tag':
        return this.renderTag(node)

      default:
        return null
    }
  }
}

export default OrgViewer
