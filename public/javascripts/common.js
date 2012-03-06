var Slavery = {
	master: null,
	selected: null,
	select: function (node) {
		console.log(node);
		for (var i in node.options) {
			$('#rightContent input[name='+i+']').val(node[i]);
		}
		this.selected = node;
	}
};
$(function () {
	$("#rightContent input" ).keypress(function (e) {
		var name = e.target.name,
			value = $(e.target).val();
		if ( event.which == 13 ) {
			Slavery.selected.options[name] = value;
			Slavery.master.command({ type: name, to: value }, Slavery.selected.id);

			Slavery.selected.el.css('background-color', value);
		}
	});
});

if (!Function.prototype.bind) {  
  Function.prototype.bind = function (oThis) {  
    if (typeof this !== "function") {  
      // closest thing possible to the ECMAScript 5 internal IsCallable function  
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");  
    }  
  
    var aArgs = Array.prototype.slice.call(arguments, 1),   
        fToBind = this,   
        fNOP = function () {},  
        fBound = function () {  
          return fToBind.apply(this instanceof fNOP  
                                 ? this  
                                 : oThis || window,  
                               aArgs.concat(Array.prototype.slice.call(arguments)));  
        };  
  
    fNOP.prototype = this.prototype;  
    fBound.prototype = new fNOP();  
  
    return fBound;  
  };  
}

var isArray = function (a) {
	return toString.apply(a) === '[object Array]';
}