import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TestComponent')
export class TestComponent extends Component {
    // Decorated property; default assigned later by user/test
    @property
    public testProperty: string = 'abc';

    public getTestProperty(): string {
        return this.testProperty;
    }
}
