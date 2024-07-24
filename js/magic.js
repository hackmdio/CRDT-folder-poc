import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { nanoid } from 'nanoid'

const ydoc = new Y.Doc()
const provider = new WebrtcProvider('crdt-folder', ydoc, { signaling: ['ws://localhost:4444'] })
const yArray = ydoc.getArray('magic')
let rootFolder
let currentViewFolder

ydoc.on('update', update => {
  initRootFolder()
  if (!currentViewFolder) {
    currentViewFolder = rootFolder
  }
  render(document.querySelector('.overview'), currentViewFolder)
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
      <button class="view-folder">View</button>
      <button class="move-into">Move selected item into here</button>
      <button class="delete-item">Delete</button>
    </div>
    <div>${id}</div>
    <div>${name}</div>
  `
  folderEl.dataset.id = id
  folderEl.querySelector('.view-folder').addEventListener('click', viewFolderHandler)
  folderEl.querySelector('.delete-item').addEventListener('click', deleteItemHandler)
  return folderEl
}

function viewFolderHandler (event) {
  const id = event.target.closest('.item').dataset.id
  const folder = findFolder(id)
  currentViewFolder = folder
  render(document.querySelector('.overview'), folder)
}

function findFolder (id) {
  let folder
  yArray.forEach(f => {
    if (f.get(0).id === id) {
      folder = f
    }
  })
  return folder
}

function createItemEl (itemMeta) {
  const { id, name } = itemMeta
  const itemEl = document.createElement('div')
  itemEl.classList.add('item-icon')
  itemEl.classList.add('item')
  itemEl.innerHTML = `
    <div>
      <input type="checkbox" />
      <button class="delete-item">Delete</button>
    </div>
    <div>${id}</div>
    <div>${name}</div>
  `
  itemEl.dataset.id = id
  itemEl.querySelector('.delete-item').addEventListener('click', deleteItemHandler)
  return itemEl
}

document.querySelector('.add-folder').addEventListener('click', () => {
  initRootFolder()
  const newFolder = new Y.Array()
  const parentId = currentViewFolder.get(0).id
  newFolder.push([{ id: nanoid(), parent: parentId, name: 'New Folder' }])
  yArray.push([newFolder])
})

document.querySelector('.add-item').addEventListener('click', () => {
  initRootFolder()
  currentViewFolder.push([{ id: nanoid(), name: 'New Item' }])
})

document.querySelector('.delete').addEventListener('click', () => {
  let idSet = new Set()
  document.querySelectorAll('.item input[type="checkbox"]:checked').forEach(el => {
    const id = el.closest('.item').dataset.id
    idSet.add(id)
  })
  deleteItems(idSet)
})

function deleteItemHandler (event) {
  const id = event.target.closest('.item').dataset.id
  deleteItems(new Set([id]))
}

function deleteItems (idSet) {
  ydoc.transact(() => {
    for (let i = yArray.length - 1; i >= 0; i--) {
      const folder = yArray.get(i)
      for (let j = folder.length - 1; j > 0; j--) {
        const id = folder.get(j).id
        if (idSet.has(id)) {
          folder.delete(j)
          idSet.delete(id)
        }
      }

      const id = folder.get(0).id
      if (idSet.has(id)) {
        yArray.delete(i)
        idSet.delete(id)
      }
    }
  })
}
