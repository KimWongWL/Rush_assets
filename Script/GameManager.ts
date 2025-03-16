import { _decorator, Component, Vec3, PhysicsSystem2D, Node, Prefab, instantiate, math, v3, Sprite, Label } from 'cc';
import { Shooter } from './Shooter';
import { Roller } from './Roller';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property({ type: Prefab })
    public shooter: Prefab;
    @property({ type: Prefab })
    public roller: Prefab;
    @property({ type: Node })
    public player: Node;
    @property({ type: Node })
    public scoreUI: Node;
    @property({ type: Node })
    public strengthUI: Node;

    score: number = 0;
    hiddenScore = 0;
    scoreLabel: Label;
    strength = 0;
    strengthIncreaseTimer = -30;
    strengthIncreaseTime = 30;
    strengthLabel: Label;
    monsterPosnList: Node[][] = [[], []];
    monsterList: Node[][][] = [[], []];
    playerScript: PlayerController;
    scoreGrade: number[] = [10,20,40,70,100];

    onLoad() {
        this.playerScript = this.player.getComponent(PlayerController);
        this.scoreLabel = this.scoreUI.getComponent(Label);
        this.scoreLabel.string = 'Score : ' + this.score;
        this.strengthLabel = this.strengthUI.getComponent(Label);
        this.strengthLabel.string = 'MonsterStrength : ' + this.strength;
        PhysicsSystem2D.instance.enable = true;
        //PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Shape;
        let castle:Node = this.node.getChildByName('MonsterList_castle');
        let underground: Node = this.node.getChildByName('MonsterList_underground');
        for (let i = 0; i < 10; i++) {
            this.monsterPosnList[0][i] = castle.getChildByName('Node-00' + i);
            this.monsterPosnList[0][i].getComponent(Sprite).enabled = false;
            this.monsterPosnList[1][i] = underground.getChildByName('Node-00' + i);
            this.monsterPosnList[1][i].getComponent(Sprite).enabled = false;
        }
        for (let i = 0; i < 2; i++) {
            this.monsterList[i] = []; // Initialize the second dimension
            for (let j = 0; j < 2; j++) {
                this.monsterList[i][j] = []; // Initialize the third dimension
            }
        }

        this.spawnMonster();
        this.respawnMonster('castle');
        //this.respawnMonster('underground');
    }

    public gameOver() {
        //do somthing
        console.log('gameover');
    }

    public addScore() {
        this.score++;
        this.scoreLabel.string = 'Score : ' + this.score;
        this.hiddenScore++;
        for (let i = 0; i < this.scoreGrade.length; i++) {
            if (this.hiddenScore < this.scoreGrade[i]) {
                return;
            }
            if (this.hiddenScore > this.scoreGrade[i]) {
                continue;
            }
            //hiddenScore = this.scoreGrade[i]
            this.playerScript.setAuraGrade(i + 1);
            return;
        }
    }

    public playerHurt() {
        this.hiddenScore = 0;
        this.playerScript.setAuraGrade(1);
    }

    public respawnMonster(name: string) {
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

        let area = this.node.getChildByName('monsterPosnList_' + name);
        for (let i = 0; i < 10; i++) {

            let shooter = math.randomRangeInt(0, 2) % 2 == 0;
            if (i == 9) {
                shooter = false;
            }
            let monster: Node;
            let ts: any;

            if (shooter) {
                //monster = instantiate(this.shooter);
                monster = this.monsterList[index][1][i];
                ts = monster.getComponent(Shooter);
            }
            else {
                //monster = instantiate(this.roller);
                monster = this.monsterList[index][0][i];
                ts = monster.getComponent(Roller);
            }

            monster.setPosition(v3(0, 0, 0));
            monster.active = true;
            ts.setHP(100 * (1 + 0.1 * this.strength));
        }
    }

    spawnMonster() {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 10; j++) {
                {
                    let monster = instantiate(this.roller);
                    monster.name = 'Roller-00' + j;

                    this.monsterPosnList[i][j].addChild(monster);
                    monster.setPosition(v3(0, 0, 0));
                    this.monsterList[i][0][j] = monster;
                    monster.active = false;
                }

                {
                    let monster = instantiate(this.shooter);
                    monster.name = 'Shooter-00' + j;

                    this.monsterPosnList[i][j].addChild(monster);
                    monster.setPosition(v3(0, 0, 0));
                    this.monsterList[i][1][j] = monster;
                    monster.active = false;
                }
            }
        }
    }

    update(deltaTime: number) {
        this.strengthIncreaseTimer += deltaTime;
        if (this.strengthIncreaseTimer > this.strengthIncreaseTime) {
            this.strength++;
            this.strengthLabel.string = 'MonsterStrength : ' + this.strength;
            this.strengthIncreaseTimer = 0;
        }
    }
}


