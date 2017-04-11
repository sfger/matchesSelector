(function(){// {{{
	var type = typeof CustomEvent;
	if('function'===type) return false;
	window.CustomEvent = function(eventName, defaultInitDict){
		if(!document.createEvent){
			window.Event.prototype.initEvent = function(type, bubbles, cancelable){
				this.type = type;
				this.bubbles = !!bubbles;
				this.cancelable = !!cancelable;
				if(!this.bubbles){
					this.stoppedPropagation = true;
					this.cancelBubble = true;
				}
			};
			window.HTMLDocument.prototype.createEvent = function(Class){
				var e;
				if (Class !== 'Event') throw new Error('unsupported ' + Class);
				e = document.createEventObject();
				e.timeStamp = (new Date()).getTime();
				return e;
			}
		}
		function CustomEvent(type, eventInitDict){
			var event = document.createEvent ? document.createEvent(eventName) : document.createEventObject();
			if(typeof type != 'string'){
				throw new Error('An event name must be provided');
			}
			if(eventName=='Event') event.initCustomEvent = initCustomEvent;
			if(eventInitDict==null) eventInitDict = defaultInitDict;
			event.initCustomEvent(type, eventInitDict.bubbles, eventInitDict.cancelable, eventInitDict.detail);
			return event;
		}
		function initCustomEvent(type, bubbles, cancelable, detail){
			this.initEvent(type, bubbles, cancelable);
			this.detail = detail;
		}
		return CustomEvent;
	}(window.CustomEvent ? 'CustomEvent' : 'Event', {
		bubbles: false,
		cancelable: false,
		detail: null
	});
})();// }}}
(function(HTMLElement, Window, HTMLDocument){
	if(!HTMLElement) return false;
	var proto = HTMLElement.prototype;
	var matches = proto.matches;
	if(!matches) return false;
	var parse_event_type = function(type){//{{{
		var typeTag = type.split('.');
		var ret = {type:typeTag.shift()};
		if(typeTag.length) ret.typeTag = '.' + typeTag.sort(function(a,b){ return a>b; }).join('.') + '.';
		return ret;
	};//}}}
	var type_match = function(a, b){ return b.indexOf(a)>-1; };
	var get_event = function(type, op){//{{{
		var e = new window.CustomEvent(type, op);
		return _set_event(e);
	};//}}}
	var _set_event = function(e){//{{{
		if(!e.preventDefault){
			e.preventDefault = function(){ e.returnValue = false; };
			e.stopPropagation = function(){ e.cancelBubble = true; };
		}
		e.stopImmediatePropagation = function(){
			e._stopImmediatePropagation_ = true;
			e.stopPropagation();
		}
		return e;
	};//}}}
	proto.on = Window.prototype.on = HTMLDocument.prototype.on = function(type, selector, fn){//{{{
		var proxyElement = this;
		if(selector.apply){
			fn       = selector;
			selector = null;
		}
		var handler = function(e){
			var target = e.target||e.srcElement;
			if(selector){
				target = target.closest(selector);
				if(!target){
					target = null;
				}
			}else{
				target = proxyElement;
			}
			if(target){
				_set_event(e);
				var ret = fn.call(target, e);
				if(false===ret){
					e.preventDefault();
					e.stopPropagation();
				}
				return ret;
			}
		};
		var type_list = type.split(' ');
		for(var i=0,il=type_list.length; i<il; i++){
			var parse = parse_event_type(type_list[i]);
			type = parse.type;
			if(!proxyElement.__event_list__){
				if(window.addEventListener){
					proxyElement.addEventListener(type, function(e){
						proxyElement.trigger(type, e);
					}, false);
				}else if(window.attachEvent){
					proxyElement.attachEvent("on"+type, function(e){
						proxyElement.trigger(type, window.event)
					});
				}
			}
			proxyElement.__event_list__ = proxyElement.__event_list__ || [];
			var l = {type:type, handler:handler};
			if(selector) l.selector = selector;
			if(parse.typeTag) l.typeTag = parse.typeTag;
			proxyElement.__event_list__.push(l);
		}
		return this;
	};//}}}
	proto.off = Window.prototype.off = HTMLDocument.prototype.off = function(type){//{{{
		var parse = parse_event_type(type);
		var list = this.__event_list__;
		if(!(list && list.length)) return this;
		var ret = [];
		for(var i=0,il=list.length; i<il; i++){
			var item = list[i];
			if(item.type!==parse.type) ret.push(item);
			else if(parse.type){
				if(!type_match(parse.typeTag, item.typeTag)) ret.push(item);
			}
		}
		this.__event_list__ = ret;
		return this;
	};//}}}
	proto.trigger = Window.prototype.trigger = HTMLDocument.prototype.trigger = function(type, e){//{{{
		var parse = parse_event_type(type);
		var list = this.__event_list__;
		if(list && list.length){
			for(var i=0,il=list.length; i<il; i++){
				var item = list[i];
				if(item.type===parse.type){
					if(parse.typeTag){
						if(!item.typeTag) continue;
						if(!type_match(parse.typeTag, item.typeTag)) continue;
					}
					e = e || get_event(parse.type);
					item.handler(e);
					if(e._stopImmediatePropagation_) return this;
				}
			}
		}else if(this[parse.type]){
			this[parse.type]();
		}
		return this;
	};//}}}
})(window.HTMLElement||window.Element, window.Window, window.HTMLDocument || window.Document);
