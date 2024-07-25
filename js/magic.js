import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { nanoid } from 'nanoid'

const ydoc = new Y.Doc()
const provider = new WebrtcProvider('crdt-folder', ydoc, { signaling: ['ws://localhost:4444'] })
const yArray = ydoc.getArray('magic')
let rootFolder
let currentViewFolder
let selectedItems = new Set()

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
      folderEl.dataset.parentFolderId = folderMeta.id
      rootEl.appendChild(folderEl)
    }
  })

  for (let i = 1; i < folderArray.length; i++) {
    const item = folderArray.get(i)
    const itemEl = createItemEl(item)
    itemEl.dataset.parentFolderId = folderMeta.id
    rootEl.appendChild(itemEl)
  }

  updateBackButtonState()
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
      <button class="rename">Rename</button>
    </div>
    <div>${id}</div>
    <div class="name">${name}</div>
  `
  folderEl.dataset.id = id
  folderEl.querySelector('input[type="checkbox"]').addEventListener('change', checkboxHandler)
  folderEl.querySelector('.view-folder').addEventListener('click', viewFolderHandler)
  folderEl.querySelector('.delete-item').addEventListener('click', deleteItemHandler)
  folderEl.querySelector('.rename').addEventListener('click', renameHandler)
  return folderEl
}

function viewFolderHandler (event) {
  const id = event.target.closest('.item').dataset.id
  const folder = findFolder(id)
  currentViewFolder = folder
  render(document.querySelector('.overview'), folder)
}

function updateBackButtonState () {
  const backButton = document.querySelector('.go-back')
  backButton.toggleAttribute('disabled', currentViewFolder.get(0).id === rootFolder.get(0).id)
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
      <button class="rename">Rename</button>
    </div>
    <div>${id}</div>
    <div class="name">${name}</div>
  `
  itemEl.dataset.id = id
  itemEl.querySelector('input[type="checkbox"]').addEventListener('change', checkboxHandler)
  itemEl.querySelector('.delete-item').addEventListener('click', deleteItemHandler)
  itemEl.querySelector('.rename').addEventListener('click', renameHandler)
  return itemEl
}

document.querySelector('.go-back').addEventListener('click', () => {
  const parentId = currentViewFolder.get(0).parent
  const folder = findFolder(parentId)
  currentViewFolder = folder
  render(document.querySelector('.overview'), folder)
})

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
  deleteItems(selectedItems)
  selectedItems.clear()
})

function checkboxHandler (event) {
  const id = event.target.closest('.item').dataset.id
  if (event.target.checked) {
    selectedItems.add(id)
  } else {
    selectedItems.delete(id)
  }
}

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

function renameHandler (event) {
  const targetEl = event.target.closest('.item')
  const id = targetEl.dataset.id
  const isFolder = targetEl.classList.contains('folder-icon')
  if (isFolder) {
    const folder = findFolder(id)
    const folderMeta = folder.get(0)
    const newName = prompt('Enter new folder name', folderMeta.name)
    ydoc.transact(() => {
      folder.delete(0)
      folder.insert(0, [{ ...folderMeta, name: newName }])
    })
  } else {
    const parentFolderId = targetEl.dataset.parentFolderId
    const parentFolder = findFolder(parentFolderId)
    const itemIdx = parentFolder.toArray().findIndex(item => item.id === id)
    const itemMeta = parentFolder.get(itemIdx)
    const newName = prompt('Enter new item name', itemMeta.name)
    ydoc.transact(() => {
      parentFolder.delete(itemIdx)
      parentFolder.insert(itemIdx, [{ ...itemMeta, name: newName }])
    })
  }
}
