export const ACTION = Object.freeze({
  MOVE_DAY: 'move-day',
  SHIFT_MONTH: 'shift-month',
  SHIFT_YEAR: 'shift-year',
  JUMP_START_OF_MONTH: 'jump-start-month',
  JUMP_END_OF_MONTH: 'jump-end-month',
  SELECT: 'select',
});

export function keyToAction(key, shift, _selected) {
  switch (key) {
    case 'ArrowLeft': return { type: ACTION.MOVE_DAY, delta: -1 };
    case 'ArrowRight': return { type: ACTION.MOVE_DAY, delta: 1 };
    case 'ArrowUp': return { type: ACTION.MOVE_DAY, delta: -7 };
    case 'ArrowDown': return { type: ACTION.MOVE_DAY, delta: 7 };
    case 'Home': return { type: ACTION.JUMP_START_OF_MONTH };
    case 'End': return { type: ACTION.JUMP_END_OF_MONTH };
    case 'PageUp': return shift ? { type: ACTION.SHIFT_YEAR, delta: -1 } : { type: ACTION.SHIFT_MONTH, delta: -1 };
    case 'PageDown': return shift ? { type: ACTION.SHIFT_YEAR, delta: 1 } : { type: ACTION.SHIFT_MONTH, delta: 1 };
    case 'Enter':
    case ' ':
      return { type: ACTION.SELECT };
    default:
      return null;
  }
}
