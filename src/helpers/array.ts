export class ArrayHelper {
  static arrayHasItems<T>(array1: T[], array2: T[]) {
    let result = false;
    for (let i = 0; i < array1.length; i++) {
      const arrayItem1 = array1[i];

      if (array2.includes(arrayItem1)) {
        result = true;
        break;
      }
    }

    return result;
  }
}
