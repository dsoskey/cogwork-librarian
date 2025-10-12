
function setIfNotDefined(key: string, value: any) {
  if (localStorage.getItem(key) === undefined) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function loadDefaultPreferences() {
  setIfNotDefined('auto-find-cube.coglib.sosk.watch', true);
  setIfNotDefined('auto-refresh-cube.coglib.sosk.watch', false);
  setIfNotDefined('refresh-rate.coglib.sosk.watch', 3);
  setIfNotDefined('refresh-units.coglib.sosk.watch', 'days');
}