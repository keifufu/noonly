import winax from 'winax'

const obApp = winax.Object('hMailServer.Application')
obApp.Authenticate('Administrator', 'hY->RYD7nqF0Kz*-OIHK&yP6')

const obDomain = obApp.Domains.ItemByName('noonly.net')
const obAccount = new obDomain.Accounts.Add

obAccount.Address = 'addr'
obAccount.Password = 'pass'
obAccount.Active = true
// In MB
obAccount.MaxSize = 100

obAccount.ForwardAddress = 'nrf2yft19hxywob69b3ab@noonly.net'
obAccount.ForwardEnabled = true
obAccount.ForwardKeepOriginal = true

obAccount.Save()