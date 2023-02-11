// shamelessly stolen from https://stackoverflow.com/a/16023872
export const humanFileSize = (bytes: number, si: boolean): string => {
  const thresh = si ? 1000 : 1024
  let _bytes = bytes
  if (_bytes < thresh) return `${_bytes}B`
  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let unitIndex = -1
  do {
    _bytes /= thresh
    ++unitIndex
  } while (_bytes >= thresh)
  return `${_bytes.toFixed(1)} ${units[unitIndex]}`
}
