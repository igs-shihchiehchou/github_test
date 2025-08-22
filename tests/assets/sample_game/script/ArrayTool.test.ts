import { expect, jest, test } from '@jest/globals';
import { ArrayTool } from '../../../../assets/games/sample_game/script/ArrayTool';
import { Vec3 } from 'cc';

jest.mock('cc', () => ({
    Vec3: jest.fn().mockImplementation((x, y, z) => ({ x, y, z })),
}));

test('test getX should return correct x value from Vec3', () => {
    const vec3 = new Vec3(1, 2, 3);
    expect(ArrayTool.getX(vec3)).toBe(1);
});
