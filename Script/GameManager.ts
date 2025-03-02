import { _decorator, BoxCollider2D, Component, instantiate, Node, Prefab, RigidBody2D, TiledMap, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property({ type: Node })
    public castleNode = null;
    @property({ type: Node })
    public underGroundNode = null;
    @property({ type: Prefab })
    public colliderUI:Prefab = null;

    makeWallColliders(mapNode : Node) {
        let tiledMap = mapNode.getComponent(TiledMap);
        let tileSize = tiledMap.getTileSize();
        let layer = tiledMap.getLayer('wall');
        let layerSize = layer.getLayerSize();

        for (let i = 0; i < layerSize.width; i++) {
            for (let j = 0; j < layerSize.height; j++) {
                let tile = layer.getTiledTileAt(i, j, true);
                tile.node.translate(mapNode.position);
                this.node.addChild(tile.node);

                //show the collider
                let ui = instantiate(this.colliderUI);
                this.node.addChild(ui);
                ui.setPosition(tile.node.getPosition());
                ui.translate(new Vec3(tileSize.width / -2, tileSize.height / -2, 0));

                if (tile.grid != 0) {
                    let rigidBody = tile.node.addComponent(RigidBody2D);
                    rigidBody.type = 0;
                    let collider = tile.node.addComponent(BoxCollider2D);
                    collider.offset = new Vec2(tileSize.width / 2, tileSize.height / 2);
                    collider.size = tileSize;
                    collider.group = 2; //wall  //start from 1
                    collider.apply();
                }
                else {
                    tile.node.destroy();
                    ui.destroy();
                }
            }
        }
    }

    onLoad() {
        //this.makeWallColliders(this.castleNode);
        //this.makeWallColliders(this.underGroundNode);
    }

    start() {
    }

    update(deltaTime: number) {
        
    }
}


