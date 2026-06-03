export type HandleErrorFn = (
  amount: number,
  replaceString: string,
  error: unknown
) => string | number | void;

export function amountFormat(
  amount: number,
  formater: Array<string> | RegExp = [
    '\\B(?<!\\.\\d*)(?=(\\d{3})+(?!\\d))',
    'g'
  ],
  replaceString: string = ',',
  handleError: HandleErrorFn = handleSafari as HandleErrorFn
): void | string | number {
  let _formater: string | RegExp;
  try {
    if (Array.isArray(formater) && formater.length > 0) {
      _formater = new RegExp(formater[0] as string, formater[1]);
    } else {
      _formater = formater as string | RegExp;
    }
    if (Number.isNaN(Number(amount)) || !_formater) return amount;
    return `${amount}`.replace(_formater, replaceString);
  } catch (error: unknown) {
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
  const _amount: string = amountArray[0] as string;

  for (let i: number = _amount.length - 1; i >= 0; i--) {
    if (output.replaceAll(',', '').length % 3 === 0) {
      output = `${_amount[i]}${replaceString}` + output;
    } else {
      output = _amount[i] + output;
    }
  }
  return output.substring(0, output.length - 1) + `.${amountArray[1] || ''}`;
}
