var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,c,d){a!=Array.prototype&&a!=Object.prototype&&(a[c]=d.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX="jscomp_symbol_";
$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};$jscomp.Symbol=function(){var a=0;return function(c){return $jscomp.SYMBOL_PREFIX+(c||"")+a++}}();
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var a=$jscomp.global.Symbol.iterator;a||(a=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));"function"!=typeof Array.prototype[a]&&$jscomp.defineProperty(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return $jscomp.arrayIterator(this)}});$jscomp.initSymbolIterator=function(){}};$jscomp.arrayIterator=function(a){var c=0;return $jscomp.iteratorPrototype(function(){return c<a.length?{done:!1,value:a[c++]}:{done:!0}})};
$jscomp.iteratorPrototype=function(a){$jscomp.initSymbolIterator();a={next:a};a[$jscomp.global.Symbol.iterator]=function(){return this};return a};$jscomp.iteratorFromArray=function(a,c){$jscomp.initSymbolIterator();a instanceof String&&(a+="");var d=0,f={next:function(){if(d<a.length){var h=d++;return{value:c(h,a[h]),done:!1}}f.next=function(){return{done:!0,value:void 0}};return f.next()}};f[Symbol.iterator]=function(){return f};return f};
$jscomp.polyfill=function(a,c,d,f){if(c){d=$jscomp.global;a=a.split(".");for(f=0;f<a.length-1;f++){var h=a[f];h in d||(d[h]={});d=d[h]}a=a[a.length-1];f=d[a];c=c(f);c!=f&&null!=c&&$jscomp.defineProperty(d,a,{configurable:!0,writable:!0,value:c})}};$jscomp.polyfill("Array.prototype.keys",function(a){return a?a:function(){return $jscomp.iteratorFromArray(this,function(a){return a})}},"es6","es3");
$jscomp.findInternal=function(a,c,d){a instanceof String&&(a=String(a));for(var f=a.length,h=0;h<f;h++){var l=a[h];if(c.call(d,l,h,a))return{i:h,v:l}}return{i:-1,v:void 0}};$jscomp.polyfill("Array.prototype.find",function(a){return a?a:function(a,d){return $jscomp.findInternal(this,a,d).v}},"es6","es3");
(function(){function a(c,d,f){function h(b,q){if(!d[b]){if(!c[b]){var k="function"==typeof require&&require;if(!q&&k)return k(b,!0);if(l)return l(b,!0);q=Error("Cannot find module '"+b+"'");throw q.code="MODULE_NOT_FOUND",q;}q=d[b]={exports:{}};c[b][0].call(q.exports,function(a){return h(c[b][1][a]||a)},q,q.exports,a,c,d,f)}return d[b].exports}for(var l="function"==typeof require&&require,k=0;k<f.length;k++)h(f[k]);return h}return a})()({1:[function(a,c,d){a("./sliders.js");"serviceWorker"in navigator&&
navigator.serviceWorker.register("/sw.js").catch(function(a){console.error("Error registering service worker",a)})},{"./sliders.js":3}],2:[function(a,c,d){function f(b,a){principle=("e"==a?b.VCOE:b.VCOF)*(1-b.FPE/100);interest=b.FLR/1200;b=12*b.FLT;if(0==interest)return principle/b;b=Math.pow(1+interest,b);return principle*interest*b/(b-1)}function h(b,a){return("e"==a?b.VCOE:b.VCOF)*Math.pow(1-("e"==a?b.FDE:b.FDD)/100,b.VDU)/Math.pow(1+b.FRI/1200,12*b.VDU+1)}var l="DR DRD VDU FLR FLT FPE FIF FRI VCOE VM RER REE MEC MEO FDE FBR VBL VBCO VCOF VDM RFR RFE MFC MFO FDD".split(" "),
k={};$(document).ready(function(){l.forEach(function(b){k[b]=$(".graph-row[variate-key\x3d"+b+"] input[type\x3drange]")})});c.exports={getAnswers:function(b){b=b||{};Object.keys(k).forEach(function(a){var p=b,e=parseFloat,m=b[a],x=k[a].val();p[a]=e("undefined"!=typeof m?m:x)*(parseInt(k[a].attr("scale"))||1)});for(var a=b.DR*b.DRD,c=b.VBL,d=b.VCOE*b.FPE/100,l=b.VCOE-d,u=f(b,"e"),p=b.VCOF*b.FPE/100,G=b.VCOF-p,e=f(b,"f"),m=12*b.FLT,x=12*b.VDU,r=d,g=p,C=0,D=[],y=[],z=[],t=-1,n=1;n<=x;n++){var v=Math.pow(1+
b.FRI/1200,n),E=b.DR*b.DRD*(b.VM*b.RER*Math.pow(1+b.REE/1200,n)+(b.MEC+b.MEO)*Math.pow(1+b.FIF/1200,n))/v,F=b.DR*b.DRD*(b.RFR*Math.pow(1+b.RFE/1200,n)/b.VDM+(b.MFC+b.MFO)*Math.pow(1+b.FIF/1200,n))/v;r+=E;g+=F;y.push(E);z.push(F);n<=m&&(r+=u/v,g+=e/v);0>=c&&(c=b.VBCO*Math.pow(1-b.FBR/1200,n)/v,C+=c,r+=c,c=b.VBL,D.push(n));c-=a;r<=g&&-1==t?t=n:r>g&&(t=-1)}a=h(b,"e");n=h(b,"f");r-=a;g-=n;r<=g&&-1==t&&(t=x+1);y=y.map(Math.round);z=z.map(Math.round);return{emiMonths:m,_s:"",evNpv:r,evLoanAmount:l,evDownPayment:d,
evEmi:u,batteryMonths:D,batteryReplaceMentCost:C,evSalvage:a,evPvis:y,__s:"",fossilNpv:g,fossilLoanAmount:G,fossilDownPayment:p,fossilEmi:e,fossilSalvage:n,fossilPvis:z,___s:"",savings:Math.round(g-r),payback:t}}}},{}],3:[function(a,c,d){function f(a){var b=100/a.data.length,e=-Infinity;a.data.forEach(function(a){a.val>e&&(e=a.val)});var p=Math.abs(100/e);return a.data.map(function(e,m){var c=Math.max(0,e.val*p);return'\x3cdiv style\x3d"width:'+b+'%;" class\x3d"column" data-id\x3d"'+a.dataId+'" range\x3d"'+
e.range+'"\x3e\x3cdiv style\x3d"bottom:'+c+'%;" class\x3d"column-value-display" value\x3d"'+e.val+'"\x3e\u20b9 \x3cspan\x3e'+e.val+"\x3c/span\x3e\x3c/div\x3e"+(0==m||m==a.data.length-1?'\x3cdiv style\x3d"bottom:'+c+'%;" class\x3d"column-value-display-terminal" value\x3d"'+e.val+'"\x3e\u20b9 \x3cspan\x3e'+e.val+"\x3c/span\x3e\x3c/div\x3e":"")+'\x3cdiv style\x3d"height:'+c+'%;" class\x3d"column-value" value\x3d"'+e.val+'"\x3e\x3c/div\x3e\x3c/div\x3e'})}function h(a){var b=parseFloat(a.input.attr("min")),
e=parseFloat(a.input.attr("max")),p=[],c=parseFloat(a.input.attr("step"));e=(e-b)/a.numSteps;for(var d=0;d<a.numSteps;d++){var g=c*Math.round((d*e+e/2+b)/c),f={};f[a.variateKey]=g;p.push({range:g,val:w.getAnswers(f).savings})}return p}function l(a){var b=$(".chart-container[data-id\x3d"+a+"]"),e=b.children();if(e.length){a=$("input[type\x3drange][data-id\x3d"+a+"]");var m=a.attr("max"),c=a.attr("min");a=(a.val()-c)/(m-c);a=Math.min(Math.floor(a*e.length),e.length-1);b.find(".active").removeClass("active");
b.find(".adjacent").removeClass("adjacent");$(e[a]).addClass("active").find(".column-value-display span").text($("#net-savings span").text());0<a&&$(e[a-1]).addClass("adjacent");a<e.length-1&&$(e[a+1]).addClass("adjacent")}}function k(a){var b=$("input[type\x3drange][data-id\x3d"+a+"]");a=b.parent().children(".input-value-display");a.children("span").text(b.val());var e=a.outerWidth(),m=b.attr("max")-b.attr("min");b=Math.round(b.parent().width()*(b.val()-b.attr("min"))/m-e/2);a.css("left",b+"px")}
function b(a,c){var e=a.graph.attr("data-id");clearTimeout(u[e]);var m=a.graph,d=B.scrollTop(),p=d+B.height(),g=m.offset().top;m=g+m.height();m<=p&&m>=d||g<=p&&g>=d||c?(a.graph.html(f({data:h({numSteps:a.numSteps||31,input:a.targetInput,variateKey:a.targetInput.attr("variate-key")}),dataId:e})),l(e)):u[e]=setTimeout(b,1E3,a,!0)}function q(a){a=a||{};$(".chart-group-container").each(function(){var c=$(this);c.attr("data-id")==a.dataId||a.context&&c.attr("context")!=a.context||b({graph:c.children(".chart-container"),
targetInput:c.children("input[type\x3drange]")})})}function A(a){$("#net-savings span").text(a.savings);$("#payback-period span").text(-1==a.payback?"N/A":a.payback)}var w=a("./math.js"),B=$(window),u={};$(document).ready(function(){function a(a){if(a.val()!=a.attr("lastHandledValue")){var b=a.attr("data-id");$(".coupled-input[data-id\x3d"+a.attr("data-id")+"]").val(a.val());$(".coupled-input[data-id\x3d"+a.attr("data-id")+"]").attr("lastHandledValue",a.val());var e=w.getAnswers();A(e);q({dataId:b,
context:a.attr("context")});l(b);k(b);$(".graph-row[context\x3d"+a.attr("context")+"] .column.active .column-value-display span").text(e.savings)}}var b=0;$(".graph-row").each(function(){function a(a){if(l||"click"==a.type){a=0===a.type.indexOf("touch")?a.originalEvent.touches[0].pageX:a.pageX;a=Math.max(0,Math.min(g.width(),a-g.offset().left));var b=parseFloat(k.attr("min"))||0,c=(parseFloat(k.attr("max"))||0)-b;k.val(b+c*a/g.width()).change()}}function c(a){if(a||0===a){var b=parseFloat(k.attr("min"))||
0,e=(parseFloat(k.attr("max"))||0)-b,d=h.outerWidth();a=g.width()*(a-b)/e;d=Math.max(d/-2,Math.min(g.width()-d/2,a-d/2));h.css("left",d+"px")}else setTimeout(function(){c(k.val())},100)}var d=$(this);d.find("input, .chart-group-container, .chart-container, .input-value-display").attr("data-id",b).attr("context",d.attr("context")).attr("variate-key",d.attr("variate-key"));b++;var f=d.find(".chart-group-container"),g=$('\x3cdiv class\x3d"slider-container"\x3e\x3cdiv class\x3d"slider-track"\x3e\x3cdiv class\x3d"slider-thumb"\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e'),
h=g.find(".slider-thumb"),k=d.find("input[type\x3drange]"),l=!1;f.on("mousemove click",a);f.on("mousedown",function(){l=!0}).on("mouseup mouseleave",function(){l=!1});g.on("touchmove click",a);g.on("touchstart",function(){l=!0}).on("touchend",function(){l=!1});d.find("input").on("input",function(){c($(this).val())});k.change(function(){c($(this).val())});f.append(g);c()});$(".chart-group-container\x3einput").each(function(){var a=$(this);if(a.hasClass("coupled-input")){var b=$(".coupled-input[data-id\x3d"+
a.attr("data-id")+"]");b.attr("min",a.attr("min"));b.attr("max",a.attr("max"));b.attr("step",a.attr("step"));b.attr("value",a.attr("value"))}});q();$(".coupled-input").change(function(){a($(this))});$(".coupled-input[type\x3dnumber]").on("input",function(){a($(this))});$("input[type\x3drange]").each(function(){k($(this).attr("data-id"))});A(w.getAnswers());$("input[type\x3drange][variate-key\x3dVDU]").change(function(){var a=$(this).val(),b=$("input[type\x3drange][variate-key\x3dFLT]");b.attr("max",
a);b.val(Math.min(b.val(),b.attr("max"))).change();l(b.attr("data-id"));k(b.attr("data-id"))}).change();$("#debug").click(function(){var a=w.getAnswers(),b="";Object.keys(a).forEach(function(c){b=0==c.indexOf("_")?b+"\n":b+(c+" :  "+(isNaN(a[c])?a[c]:Math.round(a[c]))+"\n")});alert(b)})})},{"./math.js":2}]},{},[1]);
