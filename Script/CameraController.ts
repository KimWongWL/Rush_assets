import { _decorator, Component, Node, v2, v3, math} from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {

    @property({ type: Node })
    player = null;
    playerSpeed = 0;
    center = v2(0, -200);
    follow = true; //follow the player?
    xMax = 169;
    xMin = -369;
    yMax = 209;
    yMin = -343;
     
    onLoad() {
        this.playerSpeed = this.player.getComponent(PlayerController).speed;

        let tol = 50;
        this.xMax += tol;
        this.xMin += -tol;
        this.yMax += tol/2;
        this.yMin += -tol;
    }

    cap(num: number, max: number, min: number) {

        if (num > max) {
            return max;
        }

        if (num < min) {
            return min;
        }

        return num;
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

            let xMove = x * deltaTime * 2.5;
            let yMove = y * deltaTime * 2.5;
            let targetPos = v2(this.node.position.x + xMove, this.node.position.y + yMove);
            xMove = this.cap(targetPos.x, this.xMax, this.xMin) - this.node.position.x;
            yMove = this.cap(targetPos.y, this.yMax, this.yMin) - this.node.position.y;

            this.node.translate(v3(xMove, yMove, 0));
            if (dis < 1) {
                this.follow = false;
            }
        }
    }
}


