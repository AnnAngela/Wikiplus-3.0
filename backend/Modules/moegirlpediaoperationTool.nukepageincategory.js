/* global mediaWiki, Wikiplus */
({
    "manifest": {
        "name": "moegirlpediaoperationTool.nukepageincategory",
        "version": "0.0.1",
        "dependencies": ['moegirlpediaoperationTool.core']
    },
	'runable': mediaWiki.config.get('wgAction') == 'view' ? mediaWiki.config.get('wgUserGroups').indexOf('sysop') !== -1 ? mediaWiki.config.get('wgNamespaceNumber') == 14 ? true : false : false : false,//检测页面是否在view模式，且用户为管理员
    "init": function (_, dpds) {
		var self = this;
        if (!self.runable) return;//如果不是就退出
        var core = dpds['moegirlpediaoperationtool.core'],//核心载入
			links = $('#mw-content-text > div > div[lang="zh-CN"][dir="ltr"]').clone(),//分类内链接clone
            link = $('<li/>').append(//box内链接模板
                $('<input/>', {
                    attr: {
                        'type': 'checkbox',
                        'checked': 'checked'//默认选中
                    }
                })
				).append(
					$('<a/>', {
						attr: { 'target': '_blank' }//外部标签跳转，防止祥瑞
					})
					),
            content = $('<div/>').append(//box content
                $('<div/>', {
                    attr: { 'class': 'Wikiplus-InterBox-NukePageInCategory-control' }//总控
                }).append(
                    $('<span/>', {
                        attr: { 'class': 'Wikiplus-InterBox-NukePageInCategory-controller first' },
                        text: '全选'
                    }).prepend($("<input/>", {
                        attr: {
                            'type': 'checkbox',
                            'checked': 'checked'//默认选中
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
						attr: { 'class': 'plainlinks Wikiplus-InterBox-NukePageInCategory-list' }//页面链接列表
					})).append(
						$('<div/>', {
							attr: { 'class': 'Wikiplus-InterBox-NukePageInCategory-action' }//action
						}).append(
							$('<input/>', {
								attr: { 'type': 'checkbox' }
							})
							).append('监视所有页面')
							.append(
								$('<button/>', {
									text: '删除选中页面',
									css: { 'margin-left': '3em' }
								})
								)
						),
            ol = content.find('ol');
        links.each((index, ele) => {
            if ($(ele).closest('.CategoryTreeChildren')[0]) return;//如果最近祖先元素是这个，表明他是此分类的子分类下的分类，不理他
            var _link = link.clone();
            _link.find('span').append(index + 1 + '');//加个序号
            _link.find('a').attr('href', ele.href).text(decodeURIComponent(ele.href.slice(23)));//加链接，HTMLElement的href返回的是完整链接，需要去掉前面的部分
            ol.append(_link);
        });
        $(mediaWiki.util.addPortletLink/* 使用mw提供的api创建按钮 */('p-views'/* 在右上角编辑按钮处添加 */, 'javascript:void(0)'/* 链接href */, '批量删除'/* 链接text */, 'ca-nuke'/* 链接id */, '批量删除此分类所有页面'/* 链接title */, null/* 链接accesskey */, '#ca-unwatch,#ca-watch'/*按钮应在哪个按钮前*/)/* 返回一个li按钮，里面有a */).find('a').on('click.nuke', _ => core.createBox("批量删除分类页面", content, function () {
			var interBox = $('.Wikiplus-InterBox'),
				content = interBox.find('.Wikiplus-InterBox-Content'),
				closeButton = interBox.find('.Wikiplus-InterBox-Close'),
				selectBox = content.find('.Wikiplus-InterBox-NukePageInCategory-controller.first input:checkbox'),
				unselectBox = content.find('.Wikiplus-InterBox-NukePageInCategory-controller.second input:checkbox'),
				actionButton = content.find('.Wikiplus-InterBox-NukePageInCategory-action button');
			content.find('li input:checkbox').on('click.nuke', _ => {
				if (content.find('li input:checkbox').length === content.find('li input:checkbox:checked').length)//当checkbox的数量等于被选中的checkbox数量时
					selectBox.click();//所有checkbox都被选中了
				else if (!content.find('li input:checkbox:checked')[0])//当一个被选中的checkbox都没有时
					unselectBox.click();//全不选
				else selectBox.add(unselectBox).check(false), actionButton.removeClass('disable');//两个控制checkbox都不选中，且批删按钮允许按下
			});
			selectBox.on('click.nuke', _ => {//全选checkbox
				unselectBox.check(false);//全不选取消选中
				content.find('li input:checkbox').add(selectBox).check(true);//全选
				actionButton.removeClass('disable');//批删按钮允许按下
			});
			unselectBox.on('click.nuke', _ => {//全不选checkbox
				unselectBox.check(true);//全不选
				content.find('li input:checkbox').add(selectBox).check(false);//全选和所有checkbox取消选中
				actionButton.addClass('disable');//批删按钮不允许按下
			});
			actionButton.on('click.nuke', _ => {
				if (actionButton.hasClass('disable')) return;//不允许按下时啥也不干
				core.createDialog(`你真的要动手删除这${content.find('li input:checkbox:checked').length}个页面吗？`, '管理员迟迟不动手，背后怕是有肮脏的……', [
					{ id: 'Yes', text: '动手！', res: true },
					{ id: 'No', text: '抱歉，交易已经完成了', res: false }
				]).then(value => {//询问一次
					if (!value) return;//如果点的是no就啥也不干
					Wikiplus.notice.create.warning('正在批量删除中，请勿关闭页面！');
					var reasonTemplate = ' in 【Category:即将删除的页面】 has been deleted by MoeGirlPediaOperationTool.nukepageincategory developed by AnnAngela and watched by AnnAngela.',
						regexp = /^File:/,
						counter = core.counter//新建一个计数器
							(content.find('li input:checkbox:checked').length,//最大值为所有被选中的页面的数量
							_=> Wikiplus.notice.create.success('批量删除工作执行完成，刷新页面中……', _ => {//到达最大值的时候提示工作完成
								window.location.reload();
							})),
						watchlist = content.find('.Wikiplus-InterBox-NukePageInCategory-action input:checkbox').check() ? 1 : 0;
					closeButton.addClass('disable').off('click');//阻止box被关闭
					jQuery.fn.extend({//懒人的懒办法
						'red': function () {
							return this.css('color', 'red');
						},
						'yellow': function () {
							return this.css('color', 'yelow');
						},
						'green': function () {
							return this.css('color', 'green');
						}
					});
					content.find('li input:checkbox:checked').closet('li').each((index, element) => {
						var pagename = $(element).find('a').text(),
							isFile = regexp.test(pagename),//是否文件页面
							reason = (isFile ? 'The file' : 'The file') + reasonTemplate;
						$(element).find('input:checkbox').attr('disable', 'disable')//阻止修改box
							.end().find('a').replaceAll($(element).find('a').text())//链接变为纯文本
							.end().css('transition', '0.37s all linear');//animate
						core.delete(pagename, watchlist, reason).then(v=> {//尝试删除页面
							if (v == 'bigdelete') {//如果返回这个，说明版本数太多你删不了
								if (isFile) {//同时是个文件，不应该移动到页面存废
									Wikiplus.notice.create.warning(`删除${pagename}失败：版本历史超过5个……`);
									$(element).red();
								}
								else {//还好不是，准备移动到页面存废
									Wikiplus.notice.create.warning(`删除${pagename}失败：版本历史超过5个，尝试移动到页面存废中……`);
									$(element).yellow();
									throw 'move';//利用catch跳转
								}
							} else {//返回的不是那个，说明成功了
								Wikiplus.notice.create.success(`删除${pagename}成功！`);
								$(element).green();
							}
						}).fail(e=> {//肯定有问题
							if (e[0] == 'token') Wikiplus.notice.create.error(`删除${pagename}失败：无法获取token（${e[1]}）……`);
							else Wikiplus.notice.create.error(`删除${pagename}失败（${e[1]}）……`);
							$(element).red();
						}).catch(e=> {
							if (e == 'move')//error object居然是个字符串？说明你没看注释
								return core.move(pagename, '萌娘百科:页面存废/' + pagename, true, watchlist, reason)//尝试移动
									.then(_=> {//这个是不可能出现版本数太多的啦
										Wikiplus.notice.create.success(`移动${pagename}到页面存废成功！`);
										$(element).green();
									})
									.fail(e=> {//又失败了？你人品太不好了
										if (e[0] == 'token') Wikiplus.notice.create.error(`移动${pagename}到页面存废失败：无法获取token（${e[1]}）……`);
										else Wikiplus.notice.create.error(`移动${pagename}到页面存废失败（${e[0]}）……`);
										$(element).red();
									});
							else {//这个是真的报错了
								Wikiplus.notice.create.error(`删除${pagename}失败（${e.toString() }）……`);
								$(element).red();
							}
						}).finally(_=> counter.plus());//自动计数菌
					});
				});
			});
		}));
    }
});
