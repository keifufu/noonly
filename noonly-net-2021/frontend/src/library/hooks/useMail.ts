import { RootState } from 'main/store/store'
import useMailSort from './useMailSort'
import { useSelector } from 'react-redux'

const useMail = (archived: boolean, trash: boolean, sent: boolean, page: number): [Noonly.API.Data.Mail[], Noonly.API.Data.Mail[], Noonly.API.Data.Mail[]] => {
	const mail = useSelector((state: RootState) => state.mail)
	const selectedAddress = useSelector((state: RootState) => state.user.selectedAddress)
	/* Reminder: Array.filter removes elements that return `false` */
	const visibleMail = mail.filter((mail) => (
		(mail.sentToAddressId === selectedAddress)
		&& (!mail.inReplyTo)
		&& (trash ? mail.trash : !mail.trash)
		&& (archived ? mail.archived : trash ? mail.trash : !mail.archived)
		&& (sent ? mail.sentFromAddressId : !mail.sentFromAddressId)
	))
	const sortedMail = useMailSort(visibleMail)
	const pageMail = sortedMail.slice((page - 1) * 25, page * 25)
	const allMailNotReply = visibleMail

	return [mail, pageMail, allMailNotReply]
}

export default useMail