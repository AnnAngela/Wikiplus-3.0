/* global mediaWiki, Wikiplus */
({
    "manifest": {
        "name": "NukePageInCategory",
        "version": "0.0.1",
        "dependencies": []
    },
    'getToken': function () {
        return new Promise((res, rej) => {
            $.ajax({
                url: `${Wikiplus.API.getAPIURL() }?action=query&meta=tokens&format=json`,
				type: 'GET',
                data: {
					'action': 'query',
					'meta': 'tokens',
					'format': 'json'
				},
                success: data => {
                    if (data.query && data.query.tokens && data.query.tokens.csrftoken && data.query.tokens.csrftoken !== '+\\') res(data.query.tokens.csrftoken);
                    else rej();
                },
				error: e => {
					rej();
				}
            })
        })
    },
	'url': Wikiplus.API.getAPIURL(),
	'counter': function (max) {
		var self = this;
		self.count = 0
		self.max = max;
		self.plus = function () {
			if (max <= ++self.count) Wikiplus.notice.create.success('批量删除工作执行完成，刷新页面中……', () => {
				window.location.reload();
			});
		}
	},
    "init": function (self, dpds) {
        if (mediaWiki.config.get('wgAction') !== 'view') return;
        jQuery.fn.extend({
            'check': function (flag) {
                if (flag === undefined) return this.is(':checked');
                if (flag) this.prop('checked', true);
                else this.prop('checked', false);
                return this;
            }
        });
        var links = $('#mw-content-text > div > div[lang="zh-CN"][dir="ltr"]').clone(),
            link = $('<li/>').append(
                $('<input/>', {
                    attr: {
                        'type': 'checkbox',
                        'checked': 'checked'
                    }
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
							attr: { 'class': 'Wikiplus-InterBox-NukePageInCategory-controller second' },
							text: '全不选'
						}).prepend($("<input/>", {
							attr: {
								'type': 'checkbox'
							}
						}))
						)
				).append(
					$('<ol/>', {
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
            ol = content.find('ol');
        links.each((index, ele) => {
            if ($(ele).closest('.CategoryTreeChildren')[0]) return;
            var _link = link.clone();
            _link.find('span').append(index + 1 + '');
            _link.find('a').attr('href', ele.href).text(decodeURIComponent(ele.href.slice(23)));
            ol.append(_link);
        });
        $(mediaWiki.util.addPortletLink('p-views', 'javascript:void(0)', '批量删除', 'ca-nuke', '批量删除此分类所有页面', null, '#ca-unwatch,#ca-watch')).find('a').on('click.nuke', event => {
            Wikiplus.UI.createBox({
                title: "批量删除分类页面",
                width: '1000px',
                content: content,
                callback: function () {
                    var interBox = $('.Wikiplus-InterBox'),
                        content = interBox.find('.Wikiplus-InterBox-Content'),
                        closeButton = interBox.find('.Wikiplus-InterBox-Close'),
                        selectBox = content.find('.Wikiplus-InterBox-NukePageInCategory-controller.first input:checkbox'),
                        unselectBox = content.find('.Wikiplus-InterBox-NukePageInCategory-controller.second input:checkbox'),
                        actionButton = content.find('.Wikiplus-InterBox-NukePageInCategory-action button');
                    content.find('li input:checkbox').on('click.nuke', event => {
                        if (content.find('li input:checkbox').length === content.find('li input:checkbox:checked').length) selectBox.click();
                        else if (!content.find('li input:checkbox:checked')[0]) unselectBox.click();
                        else selectBox.add(unselectBox).check(false), actionButton.removeClass('disable');
                    });
                    selectBox.on('click.nuke', event => {
                        unselectBox.check(false);
                        content.find('li input:checkbox').add(selectBox).check(true);
                        actionButton.removeClass('disable');
                    });
                    unselectBox.on('click.nuke', event => {
                        selectBox.check(false);
                        content.find('li input:checkbox').add(unselectBox).check(true);
                        actionButton.addClass('disable');
                    });
                    actionButton.on('click.nuke', event => {
                        if (actionButton.hasClass('disable')) return;
                        self.Box = $('.Wikiplus-InterBox').clone;
                        Wikiplus.UI.createDialog({
                            info: `你真的要动手删除这${content.find('li input:checkbox:checked').length}个页面吗？`,
                            title: '管理员迟迟不动手，背后怕是有肮脏的……',
                            mode: [
                                { id: 'Yes', text: '动手！', res: true },
                                { id: 'No', text: '抱歉，交易已经完成了', res: false }
                            ]
                        }).then(value => {
                            if (!value) {
                                Wikiplus.UI.closeBox();
                                window.setTimeout(() => {
                                    self.Box.appendTo('body').fadeIn('fast');
                                }, 400);
                            } else {
                                Wikiplus.notice.create.warning('正在批量删除中，请勿关闭页面！');
                                var reasonTemplate = ' in 【Category:即将删除的页面】 has been deleted by MoeClear desighed by Grzhan. This active was watched by AnnAngela.',
                                    regexp = /^File:/,
                                    counter=self.counter(self.Box.find('li input:checkbox').length);
                                                                closeButton.addClass('disable').off('click');
                                self.Box.find('li input:checkbox').closet('li').each((index, element) => {
                                    var pagename = element.find('a').text(),
                                        isFile = regexp.test(pagename),
                                        reason = (isFile ? 'The file' : 'The file') + reasonTemplate;
                                    self.getToken().then(token => {
                                        $.ajax({
											url: self.url,
											type: 'POST',
											data: {
												action: 'delete',
												title: pagename,
												reason: reason,
												token: token,
												format: 'json'
											}, success: data => {
												if (data.error && data.error.code == 'bigdelete') {
													if (isFile) {
														Wikiplus.notice.create.warning(`删除${pagename}失败：版本历史超过5个……`);
														counter.plus();
													} else throw new Error('');
												} else if (data.error) Wikiplus.notice.create.error(`删除${pagename}失败……`);
												else Wikiplus.notice.create.success(`删除${pagename}成功！`);
												counter.plus();
											}, error: e=> {
												Wikiplus.notice.create.error(`删除${pagename}失败……`);
											}
										});
                                    }).fail(e => {
                                        Wikiplus.notice.create.error(`删除${pagename}失败：无法获取token……`);
                                        counter.plus();
									}).catch(e=> {
										Wikiplus.notice.create.warning(`删除${pagename}失败：版本历史超过5个，尝试移动到页面存废中……`);
										self.getToken().then(token => {
											$.ajax({
												url: self.url,
												type: 'POST',
												data: {
													action: 'move',
													title: pagename,
													reason: reason,
													token: token,
													format: 'json'
												},
												success: data => {
													if (data.move) Wikiplus.notice.create.success(`移动${pagename}到页面存废成功！`);
													else Wikiplus.notice.create.error(`移动${pagename}到页面存废失败……`);
													counter.plus();
												}
											});
										}).fail(() => {
											Wikiplus.notice.create.error(`移动${pagename}到页面存废失败：无法获取token……`);
											counter.plus();
										});
									});
                                });
                            }
                        });
                    });
                }
            });
        });
    }
});
