// Minimal runtime mock of the Cocos "cc" module for unit tests

export class Component {
    // Node the component is attached to
    public node: Node | null = null;
}

export class Node {
    public name: string;
    public components: Component[] = [];

    constructor(name: string = "") {
        this.name = name;
    }

    addComponent<T extends Component>(Ctor: new (...args: any[]) => T): T {
        const inst = new Ctor();
        inst.node = this;
        this.components.push(inst);
        return inst;
    }
}

// No-op decorators compatible with Creator's API surface used in tests
export const _decorator = {
    // Class decorator: no-op for tests
    ccclass: (_name?: string) => (ctor: any) => ctor,
    
    // Property decorator: Handle both factory pattern and direct application
    property: (...args: any[]) => {
        // Check if this is called without parameters (@property)
        if (args.length === 0) {
            // Return the actual decorator function
            return (target: any, key: string | symbol, descriptor?: PropertyDescriptor) => {
                // Return undefined to not change the property descriptor
                return undefined;
            };
        }
        
        // If called with arguments, this is direct application (legacy behavior)
        // Just return undefined to not change the property
        return undefined;
    },
};

// Commonly destructured aliases from _decorator in engine code
export const { ccclass, property } = _decorator;
