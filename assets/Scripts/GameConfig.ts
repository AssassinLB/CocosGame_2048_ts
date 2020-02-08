// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


export class GameConfig {

    public static cardinality:number = 2
    public static order:number = 4;
    public static blockSpace:number = 30;

    public static blockWidth:number = 200;
    public static blockHeigth:number = 200;

    /**
     * 计分板背景颜色
     * @returns {Color}
     */
    public static scoreBoardColor(): cc.Color {
        return cc.color(187, 173, 160, 255);
    }

    /**
     * 游戏卡片的各个分数对应的颜色
     * @param tag
     * @returns {Color}
     */
    public static colorForTag(tag: number): cc.Color {
        let retColor = cc.color(255, 255, 255, 255);

        switch (tag) {
            case 0: {
                retColor = cc.color(238, 228, 218, 255);
            }
                break;
            case 1: {
                retColor = cc.color(237, 224, 200, 255);
            }
                break;
            case 2: {
                retColor = cc.color(242, 177, 121, 255);
            }
                break;
            case 3: {
                retColor = cc.color(245, 149, 99, 255);
            }
                break;
            case 4: {
                retColor = cc.color(246, 124, 95, 255);
            }
                break;
            case 5: {
                retColor = cc.color(246, 94, 59, 255);
            }
                break;
            case 6: {
                retColor = cc.color(237, 207, 114, 255);
            }
                break;
            case 7: {
                retColor = cc.color(237, 204, 97, 255);
            }
                break;
            case 8: {
                retColor = cc.color(237, 200, 80, 255);
            }
                break;
            case 9: {
                retColor = cc.color(237, 197, 63, 255);
            }
                break;
            case 10: {
                retColor = cc.color(237, 194, 46, 255);
            }
                break;
        }

        return retColor;
    }

    /**
     * 各个分数卡片文字对应的颜色
     * @param tag
     * @returns {Color}
     */
    public static textColorForTag(tag: number): cc.Color {
        var retColor = cc.color(255, 255, 255, 255);

        switch (tag) {
            case 0:
            case 1: {
                retColor = cc.color(118, 109, 100, 255);
            }
                break;
        }

        return retColor;
    };

    public static getRowCount(): number {
        return this.order;
    }

    public static getColCount(): number {
        return this.order;
    }
}
