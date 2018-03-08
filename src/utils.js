export const getLastChild = node => {
  return node.children && node.children.length > 0
    ? getLastChild(node.children[node.children.length - 1])
    : node
}

export const getTagString = str => {
  const match = str.match(/\s+:([\w-\s]+:?)+:$/)
  return match ? match[0] : null
}

export const flattenArray = array => {
  const result = []
  array.forEach(subArr => {
    result.push(...subArr)
  })
  return result
}

export const getValuesFromNode = node => {
  if (node.value) {
    return [node.value]
  } else {
    return flattenArray(node.children.map(child => getValuesFromNode(child)))
  }
}

/**
 * generateIndex
 *
 * @param {String} prevIndex
 * @param {Number} diff level offset
 * @returns {String}
 *
 * @example
 * generateIndex('1.2.2', 1) => '1.2.2.1'
 * generateIndex('1.2.2', 0) => '1.2.3'
 * generateIndex('1.2.2', -1) => '1.3'
 * generateIndex('1.2.2', -2) => '2'
 * generateIndex('1.2.2', -5) => '2'
 */
const generateIndex = (prevIndex, diff) => {
  if (!prevIndex) return '1'

  if (diff > 0) return `${prevIndex}.1`

  let index
  if (diff === 0) {
    index = prevIndex.split('.').map(n => parseInt(n))
  } else {
    if (prevIndex.split('.').length + diff <= 0) {
      return [prevIndex[0]].map(n => parseInt(n) + 1).map(String)[0]
    }

    index = prevIndex
      .split('.')
      .slice(0, diff)
      .map(n => parseInt(n))
  }

  return index
    .slice(0, -1)
    .concat(index.slice(-1)[0] + 1)
    .map(String)
    .join('.')
}

const generateIndexWithPrefix = prefix => (prevIndex, diff) => {
  const index = prevIndex
    ? generateIndex(prevIndex.substring(prefix.length + 1), diff)
    : generateIndex(null, diff)
  return `${prefix}-${index}`
}

const Node = function(level, title, index, tags) {
  this.level = level
  this.title = title
  this.index = index
  this.tags = tags
  this.children = []
  this.parent = null

  this.setParentNode = node => (this.parent = node)
  this.getParentNode = () => this.parent
  this.addChild = node => {
    node.setParentNode(this)
    this.children.push(node)
  }
}

const removeProps = (obj, keys) => {
  if (typeof obj === 'object') {
    Object.getOwnPropertyNames(obj).forEach(key => {
      if (keys.indexOf(key) > -1) delete obj[key]
    })
  }
  if (obj.children) {
    obj.children.forEach(child => removeProps(child, keys))
  }
}

export const generateToc = prefix => headerNodes => {
  const root = new Node(0)
  let prevNode = root

  headerNodes.forEach(headerNode => {
    // 1 step: generate index and insert into node (side-effect)
    // Note: index is used as id attr in domEl, node comes from org parser
    const { level } = headerNode
    let title = getValuesFromNode(headerNode).join('')
    let tags
    const tagString = getTagString(title)
    if (tagString) {
      title = title.replace(tagString, '')
      tags = tagString.split(':').filter(t => t.trim())
    }

    const diff = level - prevNode.level
    const index = prefix
      ? generateIndexWithPrefix(prefix)(prevNode.index, diff)
      : generateIndex(prevNode.index, diff, prefix)
    headerNode.index = index

    // 2 step: construct a header tree for toc component
    const newNode = new Node(level, title, index, tags)

    if (diff > 0) {
      prevNode.addChild(newNode)
    } else {
      let parentNode = prevNode.getParentNode()

      for (let i = 0; i > diff; i--) {
        if (!parentNode.getParentNode()) {
          break
        }

        parentNode = parentNode.getParentNode()
      }
      parentNode.addChild(newNode)
    }
    prevNode = newNode
  })

  // TypeError: Converting circular structure to JSON will be thrown if parent
  // property not removed when doing server side rendering (not sure why)
  removeProps(root, ['parent'])
  return root.children
}
