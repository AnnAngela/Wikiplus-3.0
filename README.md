# Wikiplus-3.0

    提示：
    Wikiplus-3.0中的3.0不是版本号。
	
	而是作者的卖萌。
	
## Wikiplus-3.0 简介

Wikiplus-3.0 是带有插件系统的Wikiplus。使用jQuery和Mediawiki API直接对Mediawiki站点的页面进行编辑。同时由于插件系统的引入，带有许多附加功能。

## 安装和设置

安装Wikiplus-3.0只需要在你的Wiki用户页/common.js中加入以下代码：

    mw.loader.load('{Wikiplus的发布地址}/Wikiplus.min.js');
	/* Wikiplus-3.0 尚未正式发布，因此无法用这种方式直接使用。 */

如果你的Wiki将Wikiplus加入了小工具列表，你可以直接在设置中启用。

首次安装时会自动打开设置界面，进行初始化设置和选择需要加载的插件。之后这个设置界面可以在每个页面的右上角的“更多”菜单中调出。

这个工具在安装时会修改你的用户页/Wikiplus_config.js，向其中写入配置信息。在其他设备或是浏览器缓存丢失时用于同步设置。请不要随意删除或修改，可能会使Wikiplus工作不正常。

## 卸载

只需要删除你的用户页/common.js的加载代码即可。

如果你是从小工具设置中启用的，那么在设置页面取消勾选Wikiplus即可。

## 插件系统

Wikiplus-3.0的独特功能就是它的插件系统。插件系统允许任何用户通过Javascript创建一个能被Wikiplus识别和加载的增强功能。

插件不仅可以使用Wikiplus向它提供的API，更可以使用其他插件提供的API。

插件开发请参考 Wikiplus/plugin-SDK (未完成)

API请参考 Wikiplus/Wikiplus-doc (未完成)

插件自行提供的API请参考各插件内的文档或是Wiki中的说明。