import {marked} from "marked";
import hljs from "highlight.js";

marked.setOptions({
  renderer: new marked.Renderer(),
  extensions:{
    renderers:{
      ["code"]:function(code){
        if(!code.lang || code.lang === ''){
          code.lang = 'c++'
        }
        return "<pre>" +
          "<code class='language-"+code.lang+" hljs language-c' data-highlighted='yes'>"
          +hljs.highlight(code.text,{language:code.lang}).value
          +"</code></pre>"
      }
    },
    childTokens:{

    }
  }
});

export const markdownToHtml = (txt) =>{
  return marked(txt);
}
