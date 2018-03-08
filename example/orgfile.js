export default `
* Header

** Header with Tag   :tag1:tag2:

*** Smaller Header


* Inline elements
*Bold*, /Italic/, +Deleted+, _underline_, =verbatim= or ~code~

** Quote
#+BEGIN_QUOTE
Quoted text.
#+END_QUOTE


* Link
[[https://github.com/wty-andrew/react-orgviewer][react-orgviewer]]


* Horizontal Rule
-----

* Source Code
#+BEGIN_SRC javascript
const greet = () => console.log('Hello World')
#+END_SRC

#+BEGIN_SRC python
def greet():
  print('Hello World')
#+END_SRC


* Literal Example
#+BEGIN_EXAMPLE
Some text here.
#+END_EXAMPLE

* Lists
** Ordered List
1. Item
2. Item
3. Item

** Unordered List
- Item
- Item
- Item

** Definition List
- recursion :: See recursion

* Table
| Name  | Age |
|-------+-----|
| John  |  17 |
| Marry |  21 |
`
