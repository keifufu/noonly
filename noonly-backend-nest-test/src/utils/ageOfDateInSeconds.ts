const ageOfDateInSeconds = (date: string | Date) => Math.floor(Date.now() / 1000) - Math.floor(Date.parse(typeof date === 'string' ? date : date.toISOString()) / 1000)

export default ageOfDateInSeconds