import { test, expect } from '@jest/globals';
import { Node } from 'cc';
import { TestComponent } from '../../../../assets/games/sample_game/script/TestComponent';

test('TestComponent should return the correct testProperty value', () => {
    const node = new Node();
    const component = node.addComponent(TestComponent);
    const text = 'Hello, World!';

    component.testProperty = text;
    expect(component.getTestProperty()).toBe(text);
});
