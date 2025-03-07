import { _decorator, Component, Node, BoxCollider2D, IPhysics2DContact, Contact2DType } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {

    bullet: BoxCollider2D;

    onLoad() {

        this.bullet = this.node.getComponent(BoxCollider2D);

        if (this.bullet) {
            this.bullet.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
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

    onEnable() {
        console.log('hi');
    }

    onBeginContact(self: BoxCollider2D, object: BoxCollider2D, contact: IPhysics2DContact | null) {
        //wall
        if (object.group == this.power(2, 1) ) {
            this.node.active = false;
        }
    }
}


