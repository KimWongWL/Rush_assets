import { _decorator, Component, Vec3, PhysicsSystem2D, Node, Prefab, instantiate, math, v3 } from 'cc';
import { Shooter } from './Shooter';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property({ type: Prefab })
    public shooter: Prefab;
    @property({ type: Prefab })
    public roller: Prefab;

    score: number = 0;
    strength = 0;
    strengthIncreaseTime = 30;
    monsterList: Node[][] = null;

    onLoad() {
        PhysicsSystem2D.instance.enable = true;
        //PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Shape;
        this.monsterList.push(null);
        this.monsterList.push(null);
        let castle:Node = this.node.getChildByName('MonsterList_castle');
        let underground: Node = this.node.getChildByName('MonsterList_underground');
        for (let i = 0; i < 10; i++) {
            //this.monsterList[0][i] = castle.getChildByName('Node-00' + i);
            console.log('Node-00' + i);
            this.monsterList[0].push(castle.getChildByName('Node-00' + i));
            console.log(this.monsterList[0][i].name);
            this.monsterList[0][i].name = '' + 1;
            //this.monsterList[1][i] = underground.getChildByName('Node-00' + i);
        }
    }

    public gameOver() {
        //do somthing
        console.log('gameover');
    }

    public addScore() {
        this.score++;
    }

    respawnMonster(name: string) {
        let index = -1;
        if (name == 'castle') {
            index = 0;
        }
        else if (name == 'underground') {
            index = 1;
        }

        if (index == -1) {
            console.log('monster spawn place not set');
            return;
        }

        let area = this.node.getChildByName('MonsterList_' + name);
        for (let i = 0; i < 9; i++) {

            let shooter = math.random() % 2 == 0;
            let monster:Node;

            if (shooter) {
                monster = instantiate(this.shooter);
            }
            else {
                monster = instantiate(this.roller);
            }

            this.monsterList[index][i].addChild(monster);
            monster.setPosition(v3(0, 0, 0));
            monster.getComponent(Shooter);
        }
    }

    update(deltaTime: number) {
        
    }
}


