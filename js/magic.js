import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { nanoid } from 'nanoid'

const ydoc = new Y.Doc()
const provider = new WebrtcProvider('crdt-folder', ydoc, { signaling: ['ws://localhost:4444'] })
const yArray = ydoc.getArray('magic')

const rootFolder = new Y.Array()
rootFolder.push([{ id: '_ROOT_', parent: null, name: 'root' }])

yArray.push([rootFolder])

ydoc.on('update', update => {
  render (document.querySelector('.overview'), rootFolder)
})

function render (rootEl, folderArray) {
  rootEl.innerHTML = ''
  const folderMeta = folderArray.get(0)

  yArray.forEach(folder => {
    const _folderMeta = folder.get(0)

    if (_folderMeta.parent === folderMeta.id) {
      const folderEl = createFolderIconEl(_folderMeta)
      rootEl.appendChild(folderEl)
    }
  })

  for (let i = 1; i < folderArray.length; i++) {
    const folder = folderArray.get(i)
    const itemEl = createItemEl(folder)
    rootEl.appendChild(itemEl)
  }
}

function createFolderIconEl (folderMeta) {
  const { id, name } = folderMeta
  const folderIcon = document.createElement('div')
  folderIcon.classList.add('folder-icon')
  folderIcon.classList.add('item')
  folderIcon.innerHTML = `
    <div>
      <input type="checkbox" />
      <button>View</button>
      <button>Move item into...</button>
    </div>
    <div>${id}</div>
    <div>${name}</div>
  `
  return folderIcon
}

function createItemEl (itemMeta) {
  const { id, name } = itemMeta
  const itemEl = document.createElement('div')
  itemEl.classList.add('item-icon')
  itemEl.classList.add('item')
  itemEl.innerHTML = `
    <div>
      <input type="checkbox" />
    </div>
    <div>${id}</div>
    <div>${name}</div>
  `
  return itemEl
}

document.querySelector('.add-folder').addEventListener('click', () => {
  const newFolder = new Y.Array()
  newFolder.push([{ id: nanoid(), parent: '_ROOT_', name: 'New Folder' }])
  yArray.push([newFolder])
})

document.querySelector('.add-item').addEventListener('click', () => {
  rootFolder.push([{ id: nanoid(), name: 'New Item' }])
})
