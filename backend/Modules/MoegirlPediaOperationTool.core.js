/* global Wikiplus */
({
    "manifest": {
        "name": "moegirlpediaoperationtool.core",
        "version": "0.0.2",
        "dependencies": ['moegirlpediaoperationtool.extend']
    },
    'url': Wikiplus.API.getAPIURL(),
	'apiErrorMessage': function (eM = '', eC = '') {
		return eC ? eC + '.' + eM : eM;
	},
	'_default': function (v = '', a = [''], d = '') {
		return a.indexOf(v) != -1 ? v : d;
	},
	'counter': function (max = 0, callback = _ => { }) {
		function Counter(max, callback) {
			var self = this;
			self.count = 0
			self.max = max;
			self.plus = function () {
				if (max <= ++self.count) callback();
			}
		};
		return new Counter(max, callback);
	},
	'_watchlist': function (watchlist = 0) {
		var returnValue = '';
		switch (watchlist) {
			case -1: returnValue = 'unwatch';
				break;
			case 1: returnValue = 'watch';
				break;
			case 0:
			default: returnValue = 'preferences';
		}
		return returnValue;
	},
    'getToken': function () {
        return new Promise((res, rej) => $.ajax({
			url: `${Wikiplus.API.getAPIURL() }?action=query&meta=tokens&format=json`,
			type: 'GET',
			success: data =>
				data.query && data.query.tokens && data.query.tokens.csrftoken && data.query.tokens.csrftoken !== '+\\' ?
					res(data.query.tokens.csrftoken) :
					rej(),
			error: (_, eM, eC) => rej(['token', this.apiErrorMessage(eM, eC)])
		}));
    },
    'createBox': function (title = 'Wikiplus 3.0 MoeGirlPediaOperationTool', content = '', callback = _ => { }) {
        var width = 1000,
            $content = $('<div>').addClass('Wikiplus-InterBox-Content')
				.append(content),
            zindex = $('.Wikiplus-InterBox').length + 1307,
            clientWidth = document.body.clientWidthm,
            clientHeight = document.body.clientHeight,
            diglogBox = $('<div>').addClass('Wikiplus-InterBox')
				.css({
					'margin-left': (clientWidth / 2 - width / 2) + 'px',
					'top': $(document).scrollTop() + clientHeight * 0.2,
					'display': 'none',
					'z-index': zindex
				})
				.append($('<div>').addClass('Wikiplus-InterBox-Header').html(title))
				.append($content)
				.append($('<span>').text('×').addClass('Wikiplus-InterBox-Close'));
        diglogBox.find('.Wikiplus-InterBox-Header,.Wikiplus-InterBox-Close').css('user-select', 'none');
        $('body').append(diglogBox);
        diglogBox.find('.Wikiplus-InterBox').width(width + 'px');
        diglogBox.find('.Wikiplus-InterBox-Close').on('click', e =>
            $(this).parent().fadeOut('fast', _ => {
                window.onclose = window.onbeforeunload = undefined; //取消页面关闭确认
                $(this).remove();
            }));
        $('.Wikiplus-InterBox-Header').bindDragging();
        $('.Wikiplus-InterBox').fadeIn(500);
        callback($content, _ => diglogBox.find('.Wikiplus-InterBox-Close').click());
    },
    'createDialog': function (info = 'Wikiplus 3.0 MoeGirlPediaOperationTool Dialog', title = 'Wikiplus 3.0 MoeGirlPediaOperationTool', mode = [{ id: "Yes", text: 'Yes', res: true }, { id: "No", text: "No", res: false }]) {
        if ($('#Wikiplus-InterBox-Content')[0]) return;
        return new Promise(r => {
            var notice = $('<div>').text(info).attr('id', 'Wikiplus-InterBox-Content'),
                content = $('<div>').append(notice).append($('<hr>'));
            for (let btnOpt of mode) {
                let dialogBtn = $('<div>')
                    .addClass('Wikiplus-InterBox-Btn')
                    .attr('id', `Wikiplus-InterBox-Btn${btnOpt.id}`)
                    .text(btnOpt.text)
                    .data('value', btnOpt.res);
                content.append(dialogBtn);
            }
            this.createBox(title, info, (_, close) => {
                for (let btnOpt of mode)
                    $(`#Wikiplus-InterBox-Btn${btnOpt.id}`).on('click', _ => {
                        let resValue = $(`#Wikiplus-InterBox-Btn${btnOpt.id}`).data('value');
                        close();
                        r(resValue);
                    });
            })
        });
    },
    'delete': function (name = '', watchlist = 1, reason = '') {
        return this.getToken().then(token => new Promise((s, j) => $.ajax({
			url: this.url,
			type: 'POST',
			data: {
				action: 'delete',
				title: name,
				reason: reason,
				token: token,
				format: 'json',
				watchlist: this._watchlist(watchlist)
			},
			success: data => {
				if (data.error && data.error.code == 'bigdelete') s('bigdelete');
				else if (data.error) j(['delete', data.error['*']]);
				else s(true);
			},
			error: (_, eM, eC) => j(['delete', this.apiErrorMessage(eM, eC)])
		})));
    },
    'move': function (from = '', to = '', noredirect = true, watchlist = 1, reason = '') {
        return this.getToken().then(token => new Promise((s, j) => $.ajax({
			url: this.url,
			type: "POST",
			data: {
				action: 'move',
				from: from,
				to: to,
				reason: reason,
				token: token,
				format: 'json',
				noredirect: this._default(noredirect, [true, false], true),
				watchlist: this._watchlist(watchlist),
				ignorewarnings: true
			},
			success: data => data.error ? j(['delete', data.error['*']]) : s(),
			error: (_, eM, eC) => j(['move', this.apiErrorMessage(eM, eC)])
		})))
    },
	'protect': function (title = '', protections = {}, expiry = -1 || '', cascade = false, watchlist = 1, reason = '') {
		var protection = '',
			keys = ['edit', 'move', 'protect'],
			key;
		for (key in protections)
			if (key in keys && protections[key] && protections[key] !== 'none' && protections[key] === this._default(protections[key], ['sysop', 'patrolleredit', 'autoconfirmed', 'all'], 'none'))
				protection === '' ? protection = `${key}=${protections[key]}` : protection += `|${key}=${protections[key]}`;
		return this.getToken().then(token=> new Promise((s, j) => $.ajax({
			url: this.url,
			type: 'POST',
			data: {
				action: 'protect',
				format: 'json',
				title: title,
				protections: protection,
				expiry: expiry.toString(),
				reason: reason,
				cascade: this._default(cascade, [true, false], false),
				watchlist: this._watchlist(watchlist),
				token: token
			},
			success: data => data.error ? j(['protect', data.error['*']]) : s(),
			error: (_, eM, eC) => j(['protect', this.apiErrorMessage(eM, eC)])
		})));
	},
	'block': function (user = '', expiry = '', blockDetail = {
		nocreate: false,
		noemail: false,
		allowusertalk: true
	}, watch = true, reason = '') {
		return this.getToken().then(token=> new Promise((s, j) => $.ajax({
			url: this.url,
			type: 'POST',
			data: {
				action: 'block',
				format: 'json',
				token: token,
				user: user,
				expiry: expiry,
				reason: reason,
				anononly: false,
				nocreate: this._default(blockDetail.nocreate, [true, false], false),
				autoblock: false,
				noemail: this._default(blockDetail.noemail, [true, false], false),
				allowusertalk: this._default(blockDetail.allowusertalk, [true, false], true),
				reblock: true,
				watchuser: this._default(blockDetail.watchuser, [true, false], true)
			},
			success: data => data.error ? j(['block', data.error['*']]) : s(),
			error: (_, eM, eC) => j(['block', this.apiErrorMessage(eM, eC)])
		})));
	},
    'init': function (self) {
		console.debug('Wikiplus-3.0 module moegirlpediaoperationtool.core: init');
    }
})
