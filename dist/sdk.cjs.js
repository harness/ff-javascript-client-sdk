var Ze=Object.create,Ae=Object.defineProperty,et=Object.getPrototypeOf,tt=Object.prototype.hasOwnProperty,nt=Object.getOwnPropertyNames,rt=Object.getOwnPropertyDescriptor;var q=Object.assign,Ue=a=>Ae(a,"__esModule",{value:!0});var it=(a,l)=>()=>(l||(l={exports:{}},a(l.exports,l)),l.exports),at=(a,l)=>{for(var S in l)Ae(a,S,{get:l[S],enumerable:!0})},ot=(a,l,S)=>{if(l&&typeof l=="object"||typeof l=="function")for(let g of nt(l))!tt.call(a,g)&&g!=="default"&&Ae(a,g,{get:()=>l[g],enumerable:!(S=rt(l,g))||S.enumerable});return a},Le=a=>ot(Ue(Ae(a!=null?Ze(et(a)):{},"default",a&&a.__esModule&&"default"in a?{get:()=>a.default,enumerable:!0}:{value:a,enumerable:!0})),a);var Oe=(a,l,S)=>new Promise((g,Y)=>{var z=U=>{try{H(S.next(U))}catch(O){Y(O)}},x=U=>{try{H(S.throw(U))}catch(O){Y(O)}},H=U=>U.done?g(U.value):Promise.resolve(U.value).then(z,x);H((S=S.apply(a,l)).next())});var Be=it((Pe,De)=>{(function(a){"use strict";var l=a.setTimeout,S=a.clearTimeout,g=a.XMLHttpRequest,Y=a.XDomainRequest,z=a.ActiveXObject,x=a.EventSource,H=a.document,U=a.Promise,O=a.fetch,ie=a.Response,ae=a.TextDecoder,ve=a.TextEncoder,b=a.AbortController;if(typeof window!="undefined"&&typeof H!="undefined"&&!("readyState"in H)&&H.body==null&&(H.readyState="loading",window.addEventListener("load",function(e){H.readyState="complete"},!1)),g==null&&z!=null&&(g=function(){return new z("Microsoft.XMLHTTP")}),Object.create==null&&(Object.create=function(e){function n(){}return n.prototype=e,new n}),Date.now||(Date.now=function(){return new Date().getTime()}),b==null){var D=O;O=function(e,n){var r=n.signal;return D(e,{headers:n.headers,credentials:n.credentials,cache:n.cache}).then(function(t){var d=t.body.getReader();return r._reader=d,r._aborted&&r._reader.cancel(),{status:t.status,statusText:t.statusText,headers:t.headers,body:{getReader:function(){return d}}}})},b=function(){this.signal={_reader:null,_aborted:!1},this.abort=function(){this.signal._reader!=null&&this.signal._reader.cancel(),this.signal._aborted=!0}}}function L(){this.bitsNeeded=0,this.codePoint=0}L.prototype.decode=function(e){function n(p,E,c){if(c===1)return p>=128>>E&&p<<E<=2047;if(c===2)return p>=2048>>E&&p<<E<=55295||p>=57344>>E&&p<<E<=65535;if(c===3)return p>=65536>>E&&p<<E<=1114111;throw new Error}function r(p,E){if(p===6*1)return E>>6>15?3:E>31?2:1;if(p===6*2)return E>15?3:2;if(p===6*3)return 3;throw new Error}for(var t=65533,d="",f=this.bitsNeeded,v=this.codePoint,y=0;y<e.length;y+=1){var h=e[y];f!==0&&(h<128||h>191||!n(v<<6|h&63,f-6,r(f,v)))&&(f=0,v=t,d+=String.fromCharCode(v)),f===0?(h>=0&&h<=127?(f=0,v=h):h>=192&&h<=223?(f=6*1,v=h&31):h>=224&&h<=239?(f=6*2,v=h&15):h>=240&&h<=247?(f=6*3,v=h&7):(f=0,v=t),f!==0&&!n(v,f,r(f,v))&&(f=0,v=t)):(f-=6,v=v<<6|h&63),f===0&&(v<=65535?d+=String.fromCharCode(v):(d+=String.fromCharCode(55296+(v-65535-1>>10)),d+=String.fromCharCode(56320+(v-65535-1&1023))))}return this.bitsNeeded=f,this.codePoint=v,d};var R=function(){try{return new ae().decode(new ve().encode("test"),{stream:!0})==="test"}catch(e){console.debug("TextDecoder does not support streaming option. Using polyfill instead: "+e)}return!1};(ae==null||ve==null||!R())&&(ae=L);var M=function(){};function Q(e){this.withCredentials=!1,this.readyState=0,this.status=0,this.statusText="",this.responseText="",this.onprogress=M,this.onload=M,this.onerror=M,this.onreadystatechange=M,this._contentType="",this._xhr=e,this._sendTimeout=0,this._abort=M}Q.prototype.open=function(e,n){this._abort(!0);var r=this,t=this._xhr,d=1,f=0;this._abort=function(c){r._sendTimeout!==0&&(S(r._sendTimeout),r._sendTimeout=0),(d===1||d===2||d===3)&&(d=4,t.onload=M,t.onerror=M,t.onabort=M,t.onprogress=M,t.onreadystatechange=M,t.abort(),f!==0&&(S(f),f=0),c||(r.readyState=4,r.onabort(null),r.onreadystatechange())),d=0};var v=function(){if(d===1){var c=0,m="",ee=void 0;if("contentType"in t)c=200,m="OK",ee=t.contentType;else try{c=t.status,m=t.statusText,ee=t.getResponseHeader("Content-Type")}catch(me){c=0,m="",ee=void 0}c!==0&&(d=2,r.readyState=2,r.status=c,r.statusText=m,r._contentType=ee,r.onreadystatechange())}},y=function(){if(v(),d===2||d===3){d=3;var c="";try{c=t.responseText}catch(m){}r.readyState=3,r.responseText=c,r.onprogress()}},h=function(c,m){if((m==null||m.preventDefault==null)&&(m={preventDefault:M}),y(),d===1||d===2||d===3){if(d=4,f!==0&&(S(f),f=0),r.readyState=4,c==="load")r.onload(m);else if(c==="error")r.onerror(m);else if(c==="abort")r.onabort(m);else throw new TypeError;r.onreadystatechange()}},p=function(c){t!=null&&(t.readyState===4?(!("onload"in t)||!("onerror"in t)||!("onabort"in t))&&h(t.responseText===""?"error":"load",c):t.readyState===3?"onprogress"in t||y():t.readyState===2&&v())},E=function(){f=l(function(){E()},500),t.readyState===3&&y()};"onload"in t&&(t.onload=function(c){h("load",c)}),"onerror"in t&&(t.onerror=function(c){h("error",c)}),"onabort"in t&&(t.onabort=function(c){h("abort",c)}),"onprogress"in t&&(t.onprogress=y),"onreadystatechange"in t&&(t.onreadystatechange=function(c){p(c)}),("contentType"in t||!("ontimeout"in g.prototype))&&(n+=(n.indexOf("?")===-1?"?":"&")+"padding=true"),t.open(e,n,!0),"readyState"in t&&(f=l(function(){E()},0))},Q.prototype.abort=function(){this._abort(!1)},Q.prototype.getResponseHeader=function(e){return this._contentType},Q.prototype.setRequestHeader=function(e,n){var r=this._xhr;"setRequestHeader"in r&&r.setRequestHeader(e,n)},Q.prototype.getAllResponseHeaders=function(){return this._xhr.getAllResponseHeaders!=null&&this._xhr.getAllResponseHeaders()||""},Q.prototype.send=function(){if((!("ontimeout"in g.prototype)||!("sendAsBinary"in g.prototype)&&!("mozAnon"in g.prototype))&&H!=null&&H.readyState!=null&&H.readyState!=="complete"){var e=this;e._sendTimeout=l(function(){e._sendTimeout=0,e.send()},4);return}var n=this._xhr;"withCredentials"in n&&(n.withCredentials=this.withCredentials);try{n.send(void 0)}catch(r){throw r}};function se(e){return e.replace(/[A-Z]/g,function(n){return String.fromCharCode(n.charCodeAt(0)+32)})}function fe(e){for(var n=Object.create(null),r=e.split(`\r
`),t=0;t<r.length;t+=1){var d=r[t],f=d.split(": "),v=f.shift(),y=f.join(": ");n[se(v)]=y}this._map=n}fe.prototype.get=function(e){return this._map[se(e)]},g!=null&&g.HEADERS_RECEIVED==null&&(g.HEADERS_RECEIVED=2);function N(){}N.prototype.open=function(e,n,r,t,d,f,v){e.open("GET",d);var y=0;e.onprogress=function(){var p=e.responseText,E=p.slice(y);y+=E.length,r(E)},e.onerror=function(p){p.preventDefault(),t(new Error("NetworkError"))},e.onload=function(){t(null)},e.onabort=function(){t(null)},e.onreadystatechange=function(){if(e.readyState===g.HEADERS_RECEIVED){var p=e.status,E=e.statusText,c=e.getResponseHeader("Content-Type"),m=e.getAllResponseHeaders();n(p,E,c,new fe(m))}},e.withCredentials=f;for(var h in v)Object.prototype.hasOwnProperty.call(v,h)&&e.setRequestHeader(h,v[h]);return e.send(),e};function he(e){this._headers=e}he.prototype.get=function(e){return this._headers.get(e)};function pe(){}pe.prototype.open=function(e,n,r,t,d,f,v){var y=null,h=new b,p=h.signal,E=new ae;return O(d,{headers:v,credentials:f?"include":"same-origin",signal:p,cache:"no-store"}).then(function(c){return y=c.body.getReader(),n(c.status,c.statusText,c.headers.get("Content-Type"),new he(c.headers)),new U(function(m,ee){var me=function(){y.read().then(function($){if($.done)m(void 0);else{var P=E.decode($.value,{stream:!0});r(P),me()}}).catch(function($){ee($)})};me()})}).catch(function(c){if(c.name!=="AbortError")return c}).then(function(c){t(c)}),{abort:function(){y!=null&&y.cancel(),h.abort()}}};function I(){this._listeners=Object.create(null)}function ge(e){l(function(){throw e},0)}I.prototype.dispatchEvent=function(e){e.target=this;var n=this._listeners[e.type];if(n!=null)for(var r=n.length,t=0;t<r;t+=1){var d=n[t];try{typeof d.handleEvent=="function"?d.handleEvent(e):d.call(this,e)}catch(f){ge(f)}}},I.prototype.addEventListener=function(e,n){e=String(e);var r=this._listeners,t=r[e];t==null&&(t=[],r[e]=t);for(var d=!1,f=0;f<t.length;f+=1)t[f]===n&&(d=!0);d||t.push(n)},I.prototype.removeEventListener=function(e,n){e=String(e);var r=this._listeners,t=r[e];if(t!=null){for(var d=[],f=0;f<t.length;f+=1)t[f]!==n&&d.push(t[f]);d.length===0?delete r[e]:r[e]=d}};function Z(e){this.type=e,this.target=void 0}function we(e,n){Z.call(this,e),this.data=n.data,this.lastEventId=n.lastEventId}we.prototype=Object.create(Z.prototype);function Ee(e,n){Z.call(this,e),this.status=n.status,this.statusText=n.statusText,this.headers=n.headers}Ee.prototype=Object.create(Z.prototype);function Te(e,n){Z.call(this,e),this.error=n.error}Te.prototype=Object.create(Z.prototype);var ye=-1,J=0,o=1,s=2,i=-1,u=0,w=1,T=2,_=3,B=/^text\/event\-stream(;.*)?$/i,Ce=1e3,qe=18e6,xe=function(e,n){var r=e==null?n:parseInt(e,10);return r!==r&&(r=n),Me(r)},Me=function(e){return Math.min(Math.max(e,Ce),qe)},de=function(e,n,r){try{typeof n=="function"&&n.call(e,r)}catch(t){ge(t)}};function W(e,n){I.call(this),n=n||{},this.onopen=void 0,this.onmessage=void 0,this.onerror=void 0,this.url=void 0,this.readyState=void 0,this.withCredentials=void 0,this.headers=void 0,this._close=void 0,Ye(this,e,n)}function Je(){return g!=null&&"withCredentials"in g.prototype||Y==null?new g:new Y}var We=O!=null&&ie!=null&&"body"in ie.prototype;function Ye(e,n,r){n=String(n);var t=Boolean(r.withCredentials),d=r.lastEventIdQueryParameterName||"lastEventId",f=Me(1e3),v=xe(r.heartbeatTimeout,45e3),y="",h=f,p=!1,E=0,c=r.headers||{},m=r.Transport,ee=We&&m==null?void 0:new Q(m!=null?new m:Je()),me=m!=null&&typeof m!="string"?new m:ee==null?new pe:new N,$=void 0,P=0,X=ye,ce="",Re="",te="",Ie="",j=u,Ve=0,oe=0,ze=function(A,C,K,G){if(X===J)if(A===200&&K!=null&&B.test(K)){X=o,p=Date.now(),h=f,e.readyState=o;var k=new Ee("open",{status:A,statusText:C,headers:G});e.dispatchEvent(k),de(e,e.onopen,k)}else{var F="";A!==200?(C&&(C=C.replace(/\s+/g," ")),F="EventSource's response has a status "+A+" "+C+" that is not 200. Aborting the connection."):F="EventSource's response has a Content-Type specifying an unsupported type: "+(K==null?"-":K.replace(/\s+/g," "))+". Aborting the connection.",He();var k=new Ee("error",{status:A,statusText:C,headers:G});e.dispatchEvent(k),de(e,e.onerror,k),console.error(F)}},Qe=function(A){if(X===o){for(var C=-1,K=0;K<A.length;K+=1){var G=A.charCodeAt(K);(G===`
`.charCodeAt(0)||G==="\r".charCodeAt(0))&&(C=K)}var k=(C!==-1?Ie:"")+A.slice(0,C+1);Ie=(C===-1?Ie:"")+A.slice(C+1),A!==""&&(p=Date.now(),E+=A.length);for(var F=0;F<k.length;F+=1){var G=k.charCodeAt(F);if(j===i&&G===`
`.charCodeAt(0))j=u;else if(j===i&&(j=u),G==="\r".charCodeAt(0)||G===`
`.charCodeAt(0)){if(j!==u){j===w&&(oe=F+1);var ne=k.slice(Ve,oe-1),re=k.slice(oe+(oe<F&&k.charCodeAt(oe)===" ".charCodeAt(0)?1:0),F);ne==="data"?(ce+=`
`,ce+=re):ne==="id"?Re=re:ne==="event"?te=re:ne==="retry"?(f=xe(re,f),h=f):ne==="heartbeatTimeout"&&(v=xe(re,v),P!==0&&(S(P),P=l(function(){Se()},v)))}if(j===u){if(ce!==""){y=Re,te===""&&(te="message");var le=new we(te,{data:ce.slice(1),lastEventId:Re});if(e.dispatchEvent(le),te==="open"?de(e,e.onopen,le):te==="message"?de(e,e.onmessage,le):te==="error"&&de(e,e.onerror,le),X===s)return}ce="",te=""}j=G==="\r".charCodeAt(0)?i:u}else j===u&&(Ve=F,j=w),j===w?G===":".charCodeAt(0)&&(oe=F+1,j=T):j===T&&(j=_)}}},ke=function(A){if(X===o||X===J)X=ye,P!==0&&(S(P),P=0),P=l(function(){Se()},h),h=Me(Math.min(f*16,h*2)),e.readyState=J;else if(X===s&&A!=null){console.error(A);var C=new Te("error",{error:A});e.dispatchEvent(C),de(e,e.onerror,C)}},He=function(){X=s,$!=null&&($.abort(),$=void 0),P!==0&&(S(P),P=0),e.readyState=s},Se=function(){if(P=0,X!==ye){if(!p&&$!=null)ke(new Error("No activity within "+v+" milliseconds. "+(X===J?"No response received.":E+" chars received.")+" Reconnecting.")),$!=null&&($.abort(),$=void 0);else{var A=Math.max((p||Date.now())+v-Date.now(),1);p=!1,P=l(function(){Se()},A)}return}p=!1,E=0,P=l(function(){Se()},v),X=J,ce="",te="",Re=y,Ie="",Ve=0,oe=0,j=u;var C=n;if(n.slice(0,5)!=="data:"&&n.slice(0,5)!=="blob:"&&y!==""){var K=n.indexOf("?");C=K===-1?n:n.slice(0,K+1)+n.slice(K+1).replace(/(?:^|&)([^=&]*)(?:=[^&]*)?/g,function(re,le){return le===d?"":re}),C+=(n.indexOf("?")===-1?"?":"&")+d+"="+encodeURIComponent(y)}var G=e.withCredentials,k={};k.Accept="text/event-stream";var F=e.headers;if(F!=null)for(var ne in F)Object.prototype.hasOwnProperty.call(F,ne)&&(k[ne]=F[ne]);try{$=me.open(ee,ze,Qe,ke,C,G,k)}catch(re){throw He(),re}};e.url=n,e.readyState=J,e.withCredentials=t,e.headers=c,e._close=He,Se()}W.prototype=Object.create(I.prototype),W.prototype.CONNECTING=J,W.prototype.OPEN=o,W.prototype.CLOSED=s,W.prototype.close=function(){this._close()},W.CONNECTING=J,W.OPEN=o,W.CLOSED=s,W.prototype.withCredentials=void 0;var je=x;g!=null&&(x==null||!("withCredentials"in x.prototype))&&(je=W),function(e){if(typeof De=="object"&&typeof De.exports=="object"){var n=e(Pe);n!==void 0&&(De.exports=n)}else typeof define=="function"&&define.amd?define(["exports"],e):e(a)}(function(e){e.EventSourcePolyfill=W,e.NativeEventSource=x,e.EventSource=je})})(typeof globalThis=="undefined"?typeof window!="undefined"?window:typeof self!="undefined"?self:Pe:globalThis)});Ue(exports);at(exports,{Event:()=>V,initialize:()=>ct});var Ke=Le(require("jwt-decode")),Ge=Le(require("mitt")),Xe=Le(Be());var V;(function(a){a.READY="ready",a.CONNECTED="connected",a.DISCONNECTED="disconnected",a.CHANGED="changed",a.ERROR="error"})(V||(V={}));var Ne=6e4,$e={debug:!1,baseUrl:"https://config.ff.harness.io/api/1.0",eventUrl:"https://events.ff.harness.io/api/1.0",eventsSyncInterval:Ne,streamEnabled:!0,allAttributesPrivate:!1,privateAttributeNames:[]},ue=(a,...l)=>console.error(`[FF-SDK] ${a}`,...l);var st="1.7.0",ft=500,_e=globalThis.fetch,dt=Xe.EventSourcePolyfill,be=!!globalThis.Proxy,Fe=a=>{let{value:l}=a;try{switch(a.kind.toLowerCase()){case"int":case"number":l=Number(l);break;case"boolean":l=l.toString().toLowerCase()==="true";break;case"json":l=JSON.parse(l);break}}catch(S){ue(S)}return l},ct=(a,l,S)=>{let g=!1,Y,z,x,H,U,O=!0,ie={},ae=()=>{O=!1},ve=()=>{O=!0},b=[],D=(0,Ge.default)(),L=q(q({},$e),S);L.eventsSyncInterval<Ne&&(L.eventsSyncInterval=Ne);let R=(o,...s)=>{L.debug&&console.debug(`[FF-SDK] ${o}`,...s)},M=o=>{if(O){let s=Date.now();s-o.lastAccessed>ft&&(o.count++,o.lastAccessed=s)}};globalThis.onbeforeunload=()=>{b.length&&globalThis.localStorage&&(ae(),globalThis.localStorage.HARNESS_FF_METRICS=JSON.stringify(b),ve())};let Q=(o,s)=>Oe(void 0,null,function*(){return(yield(yield _e(`${s.baseUrl}/client/auth`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:o,target:q(q({},l),{identifier:String(l.identifier)})})})).json()).authToken}),se=0,fe=()=>{if(b.length){R("Sending metrics...",{metrics:b,evaluations:N});let o={metricsData:b.map(s=>({timestamp:Date.now(),count:s.count,metricsType:"FFMETRICS",attributes:[{key:"featureIdentifier",value:s.featureIdentifier},{key:"featureName",value:s.featureIdentifier},{key:"variationIdentifier",value:s.variationIdentifier},{key:"target",value:l.identifier},{key:"SDK_NAME",value:"JavaScript"},{key:"SDK_LANGUAGE",value:"JavaScript"},{key:"SDK_TYPE",value:"client"},{key:"SDK_VERSION",value:st}]}))};_e(`${L.eventUrl}/metrics/${Y}?cluster=${z}`,{method:"POST",headers:q({"Content-Type":"application/json"},ie),body:JSON.stringify(o)}).then(()=>{b=[],se=0}).catch(s=>{se++&&(b=[],se=0),R(s)}).finally(()=>{U=window.setTimeout(fe,L.eventsSyncInterval)})}else U=window.setTimeout(fe,L.eventsSyncInterval)},N={},he=o=>{R("Sending event for",o.flag),be?D.emit(V.CHANGED,new Proxy(o,{get(s,i){var u;if(s.hasOwnProperty(i)&&i==="value"){let w=s.flag,T=o.value,_=b.find(B=>B.featureIdentifier===w&&B.featureValue===T);_?(M(_),_.variationIdentifier=((u=N[w])==null?void 0:u.identifier)||""):b.push({featureIdentifier:w,featureValue:String(T),variationIdentifier:N[w].identifier||"",count:O?1:0,lastAccessed:Date.now()}),R("Metrics event: Flag",i,"has been read with value via stream update",T)}return i==="value"?Fe(o):o[i]}})):D.emit(V.CHANGED,{deleted:o.deleted,flag:o.flag,value:Fe(o)})},pe=function(){return be?new Proxy({},{get(o,s){var u,w,T;let i=o[s];if(o.hasOwnProperty(s)){let _=o[s],B=b.find(Ce=>Ce.featureIdentifier===s&&_===Ce.featureValue);B?(B.variationIdentifier=((u=N[s])==null?void 0:u.identifier)||"",M(B)):b.push({featureIdentifier:s,featureValue:_,variationIdentifier:((w=N[s])==null?void 0:w.identifier)||"",count:O?1:0,lastAccessed:Date.now()}),R("Metrics event: Flag:",s,"has been read with value:",_,"variationIdentifier:",(T=N[s])==null?void 0:T.identifier)}return i}}):{}},I=pe();Q(a,L).then(o=>{if(g)return;H=o;let s=(0,Ke.default)(o);if(ie={Authorization:`Bearer ${H}`,"Harness-AccountID":s.accountID,"Harness-EnvironmentID":s.environmentIdentifier},R("Authenticated",s),globalThis.localStorage&&globalThis.localStorage.HARNESS_FF_METRICS)try{delete globalThis.localStorage.HARNESS_FF_METRICS,R("Picking up metrics from previous session")}catch(i){}U=window.setTimeout(fe,L.eventsSyncInterval),Y=s.environment,z=s.clusterIdentifier,ge().then(()=>{R("Fetch all flags ok",I)}).then(()=>{g||we()}).then(()=>{g||(R("Event stream ready",{storage:I}),D.emit(V.READY,q({},I)),be||Object.keys(I).forEach(i=>{var u;b.push({featureIdentifier:i,featureValue:I[i],variationIdentifier:((u=N[i])==null?void 0:u.identifier)||"",count:O?1:0,lastAccessed:Date.now()})}))}).catch(i=>{D.emit(V.ERROR,i)})}).catch(o=>{ue("Authentication error: ",o),D.emit(V.ERROR,o)});let ge=()=>Oe(void 0,null,function*(){try{(yield(yield _e(`${L.baseUrl}/client/env/${Y}/target/${l.identifier}/evaluations?cluster=${z}`,{headers:ie})).json()).forEach(i=>{let u=Fe(i),w=I[i.flag];u!==w&&(R("Flag variation has changed for ",i.identifier),I[i.flag]=u,N[i.flag]=q(q({},i),{value:u}),he(i))})}catch(o){return ue("Features fetch operation error: ",o),D.emit(V.ERROR,o),o}}),Z=o=>Oe(void 0,null,function*(){var s;try{let i=yield _e(`${L.baseUrl}/client/env/${Y}/target/${l.identifier}/evaluations/${o}?cluster=${z}`,{headers:ie});if(i.ok){let u=yield i.json(),w=Fe(u);if(ae(),I[o]=w,N[o]=q(q({},u),{value:w}),ve(),he(u),!be){let T=u.flag,_=b.find(B=>B.featureIdentifier===T&&B.featureValue===u.value);_?(M(_),_.variationIdentifier=((s=N[T])==null?void 0:s.identifier)||""):b.push({featureIdentifier:T,featureValue:String(u.value),variationIdentifier:N[T].identifier||"",count:O?1:0,lastAccessed:Date.now()})}}else D.emit(V.ERROR,i)}catch(i){ue("Feature fetch operation error: ",i),D.emit(V.ERROR,i)}}),we=()=>{if(!L.streamEnabled){R("Stream is disabled by configuration. Note: Polling is not yet supported");return}x=new dt(`${L.baseUrl}/stream?cluster=${z}`,{headers:q({"API-Key":a},ie)}),x.onopen=i=>{R("Stream connected",i),D.emit(V.CONNECTED)},x.onclose=i=>{R("Stream disconnected"),D.emit(V.DISCONNECTED)},x.onerror=i=>{ue("Stream has issue",i),D.emit(V.ERROR,i)};let o=i=>{switch(i.event){case"create":setTimeout(()=>Z(i.identifier),1e3);break;case"patch":Z(i.identifier);break;case"delete":delete I[i.identifier],D.emit(V.CHANGED,{flag:i.identifier,value:void 0,deleted:!0}),R("Evaluation deleted",{message:i,storage:I});break}},s=i=>{i.event==="patch"&&ge()};x.addEventListener("*",i=>{let u=JSON.parse(i.data);R("Received event from stream: ",u),u.domain==="flag"?o(u):u.domain==="target-segment"&&s(u)})},Ee=(o,s)=>D.on(o,s),Te=(o,s)=>{o?D.off(o,s):J()},ye=(o,s)=>{var u;let i=I[o];if(!be&&i!==void 0){let w=i,T=o,_=b.find(B=>B.featureIdentifier===T&&B.featureValue===w);_?(M(_),_.variationIdentifier=((u=N[T])==null?void 0:u.identifier)||""):b.push({featureIdentifier:T,featureValue:w,count:O?1:0,variationIdentifier:N[T].identifier||"",lastAccessed:Date.now()})}return i!==void 0?i:s},J=()=>{g=!0,R("Closing event stream"),I=pe(),N={},clearTimeout(U),D.all.clear(),typeof(x==null?void 0:x.close)=="function"&&x.close()};return{on:Ee,off:Te,variation:ye,close:J}};
/** @license
 * eventsource.js
 * Available under MIT License (MIT)
 * https://github.com/Yaffle/EventSource/
 */
