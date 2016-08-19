(function(HTMLElement){
	if(!HTMLElement) return false;
	if(!document.querySelectorAll) return false;
	var proto = HTMLElement.prototype;
	var matchesSelector = proto.matchesSelector
						|| proto.webkitMatchesSelector
						|| proto.mozMatchesSelector
						|| proto.msMatchesSelector
						|| proto.oMatchesSelector;
	if(!matchesSelector){
		proto.matchesSelector = function(selector){
			var list = document.querySelectorAll(selector);
			if(list.length){
				for(var i=0,il=list.length; i<il; i++){
					if(this===list[i]) return true;
				}
			}
			return false;
		};
	}else{
		proto.matchesSelector = matchesSelector;
	}
})(window.HTMLElement||window.Element);
