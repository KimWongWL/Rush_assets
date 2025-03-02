import { _decorator, Component, Node, v2, v3} from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {

    @property({ type: Node })
    player = null;
    playerSpeed = 0;
    center = v2(0, -200);
    follow = true; //follow the player?
     
    onLoad() {
        this.playerSpeed = this.player.getComponent(PlayerController).speed;
    }

    update(deltaTime: number) {
        //cal distance
        let x = this.player.position.x - (this.node.position.x + this.center.x);
        let y = this.player.position.y - (this.node.position.y + this.center.y);
        y *= 1.5;   //prevent player out of camera
        let dis = Math.sqrt(x * x + y * y);

        if (dis > 200) {
            this.follow = true;
        }

        if (this.follow) {
            this.node.translate(v3(x * deltaTime * 2.5, y * deltaTime * 2.5, 0));
            if (dis < 1) {
                this.follow = false;
            }
        }
    }
}


