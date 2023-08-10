const useMailSort = (mail: Noonly.API.Data.Mail[]): Noonly.API.Data.Mail[] => {
	const sortedMail = mail.sort((a, b) => (Date.parse(b.dateReceived) - Date.parse(a.dateReceived)))
	return sortedMail
}

export default useMailSort