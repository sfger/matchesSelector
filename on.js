(function(HTMLElement){
	if(!HTMLElement) return false;
	var proto = HTMLElement.prototype;
	var matches = proto.matches;
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
			var e = e || window.event;
			var target = e.target||e.srcElement;
			if(selector){
				if(!matches.call(target, selector)){
					target = null;
				}
			}else{
				target = proxyElement;
			}
			if(target){
				if(!e.preventDefault){
					e.preventDefault = function(){ e.returnValue = false; };
					e.stopPropagation = function(){ e.cancelBubble = false; };
				}
				var ret = fn.call(target, e);
				if(false===ret){
					e.preventDefault();
					e.stopPropagation();
				}
			}
		};
		if(window.addEventListener){
			proxyElement.addEventListener(type, handler, false);
		}else if(window.attachEvent){
			proxyElement.attachEvent("on"+type, handler);
		}
		return this;
	};
})(window.HTMLElement||window.Element);
