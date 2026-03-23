// URLSearchParams polyfill
(function (w) {
    w.URLSearchParams =
        w.URLSearchParams ||
        function(searchString) {
            this.searchString = searchString;
            this.get = function(name) {
                const results = new RegExp("[?&]" + name + "=([^&#]*)").exec(
                    this.searchString
                );
                if (results == null) {
                    return null;
                } else {
                    return decodeURI(results[1]) || "0";
                }
            };
        };
})(window);

const params = new URLSearchParams(location.search);

let codeElt = document.getElementsByClassName("code");
let titleElt = document.getElementById("title");
let descriptionElt = document.getElementById("description");

const ua = window.navigator.userAgent;
const userLang = navigator.language || navigator.userLanguage;
const content = locals[ /* userLang.split( "-" )[ 0 ] */ 'fr' ][ params.get("q") ]

if (content) {
  
    // Check if browser is not Internet Explorer then redirect to WV app
    if( params.get("q") == "ie" ){
        if (ua.search(/(MSIE|Trident|Edge)/) === -1) {
          const url = window.location.origin;
          window.location.assign(url)
        }
    }
      
    // Set HTML content in DOM elements
    const code = content.code.toString().split('')
    for (let i = 0; i < code.length; i++) {
      codeElt[i].textContent = code[i];
    }
    titleElt.textContent = content.title
    descriptionElt.textContent = content.description
}
