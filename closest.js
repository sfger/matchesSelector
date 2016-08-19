(function(HTMLElement){
	HTMLElement.prototype.closest = function(selector){
		var target = this;
		while(target && 1===target.nodeType){
			if(target.matches(selector)){
				return target;
			}
			target = target.parentNode;
		}
		return null;
	};
})(window.HTMLElement||window.Element);
