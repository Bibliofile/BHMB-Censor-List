/*jshint
    esversion: 6,
    unused: strict,
    undef: true,
    browser: true,
    devel: true
*/
/*globals
    MessageBotExtension
*/

var biblio_censor = MessageBotExtension('biblio_censor');

(function(ex) {
    ex.setAutoLaunch(true);
    ex.uninstall = function() {
        ex.ui.removeTab(ex.tab);
        ex.storage.removeNamespace('biblio_censor_');
        ex.hook.remove('world.message', censorChecker);
    };

    var list = ex.storage.getObject('biblio_censor_list', []);
    var toSend = ex.storage.getString('biblio_censor_message', '/kick {{NAME}}');

    ex.tab = ex.ui.addTab('Censoring');
    ex.tab.innerHTML = '<style>#biblio_censor textarea{overflow: hidden; min-height: 30px; resize: none; width: 100%;}</style><div id="biblio_censor" class="container"> <h3 class="title">Censoring</h3> <p>When any of the words in the list below are said, say</p><input class="input"> <p>Messages from staff will not be checked.</p><hr> <p>One word per line, if you put the word "doodle" and someone says "d&oslash;odle", it will be caught.</p><textarea></textarea></div>';

    ex.tab.querySelector('input').value = toSend;
    ex.tab.querySelector('textarea').value = list.join('\n');

    //Grow textarea as needed
    ex.tab.querySelector('textarea').addEventListener('keyup', function(e){
        var el = e.target;

        el.style.height = 'auto';

        el.style.height = el.scrollHeight + 'px';
    });

    ex.tab.addEventListener('change', function() {
        toSend = ex.tab.querySelector('input').value;
        list = ex.tab.querySelector('textarea').value.split('\n');
        list = list.filter(function(v) {
            return v.length > 1;
        });
        ex.storage.set('biblio_censor_list', list);
        ex.storage.set('biblio_censor_message', toSend);
    });


    ex.hook.listen('world.message', censorChecker);
    function censorChecker(name, message) {
        if (ex.world.isStaff(name)) {
            return; //Don't check staff messages
        }

        var normal = normalizeMessage(message);
        if (list.some(function(word) { return normal.includes(normalizeMessage(word)); })) {
            var send = toSend.replace(/{{NAME}}/g, name)
                .replace(/{{Name}}/g, name[0] + name.substr(1).toLocaleLowerCase())
                .replace(/{{name}}/g, name.toLocaleLowerCase());
            ex.bot.send(send);
        }
    }

    function normalizeMessage(message) {
        function filter(c) {
            function check(characters) {
                return characters.some(function(test) {
                    return test == c;
                });
            }
            if (check(['æ', 'ä', 'å', 'á', 'à', 'ã', 'â', 'ā'])) {
                return 'a';
            } else if (check(['ß'])) {
                return 'b';
            } else if (check(['ç', 'č', 'ć'])) {
                return 'c';
            } else if (check(['é', 'ê', 'è', 'ë', 'ę', 'ė', 'ē'])) {
                return 'e';
            } else if (check(['î', 'ï', 'í', 'ī', 'į', 'Ì'])) {
                return 'i';
            } else if (check(['ł'])) {
                return 'l';
            } else if (check(['ñ', 'ń'])) {
                return 'n';
            } else if (check(['œ', 'ö', 'ó', 'õ', 'ô', 'ø', 'ò', 'ō'])) {
                return 'o';
            } else if (check(['ś', 'š'])) {
                return 's';
            } else if (check(['ü', 'ù', 'ú', 'û', 'ū'])) {
                return 'u';
            } else if (check(['ÿ'])) {
                return 'y';
            } else if (check(['ż', 'ź', 'ž'])) {
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

}(biblio_censor));
