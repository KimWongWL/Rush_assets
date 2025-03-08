import { _decorator, BoxCollider2D, Component, instantiate, Node, Prefab, RigidBody2D, TiledMap, Vec2, Vec3, PhysicsSystem2D, EPhysics2DDrawFlags } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    onLoad() {
        PhysicsSystem2D.instance.enable = true;
        PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Shape;
    }

    start() {
    }

    update(deltaTime: number) {
        
    }
}


