import { _decorator, Component, Node, IPhysics2DContact, Contact2DType, BoxCollider2D } from 'cc';
import { Shooter } from './Shooter';
import { Roller } from './Roller';
const { ccclass, property } = _decorator;

@ccclass('Sword')
export class Sword extends Component {

    col: BoxCollider2D;
    public attackPoint: number = 0;
    hitList: string[] = [];

    onLoad() {
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

    public resetHitList() {
        this.hitList = [];
    }

    onBeginContact(self, object, contact: IPhysics2DContact | null) {
        //console.log('hit');
        if (!this.col.enabled) {
            return;
        }
        //monster
        if (object.group == this.power(2, 3)) {

            for (let i = 0; i < this.hitList.length; i++) {
                if (this.hitList[i] == object.node.name) {
                    return;
                }
            }

            this.hitList.push(object.node.name);
            let ts = object.node.getComponent(Shooter);
            if (!ts) {
                ts = object.node.getComponent(Roller);
            }
            ts.hurt(this.attackPoint);
        }
    }
}


