import { Vec3 } from 'cc';

export class ArrayTool {
    public static fastRemoveArrayItemAt(array: unknown[], index: number): boolean {
        if (array) {
            const length = array.length;
            if (index < 0 || index >= length) {
                return false;
            }

            array[index] = array[length - 1];
            array.length = length - 1;
        }

        return true;
    }

    public static getX(vec3: Vec3): number {
        return vec3.x;
    }
}
