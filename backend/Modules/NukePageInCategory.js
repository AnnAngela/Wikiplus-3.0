/* global mediaWiki, Wikiplus */
({
    "manifest": {
        "name": "NukePageInCategory",
        "version": "0.0.1",
        "dependencies": []
    },
    "init": function (self, dpds) {
		if (mw.config.get('wgAction') !== 'view') return;
		jQuery.fn.extend({
			'check': function (flag) {
				if (flag === undefined) return this.is(':checked');
				if (flag) this.prop('checked', true);
				else this.prop('checked', false);
				return this;
			}
		});
        var url = {
			api: Wikiplus.API.getAPIURL()
		},
			links = $('#mw-content-text > div > div[lang="zh-CN"][dir="ltr"]').clone(),
			link = $('<li/>').append(
				$('<input/>', {
					attr: {
						'type': 'checkbox',
						'checked': 'checked'
					}
				})
				).append(
					$('<span/>', {
						attr: { 'class': 'Wikiplus-InterBox-NukePageInCategory-index' }
					})
					).append(
						$('<a/>', {
							attr: { 'target': '_blank' }
						})
						),
			content = $('<div/>').append(
				$('<div/>', {
					attr: { 'class': 'Wikiplus-InterBox-NukePageInCategory-control' }
				}).append(
					$('<span/>', {
						attr: { 'class': 'Wikiplus-InterBox-NukePageInCategory-controller first' },
						text: '全选'
					}).prepend($("<input/>", {
						attr: {
							'type': 'checkbox',
							'checked': 'checked'
						}
					}))
					).append(
						$('<span/>', {
							attr: { 'class': 'Wikiplus-InterBox-NukePageInCategory-controller' },
							text: '全不选'
						}).prepend($("<input/>", {
							attr: {
								'type': 'checkbox'
							}
						}))
						)
				).append(
					$('<ul/>', {
						attr: { 'class': 'plainlinks Wikiplus-InterBox-NukePageInCategory-list' }
					})).append(
						$('<div/>', {
							attr: { 'class': 'Wikiplus-InterBox-NukePageInCategory-action' }
						}).append(
							$('<button/>', {
								text: '删除选中页面'
							})
							)
						),
			ul = content.find('ul'),
			button = $(mediaWiki.util.addPortletLink('p-views', 'javascript:void(0)', '批量删除', 'ca-nuke', '批量删除此分类所有页面', null, '#ca-unwatch,#ca-watch')).find('a');
		links.each((index, ele) => {
			if ($(ele).closest('.CategoryTreeChildren')[0]) return;
			var _link = link.clone();
			_link.find('span').append(index + 1 + '');
			_link.find('a').attr('href', ele.href).text(decodeURIComponent(ele.href.slice(23)));
			ul.append(_link);
		});
		button.on('click.nuke', event=> {
			Wikiplus.UI.createBox({
				title: "批量删除分类页面",
				width: '1000px',
				content: content,
				callback: function () {
					var self = $('.Wikiplus-InterBox'),
						content = self.find('.Wikiplus-InterBox-Content'),
						closeButton = self.find('.Wikiplus-InterBox-Close');
					content.find('li input:checkbox').on('click.nuke', event=> {
						if (content.find('li input:checkbox').length === content.find('li input:checkbox:checked').length) content.find('.Wikiplus-InterBox-NukePageInCategory-controller input:checkbox').check(false)
							.end().find('.Wikiplus-InterBox-NukePageInCategory-controller.first input:checkbox').check(true);
						else if (!content.find('li input:checkbox:checked')[0]) content.find('.Wikiplus-InterBox-NukePageInCategory-controller.first input:checkbox').check(false)
							.end().find('.Wikiplus-InterBox-NukePageInCategory-controller input:checkbox').check(true);
						else content.find('.Wikiplus-InterBox-NukePageInCategory-controller input:checkbox').check(false);
					});
					content.find('.Wikiplus-InterBox-NukePageInCategory-controller.first input:checkbox').on('click.nuke', function () {
						$(this).check(true), content.find('li input:checkbox').check(true);
					});
					content.find('.Wikiplus-InterBox-NukePageInCategory-controller.first').siblings('input:checkbox').find('input:checkbox').on('click.nuke', function () {
						$(this).check(true), content.find('li input:checkbox').check(false);
					});
				}
			});
		})
    }
})