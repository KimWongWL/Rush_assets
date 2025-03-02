import { _decorator, BoxCollider2D, Component, instantiate, Node, Prefab, RigidBody2D, Size, TiledMap, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CreateCollider')
export class CreateCollider extends Component {

    @property({ type: Prefab })
    public colliderUI: Prefab = null;

    makeWallColliders() {
        let tiledMap = this.node.getComponent(TiledMap);
        let tileSize = tiledMap.getTileSize();
        let layer = tiledMap.getLayer('wall');
        let layerSize = layer.getLayerSize();

        for (let i = 0; i < layerSize.width; i++) {
            for (let j = 0; j < layerSize.height; j++) {
                let tile = layer.getTiledTileAt(i, j, true);

                //show collider
                let ui = instantiate(this.colliderUI);
                this.node.addChild(ui);
                ui.setPosition(tile.node.getPosition());
                ui.translate(new Vec3(tileSize.width / 2, tileSize.height / 2, 0));

                if (tile.grid != 0) {
                    let rigidBody = tile.node.addComponent(RigidBody2D);
                    rigidBody.type = 0;
                    let collider = tile.node.addComponent(BoxCollider2D);
                    collider.offset = new Vec2(tileSize.width / 2, tileSize.height / 2);
                    collider.size = new Size(tileSize.x * 1.0, tileSize.y * 1.0);  
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
        this.makeWallColliders();
    }
}


