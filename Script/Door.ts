import { _decorator, BoxCollider2D, Component, Node, Contact2DType, IPhysics2DContact, PhysicsSystem2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Door')
export class Door extends Component {

    @property({ type: Node })
    public wallNode: Node = null;

    wall: BoxCollider2D;
    door: BoxCollider2D;
    timeout: number;

    onLoad() {
        this.door = this.node.getComponent(BoxCollider2D);
        this.wall = this.wallNode.getComponent(BoxCollider2D);

        if (this.door) {
            this.door.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    update(deltaTime: number) {
        if (this.timeout > 0) {
            this.timeout -= deltaTime;
            if (this.timeout <= 0) {
                this.wall.enabled = true;
            }
        }
    }

    power(num, index) {
        if (index == 1) {
            return num;
        }
        else {
            return this.power(num,index - 1) * num;
        }
    }

    onBeginContact(self: BoxCollider2D, object: BoxCollider2D, contact: IPhysics2DContact | null) {
        //collide to player //group = 2 to the power of index....
        //console.log(object.node.name + ' ' + object.group + ' ' + object.tag);
        if (object.group == this.power(2, 2) && object.tag == 1) {
            console.log(object.node.name + ' in');
            this.wall.enabled = false;
            this.timeout = 1;
        }

        if (object.group == this.power(2, 6) && object.tag == 2 && this.timeout > 0) {
            console.log(object.node.name + ' out');
            this.wall.enabled = true;
            this.timeout = 0;
        }
    }
}


