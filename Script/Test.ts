import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {

    @property
    public aaa: number = 0;
    @property({ type: Node })
    public bbb = null;

    start() {

    }

    update(deltaTime: number) {
        
    }
}


