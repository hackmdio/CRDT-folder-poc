import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { nanoid } from 'nanoid'

const ydoc = new Y.Doc()
const provider = new WebrtcProvider('crdt-folder', ydoc, { signaling: ['ws://localhost:4444'] })
const yArray = ydoc.getArray('magic')
let rootFolder

ydoc.on('update', update => {
  initRootFolder()
  render(document.querySelector('.overview'), rootFolder)
})

function initRootFolder () {
  if (yArray.length === 0) {
    rootFolder = new Y.Array()
    rootFolder.push([{ id: '_ROOT_', parent: null, name: 'root' }])
    yArray.push([rootFolder])
  } else {
    rootFolder = yArray.get(0)
  }
}

function render (rootEl, folderArray) {
  rootEl.innerHTML = ''
  const folderMeta = folderArray.get(0)

  yArray.forEach(folder => {
    const _folderMeta = folder.get(0)

    if (_folderMeta.parent === folderMeta.id) {
      const folderEl = createFolderEl(_folderMeta)
      rootEl.appendChild(folderEl)
    }
  })

  for (let i = 1; i < folderArray.length; i++) {
    const item = folderArray.get(i)
    const itemEl = createItemEl(item)
    rootEl.appendChild(itemEl)
  }
}

function createFolderEl (folderMeta) {
  const { id, name } = folderMeta
  const folderEl = document.createElement('div')
  folderEl.classList.add('folder-icon')
  folderEl.classList.add('item')
  folderEl.innerHTML = `
    <div>
      <input type="checkbox" />
      <button>View</button>
      <button>Move item into...</button>
    </div>
    <div>${id}</div>
    <div>${name}</div>
  `
  folderEl.dataset.id = id
  return folderEl
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
  itemEl.dataset.id = id
  return itemEl
}

document.querySelector('.add-folder').addEventListener('click', () => {
  initRootFolder()
  const newFolder = new Y.Array()
  newFolder.push([{ id: nanoid(), parent: '_ROOT_', name: 'New Folder' }])
  yArray.push([newFolder])
})

document.querySelector('.add-item').addEventListener('click', () => {
  initRootFolder()
  rootFolder.push([{ id: nanoid(), name: 'New Item' }])
})

document.querySelector('.delete').addEventListener('click', () => {
  let deletedSet = new Set()
  document.querySelectorAll('.item input[type="checkbox"]:checked').forEach(el => {
    const id = el.closest('.item').dataset.id
    deletedSet.add(id)
  })

  ydoc.transact(() => {
    for (let i = yArray.length - 1; i > 0; i--) {
      const folder = yArray.get(i)
      for (let j = folder.length - 1; j > 0; j--) {
        const id = folder.get(j).id
        if (deletedSet.has(id)) {
          folder.delete(j)
          deletedSet.delete(id)
        }
      }

      const id = folder.get(0).id
      if (deletedSet.has(id)) {
        yArray.delete(i)
        deletedSet.delete(id)
      }
    }
  })
})
