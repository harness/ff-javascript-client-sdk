var HarnessFFSDK=(()=>{var tt=Object.create,Re=Object.defineProperty,nt=Object.getPrototypeOf,rt=Object.prototype.hasOwnProperty,it=Object.getOwnPropertyNames,at=Object.getOwnPropertyDescriptor;var re=Object.assign,ot=n=>Re(n,"__esModule",{value:!0});var st=(n,i)=>()=>(i||(i={exports:{}},n(i.exports,i)),i.exports),ft=(n,i)=>{for(var v in i)Re(n,v,{get:i[v],enumerable:!0})},dt=(n,i,v)=>{if(i&&typeof i=="object"||typeof i=="function")for(let c of it(i))!rt.call(n,c)&&c!=="default"&&Re(n,c,{get:()=>i[c],enumerable:!(v=at(i,c))||v.enumerable});return n},ct=n=>dt(ot(Re(n!=null?tt(nt(n)):{},"default",n&&n.__esModule&&"default"in n?{get:()=>n.default,enumerable:!0}:{value:n,enumerable:!0})),n);var Ie=(n,i,v)=>new Promise((c,H)=>{var x=B=>{try{O(v.next(B))}catch(F){H(F)}},b=B=>{try{O(v.throw(B))}catch(F){H(F)}},O=B=>B.done?c(B.value):Promise.resolve(B.value).then(x,b);O((v=v.apply(n,i)).next())});var $e=st((ke,Oe)=>{(function(n){"use strict";var i=n.setTimeout,v=n.clearTimeout,c=n.XMLHttpRequest,H=n.XDomainRequest,x=n.ActiveXObject,b=n.EventSource,O=n.document,B=n.Promise,F=n.fetch,ue=n.Response,ie=n.TextDecoder,D=n.TextEncoder,T=n.AbortController;if(typeof window!="undefined"&&typeof O!="undefined"&&!("readyState"in O)&&O.body==null&&(O.readyState="loading",window.addEventListener("load",function(e){O.readyState="complete"},!1)),c==null&&x!=null&&(c=function(){return new x("Microsoft.XMLHTTP")}),Object.create==null&&(Object.create=function(e){function r(){}return r.prototype=e,new r}),Date.now||(Date.now=function(){return new Date().getTime()}),T==null){var W=F;F=function(e,r){var a=r.signal;return W(e,{headers:r.headers,credentials:r.credentials,cache:r.cache}).then(function(t){var u=t.body.getReader();return a._reader=u,a._aborted&&a._reader.cancel(),{status:t.status,statusText:t.statusText,headers:t.headers,body:{getReader:function(){return u}}}})},T=function(){this.signal={_reader:null,_aborted:!1},this.abort=function(){this.signal._reader!=null&&this.signal._reader.cancel(),this.signal._aborted=!0}}}function C(){this.bitsNeeded=0,this.codePoint=0}C.prototype.decode=function(e){function r(E,y,l){if(l===1)return E>=128>>y&&E<<y<=2047;if(l===2)return E>=2048>>y&&E<<y<=55295||E>=57344>>y&&E<<y<=65535;if(l===3)return E>=65536>>y&&E<<y<=1114111;throw new Error}function a(E,y){if(E===6*1)return y>>6>15?3:y>31?2:1;if(E===6*2)return y>15?3:2;if(E===6*3)return 3;throw new Error}for(var t=65533,u="",d=this.bitsNeeded,h=this.codePoint,w=0;w<e.length;w+=1){var g=e[w];d!==0&&(g<128||g>191||!r(h<<6|g&63,d-6,a(d,h)))&&(d=0,h=t,u+=String.fromCharCode(h)),d===0?(g>=0&&g<=127?(d=0,h=g):g>=192&&g<=223?(d=6*1,h=g&31):g>=224&&g<=239?(d=6*2,h=g&15):g>=240&&g<=247?(d=6*3,h=g&7):(d=0,h=t),d!==0&&!r(h,d,a(d,h))&&(d=0,h=t)):(d-=6,h=h<<6|g&63),d===0&&(h<=65535?u+=String.fromCharCode(h):(u+=String.fromCharCode(55296+(h-65535-1>>10)),u+=String.fromCharCode(56320+(h-65535-1&1023))))}return this.bitsNeeded=d,this.codePoint=h,u};var oe=function(){try{return new ie().decode(new D().encode("test"),{stream:!0})==="test"}catch(e){console.debug("TextDecoder does not support streaming option. Using polyfill instead: "+e)}return!1};(ie==null||D==null||!oe())&&(ie=C);var $=function(){};function J(e){this.withCredentials=!1,this.readyState=0,this.status=0,this.statusText="",this.responseText="",this.onprogress=$,this.onload=$,this.onerror=$,this.onreadystatechange=$,this._contentType="",this._xhr=e,this._sendTimeout=0,this._abort=$}J.prototype.open=function(e,r){this._abort(!0);var a=this,t=this._xhr,u=1,d=0;this._abort=function(l){a._sendTimeout!==0&&(v(a._sendTimeout),a._sendTimeout=0),(u===1||u===2||u===3)&&(u=4,t.onload=$,t.onerror=$,t.onabort=$,t.onprogress=$,t.onreadystatechange=$,t.abort(),d!==0&&(v(d),d=0),l||(a.readyState=4,a.onabort(null),a.onreadystatechange())),u=0};var h=function(){if(u===1){var l=0,S="",Y=void 0;if("contentType"in t)l=200,S="OK",Y=t.contentType;else try{l=t.status,S=t.statusText,Y=t.getResponseHeader("Content-Type")}catch(Ee){l=0,S="",Y=void 0}l!==0&&(u=2,a.readyState=2,a.status=l,a.statusText=S,a._contentType=Y,a.onreadystatechange())}},w=function(){if(h(),u===2||u===3){u=3;var l="";try{l=t.responseText}catch(S){}a.readyState=3,a.responseText=l,a.onprogress()}},g=function(l,S){if((S==null||S.preventDefault==null)&&(S={preventDefault:$}),w(),u===1||u===2||u===3){if(u=4,d!==0&&(v(d),d=0),a.readyState=4,l==="load")a.onload(S);else if(l==="error")a.onerror(S);else if(l==="abort")a.onabort(S);else throw new TypeError;a.onreadystatechange()}},E=function(l){t!=null&&(t.readyState===4?(!("onload"in t)||!("onerror"in t)||!("onabort"in t))&&g(t.responseText===""?"error":"load",l):t.readyState===3?"onprogress"in t||w():t.readyState===2&&h())},y=function(){d=i(function(){y()},500),t.readyState===3&&w()};"onload"in t&&(t.onload=function(l){g("load",l)}),"onerror"in t&&(t.onerror=function(l){g("error",l)}),"onabort"in t&&(t.onabort=function(l){g("abort",l)}),"onprogress"in t&&(t.onprogress=w),"onreadystatechange"in t&&(t.onreadystatechange=function(l){E(l)}),("contentType"in t||!("ontimeout"in c.prototype))&&(r+=(r.indexOf("?")===-1?"?":"&")+"padding=true"),t.open(e,r,!0),"readyState"in t&&(d=i(function(){y()},0))},J.prototype.abort=function(){this._abort(!1)},J.prototype.getResponseHeader=function(e){return this._contentType},J.prototype.setRequestHeader=function(e,r){var a=this._xhr;"setRequestHeader"in a&&a.setRequestHeader(e,r)},J.prototype.getAllResponseHeaders=function(){return this._xhr.getAllResponseHeaders!=null&&this._xhr.getAllResponseHeaders()||""},J.prototype.send=function(){if((!("ontimeout"in c.prototype)||!("sendAsBinary"in c.prototype)&&!("mozAnon"in c.prototype))&&O!=null&&O.readyState!=null&&O.readyState!=="complete"){var e=this;e._sendTimeout=i(function(){e._sendTimeout=0,e.send()},4);return}var r=this._xhr;"withCredentials"in r&&(r.withCredentials=this.withCredentials);try{r.send(void 0)}catch(a){throw a}};function _(e){return e.replace(/[A-Z]/g,function(r){return String.fromCharCode(r.charCodeAt(0)+32)})}function le(e){for(var r=Object.create(null),a=e.split(`\r
`),t=0;t<a.length;t+=1){var u=a[t],d=u.split(": "),h=d.shift(),w=d.join(": ");r[_(h)]=w}this._map=r}le.prototype.get=function(e){return this._map[_(e)]},c!=null&&c.HEADERS_RECEIVED==null&&(c.HEADERS_RECEIVED=2);function ve(){}ve.prototype.open=function(e,r,a,t,u,d,h){e.open("GET",u);var w=0;e.onprogress=function(){var E=e.responseText,y=E.slice(w);w+=y.length,a(y)},e.onerror=function(E){E.preventDefault(),t(new Error("NetworkError"))},e.onload=function(){t(null)},e.onabort=function(){t(null)},e.onreadystatechange=function(){if(e.readyState===c.HEADERS_RECEIVED){var E=e.status,y=e.statusText,l=e.getResponseHeader("Content-Type"),S=e.getAllResponseHeaders();r(E,y,l,new le(S))}},e.withCredentials=d;for(var g in h)Object.prototype.hasOwnProperty.call(h,g)&&e.setRequestHeader(g,h[g]);return e.send(),e};function k(e){this._headers=e}k.prototype.get=function(e){return this._headers.get(e)};function he(){}he.prototype.open=function(e,r,a,t,u,d,h){var w=null,g=new T,E=g.signal,y=new ie;return F(u,{headers:h,credentials:d?"include":"same-origin",signal:E,cache:"no-store"}).then(function(l){return w=l.body.getReader(),r(l.status,l.statusText,l.headers.get("Content-Type"),new k(l.headers)),new B(function(S,Y){var Ee=function(){w.read().then(function(K){if(K.done)S(void 0);else{var P=y.decode(K.value,{stream:!0});a(P),Ee()}}).catch(function(K){Y(K)})};Ee()})}).catch(function(l){if(l.name!=="AbortError")return l}).then(function(l){t(l)}),{abort:function(){w!=null&&w.cancel(),g.abort()}}};function te(){this._listeners=Object.create(null)}function we(e){i(function(){throw e},0)}te.prototype.dispatchEvent=function(e){e.target=this;var r=this._listeners[e.type];if(r!=null)for(var a=r.length,t=0;t<a;t+=1){var u=r[t];try{typeof u.handleEvent=="function"?u.handleEvent(e):u.call(this,e)}catch(d){we(d)}}},te.prototype.addEventListener=function(e,r){e=String(e);var a=this._listeners,t=a[e];t==null&&(t=[],a[e]=t);for(var u=!1,d=0;d<t.length;d+=1)t[d]===r&&(u=!0);u||t.push(r)},te.prototype.removeEventListener=function(e,r){e=String(e);var a=this._listeners,t=a[e];if(t!=null){for(var u=[],d=0;d<t.length;d+=1)t[d]!==r&&u.push(t[d]);u.length===0?delete a[e]:a[e]=u}};function ne(e){this.type=e,this.target=void 0}function Se(e,r){ne.call(this,e),this.data=r.data,this.lastEventId=r.lastEventId}Se.prototype=Object.create(ne.prototype);function pe(e,r){ne.call(this,e),this.status=r.status,this.statusText=r.statusText,this.headers=r.headers}pe.prototype=Object.create(ne.prototype);function ge(e,r){ne.call(this,e),this.error=r.error}ge.prototype=Object.create(ne.prototype);var s=-1,f=0,o=1,p=2,R=-1,m=0,I=1,L=2,be=3,qe=/^text\/event\-stream(;.*)?$/i,Je=1e3,ze=18e6,Fe=function(e,r){var a=e==null?r:parseInt(e,10);return a!==a&&(a=r),_e(a)},_e=function(e){return Math.min(Math.max(e,Je),ze)},se=function(e,r,a){try{typeof r=="function"&&r.call(e,a)}catch(t){we(t)}};function z(e,r){te.call(this),r=r||{},this.onopen=void 0,this.onmessage=void 0,this.onerror=void 0,this.url=void 0,this.readyState=void 0,this.withCredentials=void 0,this.headers=void 0,this._close=void 0,Qe(this,e,r)}function We(){return c!=null&&"withCredentials"in c.prototype||H==null?new c:new H}var Ye=F!=null&&ue!=null&&"body"in ue.prototype;function Qe(e,r,a){r=String(r);var t=Boolean(a.withCredentials),u=a.lastEventIdQueryParameterName||"lastEventId",d=_e(1e3),h=Fe(a.heartbeatTimeout,45e3),w="",g=d,E=!1,y=0,l=a.headers||{},S=a.Transport,Y=Ye&&S==null?void 0:new J(S!=null?new S:We()),Ee=S!=null&&typeof S!="string"?new S:Y==null?new he:new ve,K=void 0,P=0,q=s,fe="",Te="",Q="",Ce="",j=m,Me=0,ae=0,Ze=function(N,A,G,X){if(q===f)if(N===200&&G!=null&&qe.test(G)){q=o,E=Date.now(),g=d,e.readyState=o;var U=new pe("open",{status:N,statusText:A,headers:X});e.dispatchEvent(U),se(e,e.onopen,U)}else{var M="";N!==200?(A&&(A=A.replace(/\s+/g," ")),M="EventSource's response has a status "+N+" "+A+" that is not 200. Aborting the connection."):M="EventSource's response has a Content-Type specifying an unsupported type: "+(G==null?"-":G.replace(/\s+/g," "))+". Aborting the connection.",Ve();var U=new pe("error",{status:N,statusText:A,headers:X});e.dispatchEvent(U),se(e,e.onerror,U),console.error(M)}},et=function(N){if(q===o){for(var A=-1,G=0;G<N.length;G+=1){var X=N.charCodeAt(G);(X===`
`.charCodeAt(0)||X==="\r".charCodeAt(0))&&(A=G)}var U=(A!==-1?Ce:"")+N.slice(0,A+1);Ce=(A===-1?Ce:"")+N.slice(A+1),N!==""&&(E=Date.now(),y+=N.length);for(var M=0;M<U.length;M+=1){var X=U.charCodeAt(M);if(j===R&&X===`
`.charCodeAt(0))j=m;else if(j===R&&(j=m),X==="\r".charCodeAt(0)||X===`
`.charCodeAt(0)){if(j!==m){j===I&&(ae=M+1);var Z=U.slice(Me,ae-1),ee=U.slice(ae+(ae<M&&U.charCodeAt(ae)===" ".charCodeAt(0)?1:0),M);Z==="data"?(fe+=`
`,fe+=ee):Z==="id"?Te=ee:Z==="event"?Q=ee:Z==="retry"?(d=Fe(ee,d),g=d):Z==="heartbeatTimeout"&&(h=Fe(ee,h),P!==0&&(v(P),P=i(function(){ye()},h)))}if(j===m){if(fe!==""){w=Te,Q===""&&(Q="message");var de=new Se(Q,{data:fe.slice(1),lastEventId:Te});if(e.dispatchEvent(de),Q==="open"?se(e,e.onopen,de):Q==="message"?se(e,e.onmessage,de):Q==="error"&&se(e,e.onerror,de),q===p)return}fe="",Q=""}j=X==="\r".charCodeAt(0)?R:m}else j===m&&(Me=M,j=I),j===I?X===":".charCodeAt(0)&&(ae=M+1,j=L):j===L&&(j=be)}}},Pe=function(N){if(q===o||q===f)q=s,P!==0&&(v(P),P=0),P=i(function(){ye()},g),g=_e(Math.min(d*16,g*2)),e.readyState=f;else if(q===p&&N!=null){console.error(N);var A=new ge("error",{error:N});e.dispatchEvent(A),se(e,e.onerror,A)}},Ve=function(){q=p,K!=null&&(K.abort(),K=void 0),P!==0&&(v(P),P=0),e.readyState=p},ye=function(){if(P=0,q!==s){if(!E&&K!=null)Pe(new Error("No activity within "+h+" milliseconds. "+(q===f?"No response received.":y+" chars received.")+" Reconnecting.")),K!=null&&(K.abort(),K=void 0);else{var N=Math.max((E||Date.now())+h-Date.now(),1);E=!1,P=i(function(){ye()},N)}return}E=!1,y=0,P=i(function(){ye()},h),q=f,fe="",Q="",Te=w,Ce="",Me=0,ae=0,j=m;var A=r;if(r.slice(0,5)!=="data:"&&r.slice(0,5)!=="blob:"&&w!==""){var G=r.indexOf("?");A=G===-1?r:r.slice(0,G+1)+r.slice(G+1).replace(/(?:^|&)([^=&]*)(?:=[^&]*)?/g,function(ee,de){return de===u?"":ee}),A+=(r.indexOf("?")===-1?"?":"&")+u+"="+encodeURIComponent(w)}var X=e.withCredentials,U={};U.Accept="text/event-stream";var M=e.headers;if(M!=null)for(var Z in M)Object.prototype.hasOwnProperty.call(M,Z)&&(U[Z]=M[Z]);try{K=Ee.open(Y,Ze,et,Pe,A,X,U)}catch(ee){throw Ve(),ee}};e.url=r,e.readyState=f,e.withCredentials=t,e.headers=l,e._close=Ve,ye()}z.prototype=Object.create(te.prototype),z.prototype.CONNECTING=f,z.prototype.OPEN=o,z.prototype.CLOSED=p,z.prototype.close=function(){this._close()},z.CONNECTING=f,z.OPEN=o,z.CLOSED=p,z.prototype.withCredentials=void 0;var Le=b;c!=null&&(b==null||!("withCredentials"in b.prototype))&&(Le=z),function(e){if(typeof Oe=="object"&&typeof Oe.exports=="object"){var r=e(ke);r!==void 0&&(Oe.exports=r)}else typeof define=="function"&&define.amd?define(["exports"],e):e(n)}(function(e){e.EventSourcePolyfill=z,e.NativeEventSource=b,e.EventSource=Le})})(typeof globalThis=="undefined"?typeof window!="undefined"?window:typeof self!="undefined"?self:ke:globalThis)});var vt={};ft(vt,{Event:()=>V,initialize:()=>Xe});function He(n){this.message=n}He.prototype=new Error,He.prototype.name="InvalidCharacterError";var je=typeof window!="undefined"&&window.atob&&window.atob.bind(window)||function(n){var i=String(n).replace(/=+$/,"");if(i.length%4==1)throw new He("'atob' failed: The string to be decoded is not correctly encoded.");for(var v,c,H=0,x=0,b="";c=i.charAt(x++);~c&&(v=H%4?64*v+c:c,H++%4)?b+=String.fromCharCode(255&v>>(-2*H&6)):0)c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(c);return b};function ut(n){var i=n.replace(/-/g,"+").replace(/_/g,"/");switch(i.length%4){case 0:break;case 2:i+="==";break;case 3:i+="=";break;default:throw"Illegal base64url string!"}try{return function(v){return decodeURIComponent(je(v).replace(/(.)/g,function(c,H){var x=H.charCodeAt(0).toString(16).toUpperCase();return x.length<2&&(x="0"+x),"%"+x}))}(i)}catch(v){return je(i)}}function Ae(n){this.message=n}function lt(n,i){if(typeof n!="string")throw new Ae("Invalid token specified");var v=(i=i||{}).header===!0?0:1;try{return JSON.parse(ut(n.split(".")[v]))}catch(c){throw new Ae("Invalid token specified: "+c.message)}}Ae.prototype=new Error,Ae.prototype.name="InvalidTokenError";var Ue=lt;function Be(n){return{all:n=n||new Map,on:function(i,v){var c=n.get(i);c&&c.push(v)||n.set(i,[v])},off:function(i,v){var c=n.get(i);c&&c.splice(c.indexOf(v)>>>0,1)},emit:function(i,v){(n.get(i)||[]).slice().map(function(c){c(v)}),(n.get("*")||[]).slice().map(function(c){c(i,v)})}}}var Ge=ct($e());var V;(function(n){n.READY="ready",n.CONNECTED="connected",n.DISCONNECTED="disconnected",n.CHANGED="changed",n.ERROR="error"})(V||(V={}));var Ke={debug:!1,baseUrl:"https://config.ff.harness.io/api/1.0",eventUrl:"https://events.ff.harness.io/api/1.0",streamEnabled:!0,allAttributesPrivate:!1,privateAttributeNames:[]},ce=(n,...i)=>console.error(`[FF-SDK] ${n}`,...i),De=30*1e3;var ht="1.4.13",pt=500,Ne=globalThis.fetch,gt=Ge.EventSourcePolyfill,me=!!globalThis.Proxy,xe=n=>{let{value:i}=n;try{switch(n.kind.toLowerCase()){case"int":case"number":i=Number(i);break;case"boolean":i=i.toString().toLowerCase()==="true";break;case"json":i=JSON.parse(i);break}}catch(v){ce(v)}return i},Xe=(n,i,v)=>{let c=!1,H,x,b,O,B,F=!0,ue=()=>{F=!1},ie=()=>{F=!0},D=[],T=Be(),W=re(re({},Ke),v),C=(s,...f)=>{W.debug&&console.debug(`[FF-SDK] ${s}`,...f)},oe=s=>{if(F){let f=Date.now();f-s.lastAccessed>pt&&(s.count++,s.lastAccessed=f)}};globalThis.onbeforeunload=()=>{D.length&&globalThis.localStorage&&(ue(),globalThis.localStorage.HARNESS_FF_METRICS=JSON.stringify(D),ie())};let $=(s,f)=>Ie(void 0,null,function*(){return(yield(yield Ne(`${f.baseUrl}/client/auth`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:s,target:i})})).json()).authToken}),J=()=>{if(D.length){C("Sending metrics...",{metrics:D,evaluations:_});let s={metricsData:D.map(f=>({timestamp:Date.now(),count:f.count,metricsType:"FFMETRICS",attributes:[{key:"featureIdentifier",value:f.featureIdentifier},{key:"featureName",value:f.featureIdentifier},{key:"variationIdentifier",value:f.variationIdentifier},{key:"target",value:i.identifier},{key:"SDK_NAME",value:"JavaScript"},{key:"SDK_LANGUAGE",value:"JavaScript"},{key:"SDK_TYPE",value:"client"},{key:"SDK_VERSION",value:ht}]}))};Ne(`${W.eventUrl}/metrics/${H}?cluster=${x}`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${O}`},body:JSON.stringify(s)}).then(()=>{D=[]}).catch(f=>{C(f)}).finally(()=>{B=window.setTimeout(J,De)})}else B=window.setTimeout(J,De)},_={},le=s=>{C("Sending event for",s.flag),me?T.emit(V.CHANGED,new Proxy(s,{get(f,o){var p;if(f.hasOwnProperty(o)&&o==="value"){let R=f.flag,m=s.value,I=D.find(L=>L.featureIdentifier===R&&L.featureValue===m);I?(oe(I),I.variationIdentifier=((p=_[R])==null?void 0:p.identifier)||""):D.push({featureIdentifier:R,featureValue:String(m),variationIdentifier:_[R].identifier||"",count:F?1:0,lastAccessed:Date.now()}),C("Metrics event: Flag",o,"has been read with value via stream update",m)}return o==="value"?xe(s):s[o]}})):T.emit(V.CHANGED,{deleted:s.deleted,flag:s.flag,value:xe(s)})},ve=function(){return me?new Proxy({},{get(s,f){var p,R,m;let o=s[f];if(s.hasOwnProperty(f)){let I=s[f],L=D.find(be=>be.featureIdentifier===f&&I===be.featureValue);L?(L.variationIdentifier=((p=_[f])==null?void 0:p.identifier)||"",oe(L)):D.push({featureIdentifier:f,featureValue:I,variationIdentifier:((R=_[f])==null?void 0:R.identifier)||"",count:F?1:0,lastAccessed:Date.now()}),C("Metrics event: Flag:",f,"has been read with value:",I,"variationIdentifier:",(m=_[f])==null?void 0:m.identifier)}return o}}):{}},k=ve();$(n,W).then(s=>{if(c)return;O=s;let f=Ue(s);if(C("Authenticated",f),globalThis.localStorage&&globalThis.localStorage.HARNESS_FF_METRICS)try{delete globalThis.localStorage.HARNESS_FF_METRICS,C("Picking up metrics from previous session")}catch(o){}B=window.setTimeout(J,De),H=f.environment,x=f.clusterIdentifier,he().then(()=>{C("Fetch all flags ok",k)}).then(()=>{c||we()}).then(()=>{c||(C("Event stream ready",{storage:k}),T.emit(V.READY,re({},k)),me||Object.keys(k).forEach(o=>{var p;D.push({featureIdentifier:o,featureValue:k[o],variationIdentifier:((p=_[o])==null?void 0:p.identifier)||"",count:F?1:0,lastAccessed:Date.now()})}))}).catch(o=>{T.emit(V.ERROR,o)})}).catch(s=>{ce("Authentication error: ",s),T.emit(V.ERROR,s)});let he=()=>Ie(void 0,null,function*(){try{(yield(yield Ne(`${W.baseUrl}/client/env/${H}/target/${i.identifier}/evaluations?cluster=${x}`,{headers:{Authorization:`Bearer ${O}`}})).json()).forEach(o=>{let p=xe(o),R=k[o.flag];p!==R&&(C("Flag variation has changed for ",o.identifier),k[o.flag]=p,_[o.flag]=re(re({},o),{value:p}),le(o))})}catch(s){return ce("Features fetch operation error: ",s),T.emit(V.ERROR,s),s}}),te=s=>Ie(void 0,null,function*(){var f;try{let o=yield Ne(`${W.baseUrl}/client/env/${H}/target/${i.identifier}/evaluations/${s}?cluster=${x}`,{headers:{Authorization:`Bearer ${O}`}});if(o.ok){let p=yield o.json(),R=xe(p);if(ue(),k[s]=R,_[s]=re(re({},p),{value:R}),ie(),le(p),!me){let m=p.flag,I=D.find(L=>L.featureIdentifier===m&&L.featureValue===p.value);I?(oe(I),I.variationIdentifier=((f=_[m])==null?void 0:f.identifier)||""):D.push({featureIdentifier:m,featureValue:String(p.value),variationIdentifier:_[m].identifier||"",count:F?1:0,lastAccessed:Date.now()})}}else T.emit(V.ERROR,o)}catch(o){ce("Feature fetch operation error: ",o),T.emit(V.ERROR,o)}}),we=()=>{if(!W.streamEnabled){C("Stream is disabled by configuration. Note: Polling is not yet supported");return}b=new gt(`${W.baseUrl}/stream?cluster=${x}`,{headers:{Authorization:`Bearer ${O}`,"API-Key":n}}),b.onopen=o=>{C("Stream connected",o),T.emit(V.CONNECTED)},b.onclose=o=>{C("Stream disconnected"),T.emit(V.DISCONNECTED)},b.onerror=o=>{ce("Stream has issue",o),T.emit(V.ERROR,o)};let s=o=>{switch(o.event){case"create":setTimeout(()=>te(o.identifier),1e3);break;case"patch":te(o.identifier);break;case"delete":delete k[o.identifier],T.emit(V.CHANGED,{flag:o.identifier,value:void 0,deleted:!0}),C("Evaluation deleted",{message:o,storage:k});break}},f=o=>{o.event==="patch"&&he()};b.addEventListener("*",o=>{let p=JSON.parse(o.data);C("Received event from stream: ",p),p.domain==="flag"?s(p):p.domain==="target-segment"&&f(p)})},ne=(s,f)=>T.on(s,f),Se=(s,f)=>{s?T.off(s,f):ge()},pe=(s,f)=>{var p;let o=k[s];if(!me&&o!==void 0){let R=o,m=s,I=D.find(L=>L.featureIdentifier===m&&L.featureValue===R);I?(oe(I),I.variationIdentifier=((p=_[m])==null?void 0:p.identifier)||""):D.push({featureIdentifier:m,featureValue:R,count:F?1:0,variationIdentifier:_[m].identifier||"",lastAccessed:Date.now()})}return o!==void 0?o:f},ge=()=>{c=!0,C("Closing event stream"),k=ve(),_={},clearTimeout(B),T.all.clear(),typeof(b==null?void 0:b.close)=="function"&&b.close()};return{on:ne,off:Se,variation:pe,close:ge}};return vt;})();
/** @license
 * eventsource.js
 * Available under MIT License (MIT)
 * https://github.com/Yaffle/EventSource/
 */
