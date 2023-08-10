import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Collapse } from '@chakra-ui/react'
import { Dispatch, RootState } from 'main/store/store'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import FileCard, { FileCardSkeleton } from 'library/components/FileCard'
import { useDispatch, useSelector } from 'react-redux'
import { useMemo, useState } from 'react'

import { BsCaretRightFill } from 'react-icons/bs'
import CloudDropzone from './CloudDropzone'
import Draggable from './Draggable'
import Grid from '@bit/mui-org.material-ui.grid'
import { Helmet } from 'react-helmet-async'
import { InitialLoadTypes } from '@types'
import Invisible from 'library/components/Invisible'
import PageProgress from 'library/components/PageProgress'
import applyCloudSort from 'library/common/sort/applyCloudSort'
import filterByQuery from 'library/utilities/filterByQuery'
import useInitialLoad from 'library/hooks/useInitialLoad'
import useSearch from 'library/hooks/useSearch'

interface FileContainerProps {
	title: string,
	files: Noonly.API.Data.File[],
	hasLoaded: boolean,
	ghostItems: number,
	selection: string[]
}

const FileContainer: React.FC<FileContainerProps> = ({ title, files, hasLoaded, ghostItems, selection }) => {
	const [isExtended, setIsExtended] = useState(true)
	return (
		<Invisible invisible={files.length === 0 && hasLoaded}>
			<Box
				mb='1'
				mt={files.length > 0 ? '3' : undefined}
				letterSpacing='wide'
				display='flex'
				alignItems='center'
			>
				<Box
					cursor='pointer'
					mr='1'
					onClick={() => setIsExtended(!isExtended)}
				>
					{title}
				</Box>
				<Box size='10' transition='transform 0.15s linear' transform={`rotate(${isExtended ? '90' : '0'}deg)`} fontSize='xs' flexShrink={0} as={BsCaretRightFill} />
			</Box>
			<Collapse in={isExtended}>
				<Grid container spacing={1}>
					<Invisible invisible={hasLoaded}>
						{Array(ghostItems).fill(0).map((e, i) => (
							<Grid item key={i}>
								<FileCardSkeleton />
							</Grid>
						))}
					</Invisible>
					{files.map((file) => (
						<Grid tabIndex={0} item key={file.id}>
							<Draggable id={file.id}>
								<FileCard
									file={file}
									isSelected={selection.includes(file.id)}
								/>
							</Draggable>
						</Grid>
					))}
				</Grid>
			</Collapse>
		</Invisible>
	)
}

const getBreadcrumbs = (rawFiles: Noonly.State.Files, parentId: string, breadcrumbs?: any[]): any[] => {
	const result = breadcrumbs || []
	const parent = rawFiles[parentId]
	if (parent) {
		result.push({
			name: parent.name,
			id: parent.id
		})
		return getBreadcrumbs(rawFiles, parent?.parentId, result)
	} else {
		return result
	}
}

interface BreadcrumbProps {
	rawFiles: Noonly.State.Files,
	parentId: string
}

const CloudBreadcrumbs: React.FC<BreadcrumbProps> = ({ rawFiles, parentId }) => {
	const breadcrumbs = getBreadcrumbs(rawFiles, parentId).reverse()
	return (
		<Breadcrumb>
			<BreadcrumbItem>
				<BreadcrumbLink href='/cloud/user'>
					Cloud
				</BreadcrumbLink>
			</BreadcrumbItem>
			{breadcrumbs.map(({ name, id }) => (
				<BreadcrumbItem>
					<BreadcrumbLink href={`/cloud/user/${id}`}>
						{name}
					</BreadcrumbLink>
				</BreadcrumbItem>
			))}
		</Breadcrumb>
	)
}

interface IProps {
	shared: boolean,
	trash: boolean,
	match: {
		params: {
			parentId?: string
		}
	}
}

const Cloud: React.FC<IProps> = ({ shared, trash, match: { params: { parentId: _parentId } } }) => {
	const search = useSearch()
	const dispatch: Dispatch = useDispatch()
	const sort = useSelector((state: RootState) => state.sort.cloud)
	const hasLoaded = useInitialLoad(InitialLoadTypes.FILES)
	const parentId = _parentId ? _parentId : 'NULL'
	const rawFiles = useSelector((state: RootState) => state.files)
	const filesArray = useMemo(() => Object.values(rawFiles).filter((e) => (trash ? e.trash : !e.trash)), [rawFiles, trash])
	const allFiles = useMemo(() => applyCloudSort(filterByQuery(filesArray, search), sort), [filesArray, search, sort])
	const files = useMemo(() => allFiles.filter((file) => !file.isFolder), [allFiles])
	const folders = useMemo(() => allFiles.filter((file) => file.isFolder), [allFiles])
	const selection = useSelector((state: RootState) => state.selection.files)

	const [activeId, setActiveId] = useState<null | string>(null)
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 1
			}
		})
	)

	return (<>
		<Helmet>
			<title>Cloud - {process.env.REACT_APP_NAME}</title>
		</Helmet>
		<PageProgress loading={!hasLoaded} />
		<CloudBreadcrumbs rawFiles={rawFiles} parentId={parentId} />
		<CloudDropzone parentId={parentId}>
			<DndContext
				autoScroll
				sensors={sensors}
				onDragStart={(e) => setActiveId(e.active.id)}
				onDragEnd={() => setActiveId(null)}
			>
				<Box
					overflowY='scroll'
					overflowX='hidden'
					rounded='md'
					h='full'
					onContextMenu={(e) => dispatch.contextMenu.open({ id: 5, e, data: { parentId } })}
				>
					<FileContainer title='Folders' files={folders} hasLoaded={hasLoaded} ghostItems={13} selection={selection} />
					<FileContainer title='Files' files={files} hasLoaded={hasLoaded} ghostItems={23} selection={selection} />
				</Box>
				<DragOverlay
					dropAnimation={{ duration: 0, easing: '' }}
					style={{ width: 'auto' }}
				>
					{activeId && selection.includes(activeId) ? (
						<Box
							p='3'
							bg='gray.700'
							opacity='0.7'
							rounded='md'
						>
							Move {selection.length} Item{selection.length > 1 ? 's' : ''}
						</Box>
					) : (
						<FileCard file={rawFiles[activeId || ''] || {}} />
					)}
				</DragOverlay>
			</DndContext>
		</CloudDropzone>
	</>)
}

export default Cloud