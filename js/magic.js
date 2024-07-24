import * as Y from 'yjs'

const ydoc = new Y.Doc()
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
    const noteEl = createItemEl(folder)
    rootEl.appendChild(noteEl)
  }
}

function createFolderIconEl (folderMeta) {
  const { id } = folderMeta
  const folderIcon = document.createElement('div')
  folderIcon.classList.add('folder-icon')
  folderIcon.innerHTML = `
    <input type="checkbox" />
    <span>${id}</span>
    <button>View</button>
    <button>Move item into...</button>
  `
  return folderIcon
}

function createItemEl (itemMeta) {
  const { id } = itemMeta
  const noteIcon = document.createElement('div')
  noteIcon.classList.add('item-icon')
  noteIcon.innerHTML = `
    <input type="checkbox" />
    <span>${id}</span>
  `
}
