const nodePath = require('path')
const fs = require('fs')

function tree(dir, username, depth, maxDepth) {
	dir = nodePath.normalize(dir).split('\\').join('/')
	return new Promise(resolve => {
		let arr = dir.split(username)
		let path = arr[arr.length - 1]
		path = path.length === 0 ? '/' : path
		let results = [ { path: path, files: [], folders: [] } ]
		if(depth === maxDepth) return resolve(results)
		const list = fs.readdirSync(dir)
		let pending = list.length
		if(!pending) return resolve(results)
		depth++
		list.forEach(file => {
			const stat = fs.statSync(`${dir}/${file}`)
			if(stat && stat.isDirectory()) {
				tree(`${dir}/${file}`, username, depth, maxDepth).then(res => {
					results[0].folders.push({ name: file, createdAt: Math.floor(stat.birthtimeMs / 1000), type: 'folder', path: `${path}${path.length > 1 ? '/' : ''}${file}` })
					results = results.concat(res)
					if(!--pending) resolve(results)
				})
			} else {
				results[results.indexOf(results.find(e => e.path === path))].files.push({ name: file, size: stat.size, createdAt: Math.floor(stat.birthtimeMs / 1000), type: 'file', path: `${path}${path.length > 1 ? '/' : ''}${file}` })
				if(!--pending) resolve(results)
			}
		})
	})
}

function dirTree(filename, origPath) {
	filename = nodePath.normalize(filename)
	origPath = nodePath.normalize(origPath)
	const stats = fs.lstatSync(filename)
	const info = { name: nodePath.basename(filename) }
	info.id = filename.split(origPath)[1].split('\\').join('/')

	if (stats.isDirectory()) {
		info.type = 'folder'
		info.children = fs.readdirSync(filename).map(child => {
			return dirTree(filename + '/' + child, origPath)
		}).filter(e => e.type === 'folder')
	} else info.type = 'file'
	return info
}

function rimraf(dir_path) {
	if (fs.existsSync(dir_path)) {
		fs.readdirSync(dir_path).forEach(function(entry) {
			var entry_path = nodePath.join(dir_path, entry);
			if (fs.lstatSync(entry_path).isDirectory()) {
				rimraf(entry_path);
			} else {
				fs.unlinkSync(entry_path);
			}
		});
		fs.rmdirSync(dir_path);
	}
}

function copyFolderRecursiveSync(src, dest) {
	const exists = fs.existsSync(src)
	const stats = exists && fs.statSync(src)
	const isDirectory = exists && stats.isDirectory()
	if(isDirectory) {
		fs.mkdirSync(dest)
		fs.readdirSync(src).forEach(item => {
			copyFolderRecursiveSync(nodePath.join(src, item), nodePath.join(dest, item))
		})
	} else {
		fs.copyFileSync(src, dest)
	}
}

function folderFileSize(path, sizeInBytes) {
	const files = fs.readdirSync(path)
	sizeInBytes = sizeInBytes || 0
	files.forEach(file => {
		const stats = fs.statSync(`${path}/${file}`)
		if(stats.isDirectory()) sizeInBytes = folderFileSize(`${path}/${file}`, sizeInBytes)
		else sizeInBytes += stats.size
	})
	return sizeInBytes
}

function findFirstAvailable(path, i = 1) {
	const parsed = nodePath.parse(path)
	const files = fs.readdirSync(parsed.dir)
	let curName = `${parsed.name} (${i})${parsed.ext}`
	if(files.includes(curName)) return findFirstAvailable(path, i + 1)
	return curName
}

module.exports = {
	generateToken(length) {
		let result = ''
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length))
		}
		return result
	},
	rimraf,
	tree,
	dirTree,
	copyFolderRecursiveSync,
	folderFileSize,
	findFirstAvailable
}