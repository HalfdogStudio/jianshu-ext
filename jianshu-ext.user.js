// ==UserScript==
// @name        jianshu-ext
// @namespace   jianshu-ext-workaround@reverland.org
// @description jianshu mathjax and toc workaround
// @include     http://www.jianshu.com/*
// @version     0.9
// @grant       none
// ==/UserScript==
//
// When you write a GreaseMonkey script. You should always check if the element has been into DOM before using it!! IMPORTANT!

// <script type="text/javascript" src="path-to-MathJax/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
// TODO: I can't use GM_addStyle for grant other than none will force the script run in a sandbox mode, where it cant cat window varialbles 

addGlobalStyle("                                                            \
            .jianshu-toc, .jianshu-toc ul, .jianshu-toc li { \
              margin: 0 !important;                                                 \
              margin-left: 0.5em !important;                                          \
              padding: 0 !important;                                                \
              list-style: none !important;                                          \
              cursor: pointer;\
            }                                                            \
            .jianshu-toc li {\
              line-height: 1.5em !important;\
              word-wrap: break-word;\
              text-align: left !important;\
            }\
            .jianshu-toc-hidden {\
              display: none;\
            }\
            .jianshu-toc {\
              outline: 1px dotted lightblue;\
              opacity： 0.8;\
              background: white;\
              position: fixed;\
              right: 3vw;\
              width: 250px;\
              top: 15vh;\
              font-size: 0.8em !important;\
              word-wrap: break-word;\
            }\
            ");

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { 
      return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

var mathjax = document.createElement('script');
mathjax.type = "text/javascript";
mathjax.src = "https://cdn.bootcss.com/mathjax/2.5.3/MathJax.js?config=TeX-AMS-MML_HTMLorMML";
var mathjaxConfig = document.createElement('script');
mathjaxConfig.type = "text/x-mathjax-config";
mathjaxConfig.textContent = "MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'] ], processEscapes: true}});";
document.head.appendChild(mathjaxConfig);
document.head.appendChild(mathjax);


function generateTOC() {
  var tocContainer = document.createElement('div');
  var toc = document.createElement('ul');
  tocContainer.classList.toggle("jianshu-toc");
  toc.classList.toggle("jianshu-toc-hidden");
  var content = $('.show-content')[0];
  //console.log(content);
  var title = document.createElement("a");
  title.textContent = "展开目录";
  title.id = "jianshu-toc-toggle";
  //console.log(title);
  tocContainer.appendChild(title);
  tocContainer.appendChild(toc);
  loop();
  // check nodes into DOM
  function loop() {
    var firstChild = content.children[0];
    //console.log(firstChild);
    if (firstChild) {
      var curEl;
      var h2n = 0;
      var h3n = 0;
      var h4n = 0;
      var h2, h3, h4;
      //console.log("[DEBUG] loop")
      curEl = firstChild.nextElementSibling;
      do {
        //console.log(curEl);
        if (curEl.tagName == "H2") {
          h3n = 0;
          h2 = document.createElement("li") 
          h2n++;
          curEl.id = "jianshu-ext-heading-id-" + h2n; 
          anchor = document.createElement('a');
          anchor.href = "#" + curEl.id;
          anchor.textContent = curEl.textContent;
          h2.appendChild(anchor);
          toc.appendChild(h2);
        } else if (curEl.tagName == "H3") {
          h4n = 0
          h3 = document.createElement("li") 
          h3n++;
          curEl.id = "jianshu-ext-heading-id-" + h2n + '-' + h3n; 
          anchor = document.createElement('a');
          anchor.href = "#" + curEl.id;
          anchor.textContent = curEl.textContent;
          h3.appendChild(anchor);
          if (h2){
            var ul = document.createElement('ul');
            ul.appendChild(h3);
            h2.appendChild(ul);
          } else {
            toc.appendChild(h3);
          }
        } else if (curEl.tagName == "H4") {
          h4 = document.createElement("li") 
          h4n++;
          curEl.id = "jianshu-ext-heading-id-" + h2n + '-' + h3n + '-' + h4n; 
          anchor = document.createElement('a');
          anchor.href = "#" + curEl.id;
          anchor.textContent = curEl.textContent;
          h4.appendChild(anchor);
          if (h3){
            var ul = document.createElement('ul');
            ul.appendChild(h4);
            h3.appendChild(ul);
          } else if (h2){
            var ul = document.createElement('ul');
            ul.appendChild(h4);
            h2.appendChild(ul);
          } else {
            toc.appendChild(h4);
          }
        }
        curEl = curEl.nextElementSibling;
      } while (curEl.nextElementSibling); 
      //console.log(toc);
    } else {
      setTimeout(loop, 1000);
    }
  }
  return tocContainer.outerHTML;
}

function changeTOC() {
  var toc = generateTOC();
  var preview = document.querySelector('.preview');
  preview.innerHTML = preview.innerHTML.replace('<p>[toc]</p>', toc);
}

// create an observer instance
var observer = new MutationObserver(function(mutations) {
  // update math
  MathJax.Hub.Typeset();
  // update toc
  //changeTOC();
});

// configuration of the observer:
var config = { attributes: true, childList: true, characterData: true };

// check if .preview has into DOM
var loop = function() {
  var el = document.querySelector('.preview');
  if (el) {
    observer.observe(el, config);
    var toc = generateTOC();
    el.innerHTML = el.innerHTML.replace('<p>[toc]</p>', toc)
    var jianshuTOCToggle = document.querySelector('#jianshu-toc-toggle')
    if (jianshuTOCToggle) {
      jianshuTOCToggle.addEventListener('click', function(e) {
        var toc = document.querySelector('.jianshu-toc > ul');
        if (toc.classList.toggle("jianshu-toc-hidden")) {
          this.textContent = "展开目录"
        } else {
          this.textContent = "收起目录"
        }
      });
    }
  } else {
    // not there yet, retry again after a short while
    setTimeout(loop, 100);
  }
};
loop();
