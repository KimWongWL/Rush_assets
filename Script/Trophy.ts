import { _decorator, Component, Node, IPhysics2DContact, Contact2DType, BoxCollider2D, find } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('Trophy')
export class Trophy extends Component {

    col: BoxCollider2D;
    gm: GameManager;

    onLoad() {

        this.gm = find('Canvas/Game manager').getComponent(GameManager);
        this.col = this.node.getComponent(BoxCollider2D);

        if (this.col) {
            this.col.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    power(num, index) {
        if (index == 1) {
            return num;
        }
        else {
            return this.power(num, index - 1) * num;
        }
    } 

    onBeginContact(self, object, contact: IPhysics2DContact | null) {
        //console.log('hit');
        if (!this.node.active) {
            return;
        }
        //player
        if (object.group == this.power(2, 2)) {

            let area: string;

            if (this.node.parent.name.includes('castle')) {
                area = 'castle';
            } else {
                area = 'underground';
            }

            this.gm.pickTrophy(area);

        }
    }
}


