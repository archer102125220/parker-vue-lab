export function amountFormat(
  amount: number,
  formater: Array<string> | RegExp = [
    '\\B(?<!\\.\\d*)(?=(\\d{3})+(?!\\d))',
    'g'
  ],
  replaceString: string = ',',
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  handleError: Function = handleSafari
): void | string | number {
  let _formater: string | RegExp;
  try {
    if (Array.isArray(formater) && formater.length > 0) {
      _formater = new RegExp(formater[0], formater[1]);
    } else {
      // TODO
      // eslint-disable-next-line
      // @ts-ignore
      _formater = formater;
    }
    if (isNaN(amount) || !_formater) return amount;
    return `${amount}`.replace(_formater, replaceString);
  } catch (error) {
    console.log('Safari error?');
    console.error(error);
    if (typeof handleError === 'function') {
      return handleError(amount, replaceString, error);
    }
  }
}

export default amountFormat;

function handleSafari(amount: number, replaceString: string = ','): string {
  let output: string = '';
  const amountArray: Array<string> = `${amount}`.replaceAll(',', '').split('.');
  const _amount: string = amountArray[0];

  for (let i: number = _amount.length - 1; i >= 0; i--) {
    if (output.replaceAll(',', '').length % 3 === 0) {
      output = `${_amount[i]}${replaceString}` + output;
    } else {
      output = _amount[i] + output;
    }
  }
  return output.substring(0, output.length - 1) + `.${amountArray[1] || ''}`;
}
