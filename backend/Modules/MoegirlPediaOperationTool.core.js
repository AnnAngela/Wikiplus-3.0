({
    "manifest": {
        "name": "moegirlpediaoperationtool.core",
        "version": "0.0.1",
        "dependencies": ['moegirlpediaoperationtool.extend']
    },
    'getToken': function() {
        return new Promise((res, rej) =>
            $.ajax({
                url: `${Wikiplus.API.getAPIURL() }?action=query&meta=tokens&format=json`,
                type: 'GET',
                success: data =>
                    data.query && data.query.tokens && data.query.tokens.csrftoken && data.query.tokens.csrftoken !== '+\\' ?
                    res(data.query.tokens.csrftoken) : rej(),
                error: e => rej('token')
            }));
    },
    'url': Wikiplus.API.getAPIURL(),
    'createBox': function(title = 'wikiplus', content = '', callback = () => {}) {
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
            .append(
                $('<div>').addClass('Wikiplus-InterBox-Header')
                .html(title)
            )
            .append($content)
            .append(
                $('<span>').text('×').addClass('Wikiplus-InterBox-Close')
            );
        diglogBox.find('.Wikiplus-InterBox-Header,.Wikiplus-InterBox-Close').css('user-select', 'none');
        $('body').append(diglogBox);
        diglogBox.find('.Wikiplus-InterBox').width(width + 'px');
        diglogBox.find('.Wikiplus-InterBox-Close').on('click', e =>
            $(this).parent().fadeOut('fast', e => {
                window.onclose = window.onbeforeunload = undefined; //取消页面关闭确认
                $(this).remove();
            }));
        $('.Wikiplus-InterBox-Header').bindDragging();
        $('.Wikiplus-InterBox').fadeIn(500);
        callback($content, e => diglogBox.find('.Wikiplus-InterBox-Close').click());
    },
    '_createDialog': function(info, title, mode, _createBox) {
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
            _createBox(title, info, (c, close) => {
                for (let btnOpt of mode)
                    $(`#Wikiplus-InterBox-Btn${btnOpt.id}`).on('click', e => {
                        let resValue = $(`#Wikiplus-InterBox-Btn${btnOpt.id}`).data('value');
                        close();
                        r(resValue);
                    });
            })
        });
    },
    '_delete': function(name, reason, core) {
        return core.getToken().then(token =>
            new Promise((s, j) => $.ajax({
                url: core.url,
                type: 'POST',
                data: {
                    action: 'delete',
                    title: name,
                    reason: reason,
                    token: token,
                    format: 'json'
                },
                success: data => {
                    if (data.error && data.error.code == 'bigdelete') s('bigdelete');
                    else if (data.error) j('delete');
                    else s(true);
                }
            })));
    },
    '_move': function(name, reason, core) {
        return core.getToken().then(token =>
            new Promise((s, j) => $.ajax({
                url: core.url,
                type: "POST",
                data: {
                    action: 'move',
                    title: name,
                    reason: reason,
                    token: token,
                    format: 'json'
                },
                success: data => {
                    if (data.move) s();
                    else j('move');
                }
            }))
        )
    }
    'init': function(self) {
        self.createDialog = function(info = '', title = 'Wikiplus', mode = [{ id: "Yes", text: "Yes", res: true }, { id: "No", text: "No", res: false }]) {
            return self._createDialog(info, title, mode, self.createBox);
        };
        self.delete = function(name = '', reason = '') {
            return self._delete(name, reason, self);
        };
        self.move=function(name='',reason=''){
        	return self._move(name,reason,self);
        };
    }
})
