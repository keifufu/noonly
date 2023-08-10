import { MdFileDownload, MdInsertDriveFile } from 'react-icons/md'

import { Box } from '@chakra-ui/react'
import IconButton from '../IconButton'
import apiHost from 'library/utilities/apiHost'
import storage from 'library/utilities/storage'

interface IProps {
	mailId: string,
	attachment: Noonly.API.Data.MailAttachment
}

const MailAttachment: React.FC<IProps> = ({ mailId, attachment }) => {
	const downloadAttachment = () => {
		/*
		 * downloadFile({
		 * url: `${apiHost}/mail/downloadAttachment`,
		 * filename: attachment.filename,
		 * method: 'POST',
		 * body: JSON.stringify({ mailId, attachmentId: attachment.id })
		 * })
		 */
		fetch(`${apiHost}/mail/downloadAttachment?mailId=${mailId}&attachmentId=${attachment.id}&token=${storage.jwtToken}`)
			.then((res) => res.blob())
			.then((blob) => {
				const link = document.createElement('a')
				link.href = URL.createObjectURL(blob)
				link.download = attachment.filename
				link.click()
				link.remove()
			})
	}

	return (
		<Box
			rounded='lg'
			bg='gray.600'
			shadow='base'
			width='full'
			mr='2'
			py='1'
			pl='2'
			pr='1'
			display='flex'
			alignItems='center'
		>
			<Box h='8' mr='2'>
				<MdInsertDriveFile size='32' />
			</Box>
			<Box
				overflow='hidden'
				whiteSpace='nowrap'
				textOverflow='ellipsis'
				flex='1'
			>
				{attachment.filename}
			</Box>
			<IconButton
				aria-label='Download'
				tooltip='Download'
				variant='ghost'
				rIcon={MdFileDownload}
				onClick={downloadAttachment}
			/>
		</Box>
	)
}

export default MailAttachment