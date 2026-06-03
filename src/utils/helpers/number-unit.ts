export function numberUnit(
  input: number = 0,
  unitIndex: number = 0,
  step: number = 10000,
  unit: Array<string>
): number | string {
  let _input: number = Number(input);

  if (_input < 10000) return _input;

  let _unitIndex = Number(unitIndex || 0);
  const _step = Number(step || 10000);

  while (Math.abs(_input) >= _step) {
    _input = _input / _step;
    _unitIndex = _unitIndex + 1;
  }

  // if (Math.abs(input) >= _step) {
  //   return numberUnit(_input / _step, _unitIndex + 1, _step, unit);
  // }

  // ['万', '十万', '百万', '千万', '亿', '兆', '京'];
  // ['萬', '十萬', '百萬', '千萬', '億', '兆', '京'];
  const _unit: Array<string> = unit || [
    '萬',
    '十萬',
    '百萬',
    '千萬',
    '億',
    '兆',
    '京'
  ];

  return Number(_input.toFixed(1)) + (_unit[_unitIndex] || '');
}

export default numberUnit;
