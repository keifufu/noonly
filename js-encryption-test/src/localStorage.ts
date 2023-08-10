const _data: any = {}
const localStorage = {
  setItem(key: any, data: any) {
    _data[key] = data
  },
  getItem(key: any) {
    return _data[key]
  }
}

export default localStorage