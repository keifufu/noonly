// eslint-disable-next-line max-params
function applyCloudFilter(cloud, type, currentParent, displayTrash) {
	/* If the parent of a file is not in trash while the file is in trash, display the file */
	return Object.values(cloud)
		.filter((e) => e.type === type)
		.filter((e) => {
			if (!displayTrash || e.parent_id === null || currentParent !== null)
				return e.parent_id === currentParent
			const parent = cloud[e.parent_id]
			return !parent.trash
		})
		.filter((e) => (e.trash ? displayTrash : !displayTrash))
}

export default applyCloudFilter