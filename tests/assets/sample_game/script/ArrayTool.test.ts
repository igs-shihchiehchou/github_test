import { expect, jest, test } from '@jest/globals';
import { ArrayTool } from '../../../../assets/games/sample_game/script/ArrayTool';
import { Vec3 } from 'cc';

jest.mock('cc', () => ({
    Vec3: jest.fn().mockImplementation((x, y, z) => ({ x, y, z })),
}));

test('test fastRemoveArrayItemAt should return correct boolean', () => {
    expect(ArrayTool.fastRemoveArrayItemAt([1,2,3], 0)).toBe(true);
    expect(ArrayTool.fastRemoveArrayItemAt([1,2,3], 4)).toBe(false);
    expect(ArrayTool.fastRemoveArrayItemAt([1,2,3], -1)).toBe(false);
});

test('test getX should return correct x value from Vec3', () => {
    const vec3 = new Vec3(1, 2, 3);
    expect(ArrayTool.getX(vec3)).toBe(1);
});
