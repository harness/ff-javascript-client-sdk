var ze=Object.create,Ve=Object.defineProperty,We=Object.getPrototypeOf,Ye=Object.prototype.hasOwnProperty,Qe=Object.getOwnPropertyNames,Ze=Object.getOwnPropertyDescriptor;var Y=Object.assign,et=a=>Ve(a,"__esModule",{value:!0});var tt=(a,u)=>()=>(u||(u={exports:{}},a(u.exports,u)),u.exports);var nt=(a,u,I)=>{if(u&&typeof u=="object"||typeof u=="function")for(let g of Qe(u))!Ye.call(a,g)&&g!=="default"&&Ve(a,g,{get:()=>u[g],enumerable:!(I=Ze(u,g))||I.enumerable});return a},rt=a=>nt(et(Ve(a!=null?ze(We(a)):{},"default",a&&a.__esModule&&"default"in a?{get:()=>a.default,enumerable:!0}:{value:a,enumerable:!0})),a);var Re=(a,u,I)=>new Promise((g,z)=>{var W=k=>{try{A(I.next(k))}catch(N){z(N)}},x=k=>{try{A(I.throw(k))}catch(N){z(N)}},A=k=>k.done?g(k.value):Promise.resolve(k.value).then(W,x);A((I=I.apply(a,u)).next())});var Pe=tt((Me,Ie)=>{(function(a){"use strict";var u=a.setTimeout,I=a.clearTimeout,g=a.XMLHttpRequest,z=a.XDomainRequest,W=a.ActiveXObject,x=a.EventSource,A=a.document,k=a.Promise,N=a.fetch,ue=a.Response,ie=a.TextDecoder,O=a.TextEncoder,b=a.AbortController;if(typeof window!="undefined"&&typeof A!="undefined"&&!("readyState"in A)&&A.body==null&&(A.readyState="loading",window.addEventListener("load",function(e){A.readyState="complete"},!1)),g==null&&W!=null&&(g=function(){return new W("Microsoft.XMLHTTP")}),Object.create==null&&(Object.create=function(e){function n(){}return n.prototype=e,new n}),Date.now||(Date.now=function(){return new Date().getTime()}),b==null){var B=N;N=function(e,n){var r=n.signal;return B(e,{headers:n.headers,credentials:n.credentials,cache:n.cache}).then(function(t){var d=t.body.getReader();return r._reader=d,r._aborted&&r._reader.cancel(),{status:t.status,statusText:t.statusText,headers:t.headers,body:{getReader:function(){return d}}}})},b=function(){this.signal={_reader:null,_aborted:!1},this.abort=function(){this.signal._reader!=null&&this.signal._reader.cancel(),this.signal._aborted=!0}}}function w(){this.bitsNeeded=0,this.codePoint=0}w.prototype.decode=function(e){function n(p,E,c){if(c===1)return p>=128>>E&&p<<E<=2047;if(c===2)return p>=2048>>E&&p<<E<=55295||p>=57344>>E&&p<<E<=65535;if(c===3)return p>=65536>>E&&p<<E<=1114111;throw new Error}function r(p,E){if(p===6*1)return E>>6>15?3:E>31?2:1;if(p===6*2)return E>15?3:2;if(p===6*3)return 3;throw new Error}for(var t=65533,d="",f=this.bitsNeeded,l=this.codePoint,m=0;m<e.length;m+=1){var h=e[m];f!==0&&(h<128||h>191||!n(l<<6|h&63,f-6,r(f,l)))&&(f=0,l=t,d+=String.fromCharCode(l)),f===0?(h>=0&&h<=127?(f=0,l=h):h>=192&&h<=223?(f=6*1,l=h&31):h>=224&&h<=239?(f=6*2,l=h&15):h>=240&&h<=247?(f=6*3,l=h&7):(f=0,l=t),f!==0&&!n(l,f,r(f,l))&&(f=0,l=t)):(f-=6,l=l<<6|h&63),f===0&&(l<=65535?d+=String.fromCharCode(l):(d+=String.fromCharCode(55296+(l-65535-1>>10)),d+=String.fromCharCode(56320+(l-65535-1&1023))))}return this.bitsNeeded=f,this.codePoint=l,d};var oe=function(){try{return new ie().decode(new O().encode("test"),{stream:!0})==="test"}catch(e){console.debug("TextDecoder does not support streaming option. Using polyfill instead: "+e)}return!1};(ie==null||O==null||!oe())&&(ie=w);var $=function(){};function q(e){this.withCredentials=!1,this.readyState=0,this.status=0,this.statusText="",this.responseText="",this.onprogress=$,this.onload=$,this.onerror=$,this.onreadystatechange=$,this._contentType="",this._xhr=e,this._sendTimeout=0,this._abort=$}q.prototype.open=function(e,n){this._abort(!0);var r=this,t=this._xhr,d=1,f=0;this._abort=function(c){r._sendTimeout!==0&&(I(r._sendTimeout),r._sendTimeout=0),(d===1||d===2||d===3)&&(d=4,t.onload=$,t.onerror=$,t.onabort=$,t.onprogress=$,t.onreadystatechange=$,t.abort(),f!==0&&(I(f),f=0),c||(r.readyState=4,r.onabort(null),r.onreadystatechange())),d=0};var l=function(){if(d===1){var c=0,S="",Q=void 0;if("contentType"in t)c=200,S="OK",Q=t.contentType;else try{c=t.status,S=t.statusText,Q=t.getResponseHeader("Content-Type")}catch(Ee){c=0,S="",Q=void 0}c!==0&&(d=2,r.readyState=2,r.status=c,r.statusText=S,r._contentType=Q,r.onreadystatechange())}},m=function(){if(l(),d===2||d===3){d=3;var c="";try{c=t.responseText}catch(S){}r.readyState=3,r.responseText=c,r.onprogress()}},h=function(c,S){if((S==null||S.preventDefault==null)&&(S={preventDefault:$}),m(),d===1||d===2||d===3){if(d=4,f!==0&&(I(f),f=0),r.readyState=4,c==="load")r.onload(S);else if(c==="error")r.onerror(S);else if(c==="abort")r.onabort(S);else throw new TypeError;r.onreadystatechange()}},p=function(c){t!=null&&(t.readyState===4?(!("onload"in t)||!("onerror"in t)||!("onabort"in t))&&h(t.responseText===""?"error":"load",c):t.readyState===3?"onprogress"in t||m():t.readyState===2&&l())},E=function(){f=u(function(){E()},500),t.readyState===3&&m()};"onload"in t&&(t.onload=function(c){h("load",c)}),"onerror"in t&&(t.onerror=function(c){h("error",c)}),"onabort"in t&&(t.onabort=function(c){h("abort",c)}),"onprogress"in t&&(t.onprogress=m),"onreadystatechange"in t&&(t.onreadystatechange=function(c){p(c)}),("contentType"in t||!("ontimeout"in g.prototype))&&(n+=(n.indexOf("?")===-1?"?":"&")+"padding=true"),t.open(e,n,!0),"readyState"in t&&(f=u(function(){E()},0))},q.prototype.abort=function(){this._abort(!1)},q.prototype.getResponseHeader=function(e){return this._contentType},q.prototype.setRequestHeader=function(e,n){var r=this._xhr;"setRequestHeader"in r&&r.setRequestHeader(e,n)},q.prototype.getAllResponseHeaders=function(){return this._xhr.getAllResponseHeaders!=null&&this._xhr.getAllResponseHeaders()||""},q.prototype.send=function(){if((!("ontimeout"in g.prototype)||!("sendAsBinary"in g.prototype)&&!("mozAnon"in g.prototype))&&A!=null&&A.readyState!=null&&A.readyState!=="complete"){var e=this;e._sendTimeout=u(function(){e._sendTimeout=0,e.send()},4);return}var n=this._xhr;"withCredentials"in n&&(n.withCredentials=this.withCredentials);try{n.send(void 0)}catch(r){throw r}};function _(e){return e.replace(/[A-Z]/g,function(n){return String.fromCharCode(n.charCodeAt(0)+32)})}function le(e){for(var n=Object.create(null),r=e.split(`\r
`),t=0;t<r.length;t+=1){var d=r[t],f=d.split(": "),l=f.shift(),m=f.join(": ");n[_(l)]=m}this._map=n}le.prototype.get=function(e){return this._map[_(e)]},g!=null&&g.HEADERS_RECEIVED==null&&(g.HEADERS_RECEIVED=2);function ve(){}ve.prototype.open=function(e,n,r,t,d,f,l){e.open("GET",d);var m=0;e.onprogress=function(){var p=e.responseText,E=p.slice(m);m+=E.length,r(E)},e.onerror=function(p){p.preventDefault(),t(new Error("NetworkError"))},e.onload=function(){t(null)},e.onabort=function(){t(null)},e.onreadystatechange=function(){if(e.readyState===g.HEADERS_RECEIVED){var p=e.status,E=e.statusText,c=e.getResponseHeader("Content-Type"),S=e.getAllResponseHeaders();n(p,E,c,new le(S))}},e.withCredentials=f;for(var h in l)Object.prototype.hasOwnProperty.call(l,h)&&e.setRequestHeader(h,l[h]);return e.send(),e};function M(e){this._headers=e}M.prototype.get=function(e){return this._headers.get(e)};function he(){}he.prototype.open=function(e,n,r,t,d,f,l){var m=null,h=new b,p=h.signal,E=new ie;return N(d,{headers:l,credentials:f?"include":"same-origin",signal:p,cache:"no-store"}).then(function(c){return m=c.body.getReader(),n(c.status,c.statusText,c.headers.get("Content-Type"),new M(c.headers)),new k(function(S,Q){var Ee=function(){m.read().then(function(U){if(U.done)S(void 0);else{var L=E.decode(U.value,{stream:!0});r(L),Ee()}}).catch(function(U){Q(U)})};Ee()})}).catch(function(c){if(c.name!=="AbortError")return c}).then(function(c){t(c)}),{abort:function(){m!=null&&m.cancel(),h.abort()}}};function ne(){this._listeners=Object.create(null)}function Se(e){u(function(){throw e},0)}ne.prototype.dispatchEvent=function(e){e.target=this;var n=this._listeners[e.type];if(n!=null)for(var r=n.length,t=0;t<r;t+=1){var d=n[t];try{typeof d.handleEvent=="function"?d.handleEvent(e):d.call(this,e)}catch(f){Se(f)}}},ne.prototype.addEventListener=function(e,n){e=String(e);var r=this._listeners,t=r[e];t==null&&(t=[],r[e]=t);for(var d=!1,f=0;f<t.length;f+=1)t[f]===n&&(d=!0);d||t.push(n)},ne.prototype.removeEventListener=function(e,n){e=String(e);var r=this._listeners,t=r[e];if(t!=null){for(var d=[],f=0;f<t.length;f+=1)t[f]!==n&&d.push(t[f]);d.length===0?delete r[e]:r[e]=d}};function re(e){this.type=e,this.target=void 0}function be(e,n){re.call(this,e),this.data=n.data,this.lastEventId=n.lastEventId}be.prototype=Object.create(re.prototype);function pe(e,n){re.call(this,e),this.status=n.status,this.statusText=n.statusText,this.headers=n.headers}pe.prototype=Object.create(re.prototype);function ge(e,n){re.call(this,e),this.error=n.error}ge.prototype=Object.create(re.prototype);var o=-1,s=0,i=1,v=2,T=-1,y=0,C=1,H=2,we=3,Be=/^text\/event\-stream(;.*)?$/i,$e=1e3,Ue=18e6,Ne=function(e,n){var r=e==null?n:parseInt(e,10);return r!==r&&(r=n),_e(r)},_e=function(e){return Math.min(Math.max(e,$e),Ue)},se=function(e,n,r){try{typeof n=="function"&&n.call(e,r)}catch(t){Se(t)}};function J(e,n){ne.call(this),n=n||{},this.onopen=void 0,this.onmessage=void 0,this.onerror=void 0,this.url=void 0,this.readyState=void 0,this.withCredentials=void 0,this.headers=void 0,this._close=void 0,Xe(this,e,n)}function Ke(){return g!=null&&"withCredentials"in g.prototype||z==null?new g:new z}var Ge=N!=null&&ue!=null&&"body"in ue.prototype;function Xe(e,n,r){n=String(n);var t=Boolean(r.withCredentials),d=r.lastEventIdQueryParameterName||"lastEventId",f=_e(1e3),l=Ne(r.heartbeatTimeout,45e3),m="",h=f,p=!1,E=0,c=r.headers||{},S=r.Transport,Q=Ge&&S==null?void 0:new q(S!=null?new S:Ke()),Ee=S!=null&&typeof S!="string"?new S:Q==null?new he:new ve,U=void 0,L=0,X=o,fe="",Te="",Z="",Ce="",P=y,Fe=0,ae=0,qe=function(D,R,K,G){if(X===s)if(D===200&&K!=null&&Be.test(K)){X=i,p=Date.now(),h=f,e.readyState=i;var j=new pe("open",{status:D,statusText:R,headers:G});e.dispatchEvent(j),se(e,e.onopen,j)}else{var F="";D!==200?(R&&(R=R.replace(/\s+/g," ")),F="EventSource's response has a status "+D+" "+R+" that is not 200. Aborting the connection."):F="EventSource's response has a Content-Type specifying an unsupported type: "+(K==null?"-":K.replace(/\s+/g," "))+". Aborting the connection.",xe();var j=new pe("error",{status:D,statusText:R,headers:G});e.dispatchEvent(j),se(e,e.onerror,j),console.error(F)}},Je=function(D){if(X===i){for(var R=-1,K=0;K<D.length;K+=1){var G=D.charCodeAt(K);(G===`
`.charCodeAt(0)||G==="\r".charCodeAt(0))&&(R=K)}var j=(R!==-1?Ce:"")+D.slice(0,R+1);Ce=(R===-1?Ce:"")+D.slice(R+1),D!==""&&(p=Date.now(),E+=D.length);for(var F=0;F<j.length;F+=1){var G=j.charCodeAt(F);if(P===T&&G===`
`.charCodeAt(0))P=y;else if(P===T&&(P=y),G==="\r".charCodeAt(0)||G===`
`.charCodeAt(0)){if(P!==y){P===C&&(ae=F+1);var ee=j.slice(Fe,ae-1),te=j.slice(ae+(ae<F&&j.charCodeAt(ae)===" ".charCodeAt(0)?1:0),F);ee==="data"?(fe+=`
`,fe+=te):ee==="id"?Te=te:ee==="event"?Z=te:ee==="retry"?(f=Ne(te,f),h=f):ee==="heartbeatTimeout"&&(l=Ne(te,l),L!==0&&(I(L),L=u(function(){ye()},l)))}if(P===y){if(fe!==""){m=Te,Z===""&&(Z="message");var de=new be(Z,{data:fe.slice(1),lastEventId:Te});if(e.dispatchEvent(de),Z==="open"?se(e,e.onopen,de):Z==="message"?se(e,e.onmessage,de):Z==="error"&&se(e,e.onerror,de),X===v)return}fe="",Z=""}P=G==="\r".charCodeAt(0)?T:y}else P===y&&(Fe=F,P=C),P===C?G===":".charCodeAt(0)&&(ae=F+1,P=H):P===H&&(P=we)}}},Le=function(D){if(X===i||X===s)X=o,L!==0&&(I(L),L=0),L=u(function(){ye()},h),h=_e(Math.min(f*16,h*2)),e.readyState=s;else if(X===v&&D!=null){console.error(D);var R=new ge("error",{error:D});e.dispatchEvent(R),se(e,e.onerror,R)}},xe=function(){X=v,U!=null&&(U.abort(),U=void 0),L!==0&&(I(L),L=0),e.readyState=v},ye=function(){if(L=0,X!==o){if(!p&&U!=null)Le(new Error("No activity within "+l+" milliseconds. "+(X===s?"No response received.":E+" chars received.")+" Reconnecting.")),U!=null&&(U.abort(),U=void 0);else{var D=Math.max((p||Date.now())+l-Date.now(),1);p=!1,L=u(function(){ye()},D)}return}p=!1,E=0,L=u(function(){ye()},l),X=s,fe="",Z="",Te=m,Ce="",Fe=0,ae=0,P=y;var R=n;if(n.slice(0,5)!=="data:"&&n.slice(0,5)!=="blob:"&&m!==""){var K=n.indexOf("?");R=K===-1?n:n.slice(0,K+1)+n.slice(K+1).replace(/(?:^|&)([^=&]*)(?:=[^&]*)?/g,function(te,de){return de===d?"":te}),R+=(n.indexOf("?")===-1?"?":"&")+d+"="+encodeURIComponent(m)}var G=e.withCredentials,j={};j.Accept="text/event-stream";var F=e.headers;if(F!=null)for(var ee in F)Object.prototype.hasOwnProperty.call(F,ee)&&(j[ee]=F[ee]);try{U=Ee.open(Q,qe,Je,Le,R,G,j)}catch(te){throw xe(),te}};e.url=n,e.readyState=s,e.withCredentials=t,e.headers=c,e._close=xe,ye()}J.prototype=Object.create(ne.prototype),J.prototype.CONNECTING=s,J.prototype.OPEN=i,J.prototype.CLOSED=v,J.prototype.close=function(){this._close()},J.CONNECTING=s,J.OPEN=i,J.CLOSED=v,J.prototype.withCredentials=void 0;var He=x;g!=null&&(x==null||!("withCredentials"in x.prototype))&&(He=J),function(e){if(typeof Ie=="object"&&typeof Ie.exports=="object"){var n=e(Me);n!==void 0&&(Ie.exports=n)}else typeof define=="function"&&define.amd?define(["exports"],e):e(a)}(function(e){e.EventSourcePolyfill=J,e.NativeEventSource=x,e.EventSource=He})})(typeof globalThis=="undefined"?typeof window!="undefined"?window:typeof self!="undefined"?self:Me:globalThis)});var ke=rt(Pe());import it from"jwt-decode";import at from"mitt";var V;(function(a){a.READY="ready",a.CONNECTED="connected",a.DISCONNECTED="disconnected",a.CHANGED="changed",a.ERROR="error"})(V||(V={}));var Ae=6e4,je={debug:!1,baseUrl:"https://config.ff.harness.io/api/1.0",eventUrl:"https://events.ff.harness.io/api/1.0",eventsSyncInterval:Ae,streamEnabled:!0,allAttributesPrivate:!1,privateAttributeNames:[]},ce=(a,...u)=>console.error(`[FF-SDK] ${a}`,...u);var ot="1.5.0",st=500,Oe=globalThis.fetch,ft=ke.EventSourcePolyfill,me=!!globalThis.Proxy,De=a=>{let{value:u}=a;try{switch(a.kind.toLowerCase()){case"int":case"number":u=Number(u);break;case"boolean":u=u.toString().toLowerCase()==="true";break;case"json":u=JSON.parse(u);break}}catch(I){ce(I)}return u},dt=(a,u,I)=>{let g=!1,z,W,x,A,k,N=!0,ue=()=>{N=!1},ie=()=>{N=!0},O=[],b=at(),B=Y(Y({},je),I);B.eventsSyncInterval<Ae&&(B.eventsSyncInterval=Ae);let w=(o,...s)=>{B.debug&&console.debug(`[FF-SDK] ${o}`,...s)},oe=o=>{if(N){let s=Date.now();s-o.lastAccessed>st&&(o.count++,o.lastAccessed=s)}};globalThis.onbeforeunload=()=>{O.length&&globalThis.localStorage&&(ue(),globalThis.localStorage.HARNESS_FF_METRICS=JSON.stringify(O),ie())};let $=(o,s)=>Re(void 0,null,function*(){return(yield(yield Oe(`${s.baseUrl}/client/auth`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:o,target:Y(Y({},u),{identifier:String(u.identifier)})})})).json()).authToken}),q=()=>{if(O.length){w("Sending metrics...",{metrics:O,evaluations:_});let o={metricsData:O.map(s=>({timestamp:Date.now(),count:s.count,metricsType:"FFMETRICS",attributes:[{key:"featureIdentifier",value:s.featureIdentifier},{key:"featureName",value:s.featureIdentifier},{key:"variationIdentifier",value:s.variationIdentifier},{key:"target",value:u.identifier},{key:"SDK_NAME",value:"JavaScript"},{key:"SDK_LANGUAGE",value:"JavaScript"},{key:"SDK_TYPE",value:"client"},{key:"SDK_VERSION",value:ot}]}))};Oe(`${B.eventUrl}/metrics/${z}?cluster=${W}`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${A}`},body:JSON.stringify(o)}).then(()=>{O=[]}).catch(s=>{w(s)}).finally(()=>{k=window.setTimeout(q,B.eventsSyncInterval)})}else k=window.setTimeout(q,B.eventsSyncInterval)},_={},le=o=>{w("Sending event for",o.flag),me?b.emit(V.CHANGED,new Proxy(o,{get(s,i){var v;if(s.hasOwnProperty(i)&&i==="value"){let T=s.flag,y=o.value,C=O.find(H=>H.featureIdentifier===T&&H.featureValue===y);C?(oe(C),C.variationIdentifier=((v=_[T])==null?void 0:v.identifier)||""):O.push({featureIdentifier:T,featureValue:String(y),variationIdentifier:_[T].identifier||"",count:N?1:0,lastAccessed:Date.now()}),w("Metrics event: Flag",i,"has been read with value via stream update",y)}return i==="value"?De(o):o[i]}})):b.emit(V.CHANGED,{deleted:o.deleted,flag:o.flag,value:De(o)})},ve=function(){return me?new Proxy({},{get(o,s){var v,T,y;let i=o[s];if(o.hasOwnProperty(s)){let C=o[s],H=O.find(we=>we.featureIdentifier===s&&C===we.featureValue);H?(H.variationIdentifier=((v=_[s])==null?void 0:v.identifier)||"",oe(H)):O.push({featureIdentifier:s,featureValue:C,variationIdentifier:((T=_[s])==null?void 0:T.identifier)||"",count:N?1:0,lastAccessed:Date.now()}),w("Metrics event: Flag:",s,"has been read with value:",C,"variationIdentifier:",(y=_[s])==null?void 0:y.identifier)}return i}}):{}},M=ve();$(a,B).then(o=>{if(g)return;A=o;let s=it(o);if(w("Authenticated",s),globalThis.localStorage&&globalThis.localStorage.HARNESS_FF_METRICS)try{delete globalThis.localStorage.HARNESS_FF_METRICS,w("Picking up metrics from previous session")}catch(i){}k=window.setTimeout(q,B.eventsSyncInterval),z=s.environment,W=s.clusterIdentifier,he().then(()=>{w("Fetch all flags ok",M)}).then(()=>{g||Se()}).then(()=>{g||(w("Event stream ready",{storage:M}),b.emit(V.READY,Y({},M)),me||Object.keys(M).forEach(i=>{var v;O.push({featureIdentifier:i,featureValue:M[i],variationIdentifier:((v=_[i])==null?void 0:v.identifier)||"",count:N?1:0,lastAccessed:Date.now()})}))}).catch(i=>{b.emit(V.ERROR,i)})}).catch(o=>{ce("Authentication error: ",o),b.emit(V.ERROR,o)});let he=()=>Re(void 0,null,function*(){try{(yield(yield Oe(`${B.baseUrl}/client/env/${z}/target/${u.identifier}/evaluations?cluster=${W}`,{headers:{Authorization:`Bearer ${A}`}})).json()).forEach(i=>{let v=De(i),T=M[i.flag];v!==T&&(w("Flag variation has changed for ",i.identifier),M[i.flag]=v,_[i.flag]=Y(Y({},i),{value:v}),le(i))})}catch(o){return ce("Features fetch operation error: ",o),b.emit(V.ERROR,o),o}}),ne=o=>Re(void 0,null,function*(){var s;try{let i=yield Oe(`${B.baseUrl}/client/env/${z}/target/${u.identifier}/evaluations/${o}?cluster=${W}`,{headers:{Authorization:`Bearer ${A}`}});if(i.ok){let v=yield i.json(),T=De(v);if(ue(),M[o]=T,_[o]=Y(Y({},v),{value:T}),ie(),le(v),!me){let y=v.flag,C=O.find(H=>H.featureIdentifier===y&&H.featureValue===v.value);C?(oe(C),C.variationIdentifier=((s=_[y])==null?void 0:s.identifier)||""):O.push({featureIdentifier:y,featureValue:String(v.value),variationIdentifier:_[y].identifier||"",count:N?1:0,lastAccessed:Date.now()})}}else b.emit(V.ERROR,i)}catch(i){ce("Feature fetch operation error: ",i),b.emit(V.ERROR,i)}}),Se=()=>{if(!B.streamEnabled){w("Stream is disabled by configuration. Note: Polling is not yet supported");return}x=new ft(`${B.baseUrl}/stream?cluster=${W}`,{headers:{Authorization:`Bearer ${A}`,"API-Key":a}}),x.onopen=i=>{w("Stream connected",i),b.emit(V.CONNECTED)},x.onclose=i=>{w("Stream disconnected"),b.emit(V.DISCONNECTED)},x.onerror=i=>{ce("Stream has issue",i),b.emit(V.ERROR,i)};let o=i=>{switch(i.event){case"create":setTimeout(()=>ne(i.identifier),1e3);break;case"patch":ne(i.identifier);break;case"delete":delete M[i.identifier],b.emit(V.CHANGED,{flag:i.identifier,value:void 0,deleted:!0}),w("Evaluation deleted",{message:i,storage:M});break}},s=i=>{i.event==="patch"&&he()};x.addEventListener("*",i=>{let v=JSON.parse(i.data);w("Received event from stream: ",v),v.domain==="flag"?o(v):v.domain==="target-segment"&&s(v)})},re=(o,s)=>b.on(o,s),be=(o,s)=>{o?b.off(o,s):ge()},pe=(o,s)=>{var v;let i=M[o];if(!me&&i!==void 0){let T=i,y=o,C=O.find(H=>H.featureIdentifier===y&&H.featureValue===T);C?(oe(C),C.variationIdentifier=((v=_[y])==null?void 0:v.identifier)||""):O.push({featureIdentifier:y,featureValue:T,count:N?1:0,variationIdentifier:_[y].identifier||"",lastAccessed:Date.now()})}return i!==void 0?i:s},ge=()=>{g=!0,w("Closing event stream"),M=ve(),_={},clearTimeout(k),b.all.clear(),typeof(x==null?void 0:x.close)=="function"&&x.close()};return{on:re,off:be,variation:pe,close:ge}};export{V as Event,dt as initialize};
/** @license
 * eventsource.js
 * Available under MIT License (MIT)
 * https://github.com/Yaffle/EventSource/
 */
