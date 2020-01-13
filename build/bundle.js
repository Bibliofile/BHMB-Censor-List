(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('@bhmb/bot')) :
	typeof define === 'function' && define.amd ? define(['@bhmb/bot'], factory) :
	(factory(global['@bhmb/bot']));
}(this, (function (bot) { 'use strict';

var html = "<style>\n    #biblio_censor textarea {\n        overflow: hidden;\n        min-height: 30px;\n        resize: none;\n        width: 100%;\n    }\n</style>\n<div id=\"biblio_censor\" class=\"container\">\n    <h3 class=\"title\">Censoring</h3>\n    <p>When any of the words in the list below are said, say</p>\n    <input class=\"input\">\n    <p>Messages from staff will not be checked.</p>\n    <hr>\n    <p>One word per line, if you put the word \"doodle\" and someone says \"d&oslash;odle\", it will be caught.</p>\n    <textarea></textarea>\n</div>\n";

function normalizeMessage(message) {
    function filter(c) {
        let check = (characters) => characters.some(test => test == c);
        if (check(['æ', 'ä', 'å', 'á', 'à', 'ã', 'â', 'ā'])) {
            return 'a';
        }
        else if (check(['ß'])) {
            return 'b';
        }
        else if (check(['ç', 'č', 'ć', String.fromCharCode(1089)])) {
            return 'c';
        }
        else if (check(['é', 'ê', 'è', 'ë', 'ę', 'ė', 'ē'])) {
            return 'e';
        }
        else if (check(['î', 'ï', 'í', 'ī', 'į', 'Ì'])) {
            return 'i';
        }
        else if (check(['ł'])) {
            return 'l';
        }
        else if (check(['ñ', 'ń'])) {
            return 'n';
        }
        else if (check(['œ', 'ö', 'ó', 'õ', 'ô', 'ø', 'ò', 'ō'])) {
            return 'o';
        }
        else if (check(['ś', 'š'])) {
            return 's';
        }
        else if (check(['ü', 'ù', 'ú', 'û', 'ū'])) {
            return 'u';
        }
        else if (check(['ÿ'])) {
            return 'y';
        }
        else if (check(['ż', 'ź', 'ž'])) {
            return 'z';
        }
        return c;
    }
    message = message.toLocaleLowerCase();
    var filtered = '';
    for (var i = 0; i < message.length; i++) {
        filtered += filter(message[i]);
    }
    return filtered.replace(/[ \t]/g, '');
}
bot.MessageBot.registerExtension('bibliofile/censoring', (ex, world) => {
    const getMessage = () => ex.storage.get('message', '/kick {{NAME}}');
    const getList = () => ex.storage.get('list', []);
    function listener({ player, message }) {
        if (player.isStaff)
            return;
        let normal = normalizeMessage(message);
        if (getList().some(word => normal.includes(normalizeMessage(word)))) {
            ex.bot.send(getMessage(), { name: player.name });
        }
    }
    world.onMessage.sub(listener);
    ex.remove = () => world.onMessage.unsub(listener);
    // Browser only
    let ui = ex.bot.getExports('ui');
    if (!ui)
        return;
    let tab = ui.addTab('Censoring');
    tab.innerHTML = html;
    let input = tab.querySelector('input');
    let textarea = tab.querySelector('textarea');
    input.value = getMessage();
    textarea.value = getList().join('\n');
    textarea.addEventListener('keyup', () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    });
    tab.addEventListener('input', function () {
        ex.storage.set('message', input.value);
        ex.storage.set('list', textarea.value.split(/\r?\n/).filter(v => v.length > 1));
    });
    ex.remove = () => {
        world.onMessage.unsub(listener);
        ui.removeTab(tab);
    };
});

})));
//# sourceMappingURL=bundle.js.map
