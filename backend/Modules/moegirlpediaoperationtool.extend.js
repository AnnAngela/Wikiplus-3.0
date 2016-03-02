({
    "manifest": {
        "name": "moegirlpediaoperationtool.extend",
        "version": "1.0.0",
        "dependencies": []
    },
	'init': function () {
		jQuery.fn.extend({
            'check': function (flag) {
                if (flag === undefined) return this.is(':checked');
                if (flag) return this.prop('checked', true);
                return this.prop('checked', false);
            },
			'bindDragging': function () {
				return this.on('mousedown',  e=> {
					let baseX = e.clientX;
					let baseY = e.clientY;
					let baseOffsetX = this.parent().offset().left;
					let baseOffsetY = this.parent().offset().top;
					$(document).on('mousemove',  e=> {
						this.parent().css({
							'margin-left': baseOffsetX + e.clientX - baseX,
							'top': baseOffsetY + e.clientY - baseY
						})
					});
					$(document).on('mouseup',  e=> {
						this.off('mousedown');
						$(document).off('mousemove');
						$(document).off('mouseup');
						this.bindDragging();
					});
				});
			}
        });
		console.debug('Wikiplus-3.0 module moegirlpediaoperationtool.extend: init');
	}
})