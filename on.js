(function(HTMLElement){
	if(!HTMLElement) return false;
	var proto = HTMLElement.prototype;
	var matches = proto.matches 
				|| proto.matchesSelector
				|| proto.webkitMatchesSelector
				|| proto.mozMatchesSelector
				|| proto.msMatchesSelector
				|| proto.oMatchesSelector;
	if(!matches) return false;
	proto.on = function(type, selector, fn, capture){
		var proxyElement = this;
		if(selector.apply){
			capture  = fn;
			fn       = selector;
			selector = null;
		}
		capture = !!capture;
		var handler = function(e){
			var target = e.target||e.srcElement;
			if(selector){
				if(!matches.call(target, selector)){
					target = null;
				}
			}else{
				target = proxyElement;
			}
			target && fn.call(target, e);
		};
		if(window.addEventListener){
			proxyElement.addEventListener(type, handler, capture);
		}else if(window.attachEvent){
			proxyElement.attachEvent("on"+type, handler);
		} 
		return this;
	};
})(window.HTMLElement||window.Element);
