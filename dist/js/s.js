(function(d,G,I){var g="<section class=card><div class=text>",v="drag",L="edit",K="pick",A="mark",y=".card",R=".text",m=".tag",E="menu a",f=":has(."+A+")",t=".",M="click",u="dblclick",p="hover",U="keydown",J="mousedown",i="mouseup",N="mousemove",r="contentEditable",Q="value",H="top",w="left",B="board",z=!0+"",S=!1,n=["white","green","blue","red","orange","yellow"],c=new RegExp("\\b("+n.join(")|(")+")\\b"),x=/^mouse(enter|over)/i,k={r:function(){if(confirm("Are you sure you want to clear all saved data?")){I.removeItem(B);location.reload()}},e:function(V){V[u]()},c:function(W){var V=W.color();if(V){W.rC(V);V=n.indexOf(V);V=n[++V<6?V:0];W.aC(V);q()}},d:function(V){if(confirm("Are you sure you want to delete this card?")){V.fadeOut(function(){V.remove();q()})}},b:function(){d.execCommand("bold",S,"")},i:function(){d.execCommand("italic",S,"")},h:function(){j("p","h2")},p:function(){j("h2","p")}},a=["Need a new card? Just grab it from a deck on the left","Move cards around to arrange them in any way you want: todo list? kanban board?","Double-click card to edit","You can use hotkeys when editing text, just check <i>Ctrl+I</i> or <b>Ctrl+B</b>!","Every change is immediately saved in your browser","You've already noticed #tags, didn't you?","<i>Ctrl+H</i> makes a</p><h2>Heading</h2><p>and <i>Ctrl+G</i> turns text into a paragraph",0,"It's not a tip... I just have some spare bytes below 10k limit ;)"],s=G(d),F=G(d.body),O,b,C,o,l=-1,T;a[24]="Oh, I forgot to tell you about HEX color tags #F5A";a[42]="Answer to life, the universe and everything is <b>42</b>";function e(){return a[++l]?"<p>"+a[l]+" #tip</p>":""}function j(X,W){if(G.browser.mozilla){var V=G(getSelection().anchorNode);if(V.is(R)){V=V.$(X).eq(0)}else{V=V.up(R+" "+X)}V.replaceWith(function(Z,Y){return"<"+W+">"+Y+"</"+W+">"})}else{d.execCommand("formatblock",S,"<"+W+">")}}function D(V){return O.$(m).filter(function(){return G(this).text().toLowerCase()==V.toLowerCase()})}function q(){var V=[],W;O.$(y).each(function(){W=G(this);V.push(G.extend(W.offset(),{type:W.color(),text:W.data(Q)||""}))});I.setItem(B,JSON.stringify(V))}function h(W){var V=G("<menu>");G.each(W,function(X,Y){V.append("<a href=# class="+Y[0]+" title='"+Y[1]+"'/>")});return V.dlg(E,M,function(X){k[this.className](G(this).up(y));return S})}function P(V){var X=O.$(y+t+L).eq(0),W;o.detach();F.add(X.drop()).rC(L);W=V?X.data(Q):X.$(R).html();X.saveText(W).$(R).attr(r,S).blur();s.unbind(U);q()}G.extend(k,{66:k.b,73:k.i,72:k.h,71:k.p,83:P});G.easing.swing=function(W,X,V,aa,Z,Y){return aa*((X=X/Z-1)*X*(((Y=1.70158)+1)*X+Y)+1)+V};G.each([K,"drop"],function(W,V){var X=V==K;function Y(Z,aa){return parseInt(aa,10)+(X?-5:5)}G.fn[V]=function(){return this.each(function(Z){Z=G(this);if(Z.hC(K)!=X){Z.tC(K,X).css(H,Y).css(w,Y)}})}});G.fn.extend({color:function(V){V=this[0].className.match(c);return V?V[0]:""},saveText:function(W){var V=W.match(/(\s|^|>)(#[a-f0-9]{3}([a-f0-9]{3})?)\b/i);V=V?V[2]:"";this.up(y).css({backgroundColor:V,borderColor:V}).data(Q,W).$(R).html(W.replace(/(\s|^|>)(#\w*)(\b)/gi,"$1<span class=tag>$2</span>$3").replace(/&nbsp;/g," ").replace(/(\s|^|>)(https?\:\/\/[^\s<>]+)/g,"$1<a href=$2>$2</a>"));return this},move:function(V){return this.animate({left:V})},dlg:G.fn.delegate,$:G.fn.find,up:G.fn.closest,to:G.fn.appendTo,aC:G.fn.addClass,rC:G.fn.removeClass,tC:G.fn.toggleClass,hC:G.fn.hasClass});G(function(){T=I.getItem(B);T=T?JSON.parse(T):[{type:n[0],text:"<p><i>Welcome to</i></p><h2>Taskboard 10k</h2>",top:40,left:70},{type:n[5],text:e(),top:120,left:80},{type:n[1],text:"<p><b>Have fun!</b></p>",top:180,left:90}];O=G("<section id=board>").to(F);G.each(T,function(W,V){G(g).aC(V.type||n[5]).css(V).saveText(V.text).to(O)});C=h([["e","Edit"],["c","Change color"],["d","Delete"]]);o=h([["b","Bold (Ctrl+B)"],["i","Italic (Ctrl+I)"],["h","Heading (Ctrl+H)"],["p","Paragraph (Ctrl+R)"]]).aC(L);h([["r","Clear board"]]).to(F);b=G("<aside id=deck>").to(F).dlg(y,p,function(V){if(!F.hC(L)&&!F.hC(A)){G(this).stop().move(x.test(V.type)?20:0)}}).dlg(y,J,function(V){if(!F.hC(L)&&!F.hC(A)){var W=G(this);W.clone().pick().aC(v).css(W.offset()).saveText(e()).to(O).trigger(V);W.hide();setTimeout(function(){W.css(w,-40).show().move(0)},1000)}});G.each(n,function(W,V){W=6-W;G(g).to(b).aC(V).css(H,W*30).css(w,-40).delay(W*100).move(0)});O.dlg(y,J,function(V){if(!F.hC(L)&&!G(V.target).is(m+","+E)){var X=G(this).to(O),W=X.offset();s.bind(N,function(Y){X.pick().aC(v).css(w,W[w]+Y.pageX-V.pageX).css(H,W[H]+Y.pageY-V.pageY)});return S}}).dlg(y,i,function(V){V=G(this);s.unbind(N);if(V.hC(v)){V.rC(v);if(!V.hC(A)){V.drop()}q()}}).dlg(y,u,function(W){if(!G(W.target).is(m+","+E)){var Y=G(this),V=Y.$(R),X=Y.data(Q);if(V[0][r]!=z){s[M]();F.add(Y.pick().rC(A)).aC(L);o.to(Y);V.html(X).attr(r,z).focus();s.bind(U,function(Z){if(Z.which==27){P(z)}if(Z.ctrlKey&&k[Z.which]){k[Z.which]();return S}})}}}).dlg(y,p,function(V){if(x.test(V.type)){C.to(G(this))}else{C.detach()}}).dlg(m,p,function(V){D(G(this).text()).tC(p,x.test(V.type))}).dlg(m,M,function(V){V=D(G(this).text()).tC(A).up(y);if(G(this).hC(A)){V.pick().add(F).aC(A)}else{V.not(f).rC(A).drop();F.not(f).rC(A)}});s.bind(M,function(V){V=G(V.target);if(F.hC(L)&&!V.up(y+t+L)[0]){P()}else{if(V.has(F)[0]){G(t+A).rC(A).drop()}}})})})(document,jQuery,localStorage);