(window.webpackJsonp=window.webpackJsonp||[]).push([[1],[,function(t,e,n){"use strict";n.r(e);var r=n(4),o=n.n(r),i=n(2);let c=document.getElementById("imageLoader");c.addEventListener("change",(function(t){let e=new FileReader;e.onload=function(t){let e=new Image;e.onload=()=>{s.width=160,s.height=160/e.width*e.height,a.drawImage(e,0,0,s.width,s.height)},e.src=t.target.result},e.readAsDataURL(t.target.files[0])}),!1);let s=document.getElementById("imageCanvas"),a=s.getContext("2d"),l=!1,u=document.getElementById("loading"),d=document.getElementById("colorSlider"),g=document.getElementById("numColors"),h=document.getElementById("uploadBtn"),w=document.getElementById("renderBtn"),f=document.getElementById("settInfo"),_=document.getElementById("sideBar"),p=7,m=!1,y=null,b=null,I=null;async function k(){let t=a.getImageData(0,0,s.width,s.height).data;console.log("Got image data: ",t);let e=new i.a(t);console.log("made new tartan generator"),y=e.make_sett(p,64),b=y.get_sett_per_thread(),console.log(`made sett with ${y.get_count()} colors`);let n="[";for(let t=0;t<p;t++){let e=y.get_color(t);n+="\n  {",n+=`\n    r: ${e.get_r()}, `,n+=`\n    g: ${e.get_g()}, `,n+=`\n    b: ${e.get_b()}, `,n+="\n    count: "+e.get_count(),n+="\n  }",t!=p-1&&(n+=",")}n+="\n]",console.log("colors: ",n),m=!0,I&&I.draw()}function v(t){let e=t?I.width:I.height,n=t?I.height:I.width;for(let r=0;r<e/2;r++){let e=r%4-(t?2.5:1.5),o=r%b.get_count(),i=b.get_color(o);I.stroke(i.get_r(),i.get_g(),i.get_b());for(let o=e;o<n/2;o+=4){let e=t?r:o,n=t?o:r;I.line(2*e,2*n,2*(e+(t?0:2)),2*(n+(t?2:0)))}}}function E(){I&&m?(console.log("Drawing Sett"),I.strokeWeight(2),I.strokeCap(I.SQUARE),v(!0),v(!1),u&&(u.style.visibility="hidden")):I?console.warn("Attempted to draw tartan without sett"):m?console.warn("Attempted to draw tartan without p5 instance"):console.warn("Attempted to draw tartan without sett or p5 instance")}!function(){let t=new Image;p=d.value,C(),t.onload=()=>{s.width=160,s.height=160/t.width*t.height,a.drawImage(t,0,0,s.width,s.height),setTimeout(k,15)},t.src="./media/kandinsky.jpg"}();function x(t,e,n){let r=[t.toString(16),e.toString(16),n.toString(16)];for(let t in r)1==r[t].length&&(r[t]="0"+r[t]);return`#${r[0]}${r[1]}${r[2]}`}function C(){u&&(u.style.width=window.innerWidth-200+"px",u.style.visibility="visible")}new o.a(t=>{I=t,I.setup=()=>{I.createCanvas(I.windowWidth,I.windowHeight),I.noLoop(),I.draw()},I.windowResized=()=>{I.resizeCanvas(I.windowWidth,I.windowHeight),I.draw()},I.draw=()=>{I.background(255),E(),function(){if(f&&m){for(;f.hasChildNodes();)f.removeChild(f.firstChild);for(let t=0;t<p;t++){let e=y.get_color(t),n=x(e.get_r(),e.get_g(),e.get_b()),r=e.get_count(),o=document.createElement("DIV"),i=document.createElement("DIV");o.className="settItem",o.id="settItem"+t,i.className="settItemTxt",i.innerText=`${n}: ${r}`,o.style.backgroundColor=n,i.style.color=e.get_r()+e.get_g()+e.get_b()>382?"#000":"#fff",o.appendChild(i),f.appendChild(o)}_.scrollHeight>_.clientHeight&&l?(_.style.paddingRight="15px",_.style.outline="none"):(_.style.paddingRight=null,_.style.outline=null)}}()}}),g.innerText=d.value,d.oninput=()=>{g.innerText=d.value,p=d.value},w.onclick=()=>{C(),setTimeout(k,5)},h.onclick=()=>{c.click()},window.addEventListener("load",()=>{let t=Array.prototype.slice.call(window.getComputedStyle(document.documentElement,"")).join("").match(/-(moz|webkit|ms)-/)[1];l="webkit"==t})},function(t,e,n){"use strict";(function(t){n.d(e,"a",(function(){return b})),n.d(e,"g",(function(){return I})),n.d(e,"h",(function(){return k})),n.d(e,"d",(function(){return v})),n.d(e,"f",(function(){return E})),n.d(e,"b",(function(){return x})),n.d(e,"c",(function(){return C})),n.d(e,"e",(function(){return B})),n.d(e,"i",(function(){return T}));var r=n(3);const o=new Array(32).fill(void 0);function i(t){return o[t]}o.push(void 0,null,!0,!1);let c=o.length;function s(t){const e=i(t);return function(t){t<36||(o[t]=c,c=t)}(t),e}let a,l=new("undefined"==typeof TextDecoder?(0,t.require)("util").TextDecoder:TextDecoder)("utf-8",{ignoreBOM:!0,fatal:!0});function u(){return 0===a.byteLength&&(a=new Uint8Array(r.k.buffer)),a}function d(t,e){return l.decode(u().subarray(t,t+e))}function g(t){c===o.length&&o.push(o.length+1);const e=c;return c=o[e],o[e]=t,e}l.decode();let h=0;let w=new("undefined"==typeof TextEncoder?(0,t.require)("util").TextEncoder:TextEncoder)("utf-8");const f="function"==typeof w.encodeInto?function(t,e){return w.encodeInto(t,e)}:function(t,e){const n=w.encode(t);return e.set(n),{read:t.length,written:n.length}};let _;function p(){return 0===_.byteLength&&(_=new Int32Array(r.k.buffer)),_}class m{static __wrap(t){const e=Object.create(m.prototype);return e.ptr=t,e}__destroy_into_raw(){const t=this.ptr;return this.ptr=0,t}free(){const t=this.__destroy_into_raw();r.a(t)}get_r(){return r.j(this.ptr)}get_g(){return r.i(this.ptr)}get_b(){return r.g(this.ptr)}get_count(){return r.h(this.ptr)>>>0}}class y{static __wrap(t){const e=Object.create(y.prototype);return e.ptr=t,e}__destroy_into_raw(){const t=this.ptr;return this.ptr=0,t}free(){const t=this.__destroy_into_raw();r.b(t)}get_count(){return r.m(this.ptr)>>>0}get_color(t){const e=r.l(this.ptr,t);return 0===e?void 0:m.__wrap(e)}get_num_threads(){return r.n(this.ptr)>>>0}get_sett_per_thread(){const t=r.o(this.ptr);return y.__wrap(t)}}class b{static __wrap(t){const e=Object.create(b.prototype);return e.ptr=t,e}__destroy_into_raw(){const t=this.ptr;return this.ptr=0,t}free(){const t=this.__destroy_into_raw();r.c(t)}constructor(t){const e=function(t,e){const n=e(1*t.length);return u().set(t,n/1),h=t.length,n}(t,r.e),n=h,o=r.q(e,n);return b.__wrap(o)}make_sett(t,e){const n=r.p(this.ptr,t,e);return y.__wrap(n)}}function I(t){s(t)}function k(t,e){return g(d(t,e))}function v(){return g(new Error)}function E(t,e){const n=function(t,e,n){if(void 0===n){const n=w.encode(t),r=e(n.length);return u().subarray(r,r+n.length).set(n),h=n.length,r}let r=t.length,o=e(r);const i=u();let c=0;for(;c<r;c++){const e=t.charCodeAt(c);if(e>127)break;i[o+c]=e}if(c!==r){0!==c&&(t=t.slice(c)),o=n(o,r,r=c+3*t.length);const e=u().subarray(o+c,o+r);c+=f(t,e).written}return h=c,o}(i(e).stack,r.e,r.f),o=h;p()[t/4+1]=o,p()[t/4+0]=n}function x(t,e){try{console.error(d(t,e))}finally{r.d(t,e)}}function C(t){console.log(i(t))}const B="function"==typeof Math.random?Math.random:(A="Math.random",()=>{throw new Error(A+" is not defined")});var A;function T(t,e){throw new Error(d(t,e))}_=new Int32Array(r.k.buffer),a=new Uint8Array(r.k.buffer)}).call(this,n(6)(t))},function(t,e,n){"use strict";var r=n.w[t.i];t.exports=r;n(2);r.r()}]]);