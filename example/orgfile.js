export default `
org.js

org.js is a parser and converter for org-mode ([[http://orgmode.org/]]) notation written in JavaScript.

* Installation

** Node.js

Install ~org-js~ module via ~npm~.

#+BEGIN_EXAMPLE
npm install org
#+END_EXAMPLE

Then, in your application, load installed module as follows.

#+BEGIN_SRC 
var Org = require("org");
#+END_SRC

** Web Browser

Just place ~org.js~ in your website and load it.

#+BEGIN_SRC html
<script type="text/javascript" src="org.js"></script>
#+END_SRC

* Usage

** Org -> HTML conversion

#+BEGIN_SRC javascript
var orgCode = "some org notation text";
var orgParser = new Org.Parser();
var orgDocument = orgParser.parse(orgCode);
var orgHTMLDocument = orgDocument.convert(Org.ConverterHTML, {
  headerOffset: 1,
  exportFromLineNumber: false,
  suppressSubScriptHandling: false,
  suppressAutoLink: false
});

console.dir(orgHTMLDocument); // => { title, contentHTML, tocHTML, toc }
console.log(orgHTMLDocument.toString()) // => Rendered HTML
#+END_SRC

* Supported notations

** Blocks

*** Table

|-------+--------+------------|
|       | Symbol | Author     |
|-------+--------+------------|
| Emacs | ~M-x~  | _RMS_      |
|-------+--------+------------|
| Vi    | ~:~    | _Bill Joy_ |
|-------+--------+------------|

*** List

**** Ordered List

1. Orange
2. Banana
3. Apple

**** Unordered List

- Foo
- Bar
- Baz

**** Definition List

- vim :: Vi IMproved, a programmers text editor
- ed :: Line-oriented text editor

*** Rule

-----

*** Directive

**** ~BEGIN_QUOTE~ and ~END_QUOTE~

#+BEGIN_QUOTE
To be or not to be, that is the question.
#+END_QUOTE

**** ~BEGIN_EXAMPLE~ and ~END_EXAMPLE~

#+BEGIN_EXAMPLE
npm install org
#+END_EXAMPLE

**** ~BEGIN_SRC~ and ~END_SRC~

#+BEGIN_SRC javascript
var Org = require("org");
var orgParser = new Org.Parser();
#+END_SRC

** Inline elements

*** Bold

GNU is *Not* Unix.

*** Italic

GNU is /Not/ Unix.

*** Code

Try =cat= or ~tac~.

*** Dashed

+Deleted+

*** Subscript

Sub_{script}. a_{1}, a_{2}, and a_{3}.

** Handling TODO

** TODO Implement todo attributes

Support attributes like ~SCHEDULED:~.

** DONE Implement todo heading

Parse ~TODO/DONE~ in headers.

* Directive support

- ~options:~
- ~title:~
- ~author:~
- ~email:~
`
