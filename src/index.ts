import { MessageBot, Player } from '@bhmb/bot'
import { UIExtensionExports } from '@bhmb/ui'

import html from './tab.html'

function normalizeMessage(message: string) {
  function filter(c: string) {
    let check = (characters: string[]) => characters.some(test => test == c)

    if (check(['æ', 'ä', 'å', 'á', 'à', 'ã', 'â', 'ā'])) {
      return 'a'
    } else if (check(['ß'])) {
      return 'b'
    } else if (check(['ç', 'č', 'ć'])) {
      return 'c'
    } else if (check(['é', 'ê', 'è', 'ë', 'ę', 'ė', 'ē'])) {
      return 'e'
    } else if (check(['î', 'ï', 'í', 'ī', 'į', 'Ì'])) {
      return 'i'
    } else if (check(['ł'])) {
      return 'l'
    } else if (check(['ñ', 'ń'])) {
      return 'n'
    } else if (check(['œ', 'ö', 'ó', 'õ', 'ô', 'ø', 'ò', 'ō'])) {
      return 'o'
    } else if (check(['ś', 'š'])) {
      return 's'
    } else if (check(['ü', 'ù', 'ú', 'û', 'ū'])) {
      return 'u'
    } else if (check(['ÿ'])) {
      return 'y'
    } else if (check(['ż', 'ź', 'ž'])) {
      return 'z'
    }

    return c
  }

  message = message.toLocaleLowerCase()
  var filtered = ''
  for (var i = 0; i < message.length; i++) {
    filtered += filter(message[i])
  }
  return filtered.replace(/[ \t]/g, '')
}


MessageBot.registerExtension('bibliofile/censoring', (ex, world) => {
  const getMessage = () => ex.storage.get('message', '/kick {{NAME}}')
  const getList = () => ex.storage.get<string[]>('list', [])

  function listener({player, message}: {player: Player, message: string}) {
    if (player.isStaff) return

    let normal = normalizeMessage(message)
    if (getList().some(word => normal.includes(normalizeMessage(word)))) {
      ex.bot.send(getMessage(), { name: player.name })
    }
  }

  world.onMessage.sub(listener)

  ex.remove = () => world.onMessage.unsub(listener)


  // Browser only
  let ui = ex.bot.getExports('ui') as UIExtensionExports | undefined
  if (!ui) return

  let tab = ui.addTab('Censoring')
  tab.innerHTML = html

  let input = tab.querySelector('input') as HTMLInputElement
  let textarea = tab.querySelector('textarea') as HTMLTextAreaElement

  input.value = getMessage()
  textarea.value = getList().join('\n')

  textarea.addEventListener('keyup', () => {
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  })

  tab.addEventListener('input', function () {
    ex.storage.set('message', input.value)
    ex.storage.set('list', textarea.value.split(/\r?\n/).filter(v => v.length > 1))
  })

  ex.remove = () => {
    world.onMessage.unsub(listener)
    // Not sure why this isn't typed correctly. This is safe.
    ;(ui as UIExtensionExports).removeTab(tab)
  }
})
