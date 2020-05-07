export const loadState = (key?: string) => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }
    const json = JSON.parse(serializedState);
    if (key) return json[key];

    return json;
  } catch (err) {
    return undefined;
  }
};
export const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  } catch {
    // ignore write errors
  }
};
