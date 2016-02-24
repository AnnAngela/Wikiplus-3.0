/* global Wikiplus */
({
    "manifest": {
        "name": "NukePageInCategory",
        "version": "0.0.1",
        "dependencies": []
    },
    "init": function (self, dpds) {
		jQuery.fn.extend({
			'check': function () {
				this.attr('checked', true);
				return this;
			}
		});
        var url = {
			api: Wikiplus.API.getAPIURL()
		},
			links = $('#mw-content-text > div a').clone(),
			link = $('li').append(
				$('input', {
					attr: {
						'type': 'checkbox',
						'checked': 'checked'
					}
				})
				).append(
					$('span', {
						css: { 'margin-right': '1em' }
					})
					).append(
						$('a', {
							attr: { 'target': '_blank' }
						})
						),
			content = $('div').append(
				$('ul', {
					attr: { 'class': 'plainlinks mw-category' },
				})),
			ul = content.find('ul');
		links.each((index, ele) => {
			var _link = link.clone();
			_link.find('span').append(index + 1 + '');
			_link.find('a').attr('href', ele.href).text(decodeURIComponent(ele.href.slice(23)));
			ul.append(_link);
		});
		//此处应有mw.util.addPortletLink
		//api；portlet【想添加的ul的最近父节点】, href, text, id, tooltip【a.title】, accesskey, nextnode【直接填'#ca-unwatch,#ca-watch'】
		Wikiplus.UI.createBox({
			title: "批量删除分类页面",
			width: '1000px',
			content: content,
			callback: function () {
				;
			}
		});
    }
})