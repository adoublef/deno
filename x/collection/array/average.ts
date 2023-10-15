export const average = (
    previousValue: number,
    currentValue: number,
    currentIndex: number,
    array: number[],
): number => previousValue + (currentValue / array.length);
