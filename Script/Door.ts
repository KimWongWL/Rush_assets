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

    onEnable() {
        if (this.door) {
            this.door.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onDisable() {
        if (this.door) {
            this.door.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    public disalbeForPlayer() {
        //set to door
        this.wall.group = this.power(2, 4);
        this.timeout = 1;
    }

    enableForPlayerNMonster() {
        //set to wall
        this.wall.group = this.power(2, 1);
        this.timeout = 0;
    }

    power(num, index) {
        if (index == 1) {
            return num;
        }
        else {
            return this.power(num,index - 1) * num;
        }
    }

    update(deltaTime: number) {
        if (this.timeout > 0) {
            this.timeout -= deltaTime;
            if (this.timeout <= 0) {
                this.enableForPlayerNMonster();
            }
        }
    }

    onBeginContact(self, object, contact: IPhysics2DContact | null) {
        //group = 2 to the power of index....
        //console.log(object.node.name + ' ' + object.group + ' ' + object.tag);
        //head
        if (object.group == this.power(2, 5)) {
            if (object.tag == 0) {
                //falling state
                this.enableForPlayerNMonster();
                //object.tag = 2; 
            }
            else if (object.tag == 1) {
                this.disalbeForPlayer();
            }
        }

        //Foot
        if (object.group == this.power(2, 6) && this.timeout > 0) {
            //console.log(object.node.name + ' out');
            //this.wall.enabled = true;
            if (object.tag == 1) {
                this.enableForPlayerNMonster();
            }
        }
    }
}


