import { simpleParser, Attachment, AddressObject, Headers } from 'mailparser'

// Keep in mind that gmail uses X-Forwarded-To and X-Forwarded-For

// An empty "from" field is allowed according to RFC 6854.
// Even though RFC 6854 allows group syntax in the 'from' field, it also
// discourages from using it and since mailparser seems to only return ONE
// AddressObject, we will only use the first one parsed by mailparser.

simpleParser('./eml/test.eml').then((mail) => {
  // destruct mail object
  const {
    attachments, bcc, cc, date, from, headerLines, headers, html, inReplyTo, messageId, priority, references, replyTo, subject, text, textAsHtml, to
  } = mail

  // Parse Attachments
  const parsedAttachments = parseAttachments(attachments)

  // Parse Recipients
  const parsedToAddresses = parseRecipients(to)
  const parsedCCAddresses = parseRecipients(cc)
  const parsedBCCAddresses = parseRecipients(bcc)
  const parsedForwardedAddresses = parseForwardedAddresses(headers)

  // Parse Date
  const parsedDate = parseDate(date)

  // Parse from
  const parsedSender = parseSender(from, headers)

  const data = {
    attachments: parsedAttachments,
    to: parsedToAddresses,
    bcc: parsedBCCAddresses,
    cc: parsedCCAddresses,
    forwarded: parsedForwardedAddresses,
    date: parsedDate,
    from: parsedSender
  }

  console.log(data)
})

interface MailSender {
  from: MailAddress[],
  sender: MailAddress
}

const parseSender = (from: AddressObject | undefined, headers: Headers): MailSender | undefined => {
  if (from === undefined || from.value === undefined || from.value.length === 0)
    return undefined

  // i dont even know, "from" can apparently have multiple senders BUT mailparser only returns ONE
}

const parseForwardedAddresses = (headers: Headers): MailAddress[] => {
  const forwardedAddresses = headers['X-Forwarded-To'] as string | undefined

  const returnValue: MailAddress[] = []
  if (forwardedAddresses === undefined)
    return returnValue
  
  forwardedAddresses.split(' ').forEach((address) => {
    returnValue.push({
      address,
      name: address.split('@')[0]
    })
  })

  return returnValue
}

interface MailDate {
  sentAt: Date
  receivedAt: Date
}

const parseDate = (date: Date | undefined): MailDate => ({
  sentAt: (date === undefined) ? new Date() : date,
  receivedAt: new Date()
})

interface MailAddress {
  address: string
  name: string
}

const parseRecipients = (addrObj: AddressObject | AddressObject[] | undefined): MailAddress[] => {
  const returnValue: MailAddress[] = []
  if (addrObj === undefined)
    return returnValue

  if (addrObj instanceof Array) {
    addrObj.map((addrObj) => {
      addrObj.value?.forEach((addr) => {
        if (typeof addr.address === 'string')
          returnValue.push({
            address: addr.address,
            name: addr.name
          })
      })
    })
    return returnValue
  }

  addrObj.value?.forEach((addr) => {
    if (typeof addr.address === 'string')
      returnValue.push({
        address: addr.address,
        name: addr.name
      })
  })

  return returnValue
}

const parseAttachments = (attachments: Attachment[]) => {
  return attachments.map(({ content, contentType, filename, size, cid, related }) => {
    return {
      content,
      contentType,
      filename,
      size,
      cid,
      related
    }
  })
}