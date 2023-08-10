const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const { arrayToTree } = require('performant-array-to-tree')

const prisma
  = new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error']
  })

Object.defineProperty(Array.prototype, 'asyncForEach', { enumerable: false,
  writable: false,
  configurable: false,
  value: async function(fn, parallel = true) {
    if (parallel) {
      const promises = []
      for (let index = 0; index < this.length; index++)
        promises.push(fn(this[index], index, this))
      await Promise.all(promises)
    } else {
      for (let index = 0; index < this.length; index++)
        await fn(this[index], index, this)
    }
  } })

// async function makeDummyFolders(userId) {
//   for (let i = 0; i < 5000; i++) {
//     await prisma.cloudFolder.create({
//       data: {
//         id: i.toString(),
//         userId,
//         name: i.toString(),
//         parentFolder: i > 0 ? { connect: { id: (i - 1).toString() } } : {}
//       }
//     })
//   }
// }

// makeDummyFolders('test')

// const make = () => {
//   let output = '{ "include": { "childrenFolders_" } }'
//   for (let i = 0; i < 5000; i++)
//     output = output.replace('childrenFolders_"', 'childrenFolders": { "include": { "childrenFolders_" } }')
//   output = output.replace('childrenFolders_"', 'childrenFolders": true')
//   return JSON.parse(output)
// }

// fs.writeFileSync('test.json', JSON.stringify(make(), null, 2))

// async function getChildrenFoldersOfFolder(userId, folderId) {
//   const folders = await prisma.cloudFolder.findUnique({
//     where: { userId, id: folderId },
//     ...a
//   })
//   return folders
// }


let folders

function getFolderTree(userId, folderId, depth = 10) {
  const f = folders.find((e) => e.id === folderId)
  if (f) f.parentFolderId = null
  const tree = arrayToTree(folders, { id: 'id', parentId: 'parentFolderId', dataField: null, childrenField: 'childrenFolders' }).find((e) => e.id === folderId)
  if (depth === 0 || depth === null || depth === Infinity) return tree
  const run = (arr, depth, currDepth) => {
    arr.forEach((child) => {
      if (currDepth + 1 === depth) child.childrenFolders = []
      else run(child.childrenFolders, depth, currDepth + 1)
    })
  }
  run(tree?.childrenFolders || [], depth, 1)

  return tree
}

const flattenTree = (tree) => {
  const res = []
  const traverse = (node) => {
    res.push(node)
    if (node.childrenFolders) {
      for (const child of node.childrenFolders)
        traverse(child)
      node.childrenFolders = []
    }
  }
  traverse(tree)
  return res
}

async function cacheAllFolders(userId) {
  folders = await prisma.cloudFolder.findMany({ where: { userId },
    select: { id: true, parentFolderId: true, name: true, hasLink: true, sharedCount: true } })
}

const main = async () => {
  console.time('cache')
  await cacheAllFolders('test')
  console.timeEnd('cache')
  console.time('getChildrenFoldersOfFolder')
  fs.writeFileSync('db-output.json', JSON.stringify(getFolderTree('test', '4950'), null, 2))
  // fs.writeFileSync('db-output.json', JSON.stringify(flattenTree(getFolderTree('test', '343', 5)), null, 2))
  // fs.writeFileSync('db-output.json', JSON.stringify(await getFolderTree('test', '1'), null, 2))
  console.timeEnd('getChildrenFoldersOfFolder')
}

// main()