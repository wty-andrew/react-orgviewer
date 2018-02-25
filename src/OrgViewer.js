/* eslint-disable react/prop-types, react/display-name */
import React from 'react'
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
  headerTag: {},
}

const OrgViewer = ({ source, tocCallback, renderOptions = {}, ...props }) => {
  const opts = { ...defaultRenderOptions, ...renderOptions }
  const orgDocument = parser.parse(source)

  if (typeof tocCallback === 'function') {
    const headerNodes = orgDocument.nodes.filter(node => node.type === 'header')
    // side effect, an "index" property is inserted into each header node
    const headers = generateToc(headerNodes)
    tocCallback(headers)
  }

  const renderElement = Tag => (children = [], props = {}) => {
    let childNodes
    if (children.length === 1 && children[0].type === 'inlineContainer') {
      // to avoid addtional tag add by renderInlineContainer
      childNodes = children[0].children.map(renderNode)
    } else {
      childNodes = children.map(renderNode)
    }

    return (
      <Tag key={randomId()} {...props}>
        {childNodes}
      </Tag>
    )
  }

  const renderInlineContainer = ({ children }) => {
    return children.length > 1
      ? renderElement('span')(children)
      : renderNode(children[0])
  }

  const renderDirective = ({ children, directiveName, directiveRawValue }) => {
    switch (directiveName) {
      case 'quote':
        return renderElement('blockquote')(children)

      case 'example':
        return renderElement('pre')(children)

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

  const renderPreformatted = ({ children }) => {
    const {
      children: render = renderCodeBlock,
      ...props
    } = opts.renderPreformatted

    return (
      <div key={randomId()} {...props}>
        {render(undefined, children[0].value)}
      </div>
    )
  }

  const renderLink = ({ src, children }) => {
    const renderElementWithChildren = tag => props =>
      renderElement(tag)(children, props)
    return opts.renderLink(src, renderElementWithChildren)
  }

  const renderHeader = (node, prefix = 'section') => {
    const { level, children, index } = node

    const headerTag = level > 5 ? 'h6' : `h${level}`
    const props = {}
    if (index) {
      props.id = `${prefix}-${index}`
    }

    const lastChild = getLastChild(node)
    if (lastChild.type !== 'text')
      return renderElement(headerTag)(children, props)

    const tagString = getTagString(lastChild.value)
    if (!tagString) return renderElement(headerTag)(children, props)

    lastChild.value = lastChild.value.replace(tagString, '')
    const tags = tagString
      .split(':')
      .filter(t => t.trim())
      .map(t => ({ type: 'tag', value: t }))

    const childrenWithTags = [...children].concat(tags)
    return renderElement(headerTag)(childrenWithTags, props)
  }

  const renderTag = ({ value }) => (
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
      {...opts.headerTag}
    >
      {value}
    </span>
  )

  const renderTable = ({ children }) => {
    return <table key={randomId()}>{renderElement('tbody')(children)}</table>
  }

  const renderDefinitionList = ({ children }) => {
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
        childNodes.push(renderElement('dt')(child.children))
        return
      }

      childNodes.push(renderElement('dt')(child.term))
      childNodes.push(renderElement('dd')(child.children))
    })

    return <dl key={randomId()}>{childNodes}</dl>
  }

  const renderNode = node => {
    switch (node.type) {
      case 'text':
        return node.value

      case 'inlineContainer':
        return renderInlineContainer(node)

      case 'header':
        return renderHeader(node)

      case 'link':
        return renderLink(node)

      case 'paragraph':
        return renderElement('p')(node.children)

      case 'bold':
        return renderElement('strong')(node.children)

      case 'italic':
        return renderElement('em')(node.children)

      case 'dashed':
        return renderElement('del')(node.children)

      case 'underline':
        return renderElement('ins')(node.children)

      case 'code':
        return renderElement('code')(node.children)

      case 'directive':
        return renderDirective(node)

      case 'table':
        return renderTable(node)

      case 'tableRow':
        return renderElement('tr')(node.children)

      case 'tableCell':
        return renderElement('td')(node.children)

      case 'orderedList':
        return renderElement('ol')(node.children)

      case 'unorderedList':
        return renderElement('ul')(node.children)

      case 'listElement':
        return renderElement('li')(node.children)

      case 'definitionList':
        return renderDefinitionList(node)

      case 'horizontalRule':
        return <hr key={randomId()} />

      case 'preformatted':
        return renderPreformatted(node)

      // added by the command "org-set-tags" in orgmode, appears at the end of
      // headers, :tag1:tag2:tag3:
      case 'tag':
        return renderTag(node)

      default:
        return null
    }
  }

  return <div {...props}>{orgDocument.nodes.map(renderNode)}</div>
}

OrgViewer.propTypes = {
  source: PropTypes.string.isRequired,
  tocCallback: PropTypes.func,
  renderOptions: PropTypes.object,
}

export default OrgViewer
