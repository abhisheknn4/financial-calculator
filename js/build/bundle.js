var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,d){a!=Array.prototype&&a!=Object.prototype&&(a[b]=d.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX="jscomp_symbol_";
$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};$jscomp.Symbol=function(){var a=0;return function(b){return $jscomp.SYMBOL_PREFIX+(b||"")+a++}}();
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var a=$jscomp.global.Symbol.iterator;a||(a=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));"function"!=typeof Array.prototype[a]&&$jscomp.defineProperty(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return $jscomp.arrayIterator(this)}});$jscomp.initSymbolIterator=function(){}};$jscomp.arrayIterator=function(a){var b=0;return $jscomp.iteratorPrototype(function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}})};
$jscomp.iteratorPrototype=function(a){$jscomp.initSymbolIterator();a={next:a};a[$jscomp.global.Symbol.iterator]=function(){return this};return a};$jscomp.iteratorFromArray=function(a,b){$jscomp.initSymbolIterator();a instanceof String&&(a+="");var d=0,f={next:function(){if(d<a.length){var g=d++;return{value:b(g,a[g]),done:!1}}f.next=function(){return{done:!0,value:void 0}};return f.next()}};f[Symbol.iterator]=function(){return f};return f};
$jscomp.polyfill=function(a,b,d,f){if(b){d=$jscomp.global;a=a.split(".");for(f=0;f<a.length-1;f++){var g=a[f];g in d||(d[g]={});d=d[g]}a=a[a.length-1];f=d[a];b=b(f);b!=f&&null!=b&&$jscomp.defineProperty(d,a,{configurable:!0,writable:!0,value:b})}};$jscomp.polyfill("Array.prototype.keys",function(a){return a?a:function(){return $jscomp.iteratorFromArray(this,function(a){return a})}},"es6","es3");
$jscomp.findInternal=function(a,b,d){a instanceof String&&(a=String(a));for(var f=a.length,g=0;g<f;g++){var m=a[g];if(b.call(d,m,g,a))return{i:g,v:m}}return{i:-1,v:void 0}};$jscomp.polyfill("Array.prototype.find",function(a){return a?a:function(a,d){return $jscomp.findInternal(this,a,d).v}},"es6","es3");
(function(){function a(b,d,f){function g(k,c){if(!d[k]){if(!b[k]){var n="function"==typeof require&&require;if(!c&&n)return n(k,!0);if(m)return m(k,!0);c=Error("Cannot find module '"+k+"'");throw c.code="MODULE_NOT_FOUND",c;}c=d[k]={exports:{}};b[k][0].call(c.exports,function(c){var a=b[k][1][c];return g(a?a:c)},c,c.exports,a,b,d,f)}return d[k].exports}for(var m="function"==typeof require&&require,l=0;l<f.length;l++)g(f[l]);return g}return a})()({1:[function(a,b,d){a("./sliders.js");"serviceWorker"in
navigator&&navigator.serviceWorker.register("/sw.js").catch(function(a){console.err("Error registering service worker",a)})},{"./sliders.js":3}],2:[function(a,b,d){function f(c,a,b){if(b>12*c.FLT)return 0;principle=("e"==a?c.VCOE:c.VCOF)*(1-c.FPE/100);interest=c.FLR/1200;c=Math.pow(1+interest,12*c.FLT);return principle*interest*c/(c-1)}function g(c,a){var b=f(c,"e",a);return(c.DR*c.DRD*(c.VM*c.RER*Math.pow(1+c.REE/1200,a)+(c.MEC+c.MEO)*Math.pow(1+c.FIF/1200,a))+b)/Math.pow(1+c.FRI/1200,a)}function m(a,
b){var c=f(a,"f",b);return(a.DR*a.DRD*(a.RFR*Math.pow(1+a.RFE/1200,b)/a.VDM+(a.MFC+a.MFO)*Math.pow(1+a.FIF/1200,b))+c)/Math.pow(1+a.FRI/1200,b)}var l="DR DRD VDU FLR FLT FPE FIF FRI VCOE VM RER REE MEC MEO FDE FBR VBL VBCO VCOF VDM RFR RFE MFC MFO FDD".split(" "),k={};$(document).ready(function(){l.forEach(function(a){k[a]=$(".graph-row[variate-key\x3d"+a+"] input[type\x3drange]")})});b.exports={getSavings:function(a){a=a||{};Object.keys(k).forEach(function(h){var e=a,b=parseFloat,c=a[h],d=k[h].val();
e[h]=b("undefined"!=typeof c?c:d)*(parseInt(k[h].attr("scale"))||1)});for(var c=a.DR*a.DRD,b=a.VBL,d=0,h=1;h<=12*a.VDU;h++)d+=m(a,h)-g(a,h),0>=b&&(d-=a.VBCO*Math.pow(1-a.FBR/1200,h)/Math.pow(1+a.FRI/1200,h),b=a.VBL),b-=c;d+=a.VCOF*Math.pow(1-a.FDD/100,a.VDU)/Math.pow(1+a.FRI/1200,a.VDU)-a.VCOE*Math.pow(1-a.FDE/100,a.VDU)/Math.pow(1+a.FRI/1200,a.VDU);return Math.round(d)}}},{}],3:[function(a,b,d){function f(a){var h=100/a.data.length,e=-Infinity;a.data.forEach(function(a){a.val>e&&(e=a.val)});var c=
Math.abs(100/e);return a.data.map(function(e,b){var d=Math.max(0,e.val*c);return'\x3cdiv style\x3d"width:'+h+'%;" class\x3d"column" data-id\x3d"'+a.dataId+'" range\x3d"'+e.range+'"\x3e\x3cdiv style\x3d"bottom:'+d+'%;" class\x3d"column-value-display" value\x3d"'+e.val+'"\x3e\u20b9 \x3cspan\x3e'+e.val+"\x3c/span\x3e\x3c/div\x3e"+(0==b||b==a.data.length-1?'\x3cdiv style\x3d"bottom:'+d+'%;" class\x3d"column-value-display-terminal" value\x3d"'+e.val+'"\x3e\u20b9 \x3cspan\x3e'+e.val+"\x3c/span\x3e\x3c/div\x3e":
"")+'\x3cdiv style\x3d"height:'+d+'%;" class\x3d"column-value" value\x3d"'+e.val+'"\x3e\x3c/div\x3e\x3c/div\x3e'})}function g(a){var h=parseFloat(a.input.attr("min")),e=parseFloat(a.input.attr("max")),b=[],c=parseFloat(a.input.attr("step"));e=(e-h)/a.numSteps;for(var d=0;d<a.numSteps;d++){var f=c*Math.round((d*e+e/2+h)/c),g={};g[a.variateKey]=f;b.push({range:f,val:n.getSavings(g)})}return b}function m(a){var b=$(".chart-container[data-id\x3d"+a+"]"),e=b.children();if(e.length){a=$("input[type\x3drange][data-id\x3d"+
a+"]");var c=a.attr("max"),d=a.attr("min");a=(a.val()-d)/(c-d);a=Math.min(Math.floor(a*e.length),e.length-1);b.find(".active").removeClass("active");b.find(".adjacent").removeClass("adjacent");$(e[a]).addClass("active");0<a&&$(e[a-1]).addClass("adjacent");a<e.length-1&&$(e[a+1]).addClass("adjacent")}}function l(a){var b=$("input[type\x3drange][data-id\x3d"+a+"]");a=b.parent().children(".input-value-display");a.children("span").text(b.val());var e=a.outerWidth(),c=b.attr("max")-b.attr("min");b=Math.round(b.parent().width()*
(b.val()-b.attr("min"))/c-e/2);a.css("left",b+"px")}function k(a,b){var e=a.graph.attr("data-id");clearTimeout(q[e]);var c=a.graph,d=p.scrollTop(),h=d+p.height(),l=c.offset().top;c=l+c.height();c<=h&&c>=d||l<=h&&l>=d||b?(a.graph.html(f({data:g({numSteps:a.numSteps||31,input:a.targetInput,variateKey:a.targetInput.attr("variate-key")}),dataId:e})),m(e)):q[e]=setTimeout(k,1E3,a,!0)}function c(a){a=a||{};$(".chart-group-container").each(function(){var b=$(this);b.attr("data-id")==a.dataId||a.context&&
b.attr("context")!=a.context||k({graph:b.children(".chart-container"),targetInput:b.children("input[type\x3drange]")})})}var n=a("./math.js"),p=$(window),q={};$(document).ready(function(){function a(a){if(a.val()!=a.attr("lastHandledValue")){var b=a.attr("data-id");$(".coupled-input[data-id\x3d"+a.attr("data-id")+"]").val(a.val());$(".coupled-input[data-id\x3d"+a.attr("data-id")+"]").attr("lastHandledValue",a.val());var e=n.getSavings();$("#net-savings span").text(e);c({dataId:b,context:a.attr("context")});
m(b);l(b);$(".graph-row[context\x3d"+a.attr("context")+"] .column.active .column-value-display span").text(e)}}var b=0;$(".graph-row").each(function(){var a=$(this);a.find("input, .chart-group-container, .chart-container, .input-value-display").attr("data-id",b).attr("context",a.attr("context")).attr("variate-key",a.attr("variate-key"));b++});$(".chart-group-container\x3einput").each(function(){var a=$(this);if(a.hasClass("coupled-input")){var b=$(".coupled-input[data-id\x3d"+a.attr("data-id")+"]");
b.attr("min",a.attr("min"));b.attr("max",a.attr("max"));b.attr("step",a.attr("step"))}});$(".chart-container").on("click",".column",function(){var a=$(this);$("input[type\x3drange][data-id\x3d"+a.attr("data-id")+"]").val(a.attr("range")).change()});c();$(".coupled-input").change(function(){a($(this))});$(".coupled-input").on("input",function(){a($(this))});$(document).ready(function(){$("input[type\x3drange]").each(function(){l($(this).attr("data-id"))})});$("#net-savings span").text(n.getSavings());
$("input[type\x3drange][variate-key\x3dVDU]").change(function(){var a=$(this).val(),b=$("input[variate-key\x3dFLT]");b.attr("max",a);b.val(Math.min(b.val(),a)).change()})})},{"./math.js":2}]},{},[1]);
