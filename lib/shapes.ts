import { GAME_CONFIG, runtimeConfig,SHAPE_STATE, ShapeStateType } from "@/lib/constants";
import type { IGame, ShapeState } from "@/lib/types";

/**
 * Shape 类实现了 ShapeState 接口，用于表示和绘制游戏中的形状
 */
export class Shape implements ShapeState {
  type: string;      // 形状类型 (♥, ●, ■)
  color: string;     // 形状颜色
  number: number;    // 形状对应的数字
  state: ShapeStateType;  // 形状状态 (正常、正确、存在但位置错误)

  constructor(type: string, color: string) {
    this.type = type;
    this.color = color;
    this.number = 0;
    this.state = SHAPE_STATE.NORMAL;
  }

  /**
   * 获取形状的唯一标识符
   */
  getKey(): string {
    return `${this.type}-${this.color}`;
  }

  /**
   * 在画布上绘制形状
   * @param ctx Canvas 2D上下文
   * @param x 绘制位置的x坐标
   * @param y 绘制位置的y坐标
   * @param customSize 可选的自定义大小
   */
  draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    customSize: number | null = null
  ): void {
    const cellSize = customSize || runtimeConfig.cellSize;  // 单元格大小
    const centerX = x + cellSize / 2;  // 中心点x坐标
    const centerY = y + cellSize / 2;  // 中心点y坐标
    const gap = Math.floor(cellSize * 0.15);  // 间隙大小
    const actualCellSize = cellSize - gap;  // 实际单元格大小
    const shapeSize = actualCellSize * 0.95;  // 形状大小

    // 当形状状态为正确或存在时，绘制状态边框
    if (this.state === SHAPE_STATE.CORRECT || this.state === SHAPE_STATE.EXISTS) {
      ctx.beginPath();
      // 正确状态显示绿色边框，存在但位置错误显示黄色边框
      ctx.strokeStyle = this.state === SHAPE_STATE.CORRECT ? "#00cc44" : "#ffa500";
      const borderWidth = Math.max(2, Math.floor(cellSize * 0.03));
      ctx.lineWidth = borderWidth;

      // 绘制圆角矩形边框
      const radius = Math.floor(cellSize * 0.1);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + cellSize - radius, y);
      ctx.arcTo(x + cellSize, y, x + cellSize, y + radius, radius);
      ctx.lineTo(x + cellSize, y + cellSize - radius);
      ctx.arcTo(
        x + cellSize,
        y + cellSize,
        x + cellSize - radius,
        y + cellSize,
        radius
      );
      ctx.lineTo(x + radius, y + cellSize);
      ctx.arcTo(x, y + cellSize, x, y + cellSize - radius, radius);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.closePath();

      ctx.stroke();
    }

    // 设置形状填充颜色并开始绘制路径
    ctx.fillStyle = this.color;
    ctx.beginPath();

    // 根据形状类型绘制不同的图形
    switch (this.type) {
      case "♥": {
        // 绘制心形
        const s = shapeSize * 0.95;
        const path = new Path2D(
          "M 0 2 C -2 -1 -4 0 -4 2 C -4 3 -2 4.5 0 6 C 2 4.5 4 3 4 2 C 4 0 2 -1 0 2"
        );
        ctx.save();
        ctx.translate(centerX, centerY - s / 3);
        ctx.scale(s / 8, s / 8);
        ctx.fill(path);
        ctx.restore();
        break;
      }

      case "●": {
        // 绘制圆形
        const radius = shapeSize * 0.48;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case "■": {
        // 绘制方形
        const squareSize = shapeSize * 0.85;
        ctx.beginPath();
        ctx.rect(
          centerX - squareSize / 2,
          centerY - squareSize / 2,
          squareSize,
          squareSize
        );
        ctx.fill();
        break;
      }
    }

    // 当形状状态为正确或存在时，显示带背景的数字
    if (this.state === SHAPE_STATE.CORRECT || this.state === SHAPE_STATE.EXISTS) {
      // 绘制深色圆形背景
      const numberCircleRadius = cellSize * 0.18;
      ctx.beginPath();
      ctx.fillStyle = "#333";
      ctx.arc(centerX, centerY, numberCircleRadius, 0, Math.PI * 2);
      ctx.fill();

      // 在圆形背景上绘制白色数字
      ctx.font = `bold ${cellSize * 0.22}px Arial`;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.number.toString(), centerX, centerY);
    }
  }
}

/**
 * ShapesManager 类用于管理游戏中的所有形状
 */
export class ShapesManager {
  private game: IGame;  // 游戏实例引用
  shapes: Shape[];      // 所有可用形状的数组
  private selectedIndex: number | null = null;  // 当前选中的形状索引
  private clickedShapes: Set<string>;  // 已点击的形状集合

  constructor(game: IGame) {
    this.game = game;
    this.shapes = [];
    this.clickedShapes = new Set();
    this.initializeShapes();
    this.assignNumbers();
  }

  public getClickedShapes(): Set<string> {
    return this.clickedShapes;
  }

  public isClicked(shape: Shape): boolean {
    return this.clickedShapes.has(shape.getKey());
  }

  public isClickedByIndex(index: number): boolean {
    if (index < 0 || index >= this.shapes.length) return false;
    return this.clickedShapes.has(this.shapes[index].getKey());
  }

  /**
   * 初始化所有可能的形状组合（形状类型 x 颜色）
   */
  public initializeShapes(): void {
    this.shapes = [];
    // 重置点击记录
    this.clickedShapes.clear();
    // 清除选中状态
    this.selectedIndex = null;
    
    GAME_CONFIG.SHAPES.forEach((shape) => {
      GAME_CONFIG.COLORS.forEach((color) => {
        this.shapes.push(new Shape(shape, color));
      });
    });
  }

  /**
   * 为所有形状分配随机数字
   */
  public assignNumbers(): void {
    const randomNumbers: number[] = [];
    const totalShapes = GAME_CONFIG.SHAPES.length * GAME_CONFIG.COLORS.length;

    // 生成不重复的随机数字
    while (randomNumbers.length < totalShapes) {
      const num =
        Math.floor(
          Math.random() * (GAME_CONFIG.MAX_NUMBER - GAME_CONFIG.MIN_NUMBER + 1)
        ) + GAME_CONFIG.MIN_NUMBER;
      if (!randomNumbers.includes(num)) {
        randomNumbers.push(num);
      }
    }

    // 将随机数字分配给每个形状
    this.shapes.forEach((shape, index) => {
      shape.number = randomNumbers[index];
    });
  }

  /**
   * 选择一个形状并尝试放置到游戏网格中
   * @param index 要选择的形状索引
   */
  public selectShape(index: number): void {
    if (index < 0 || index >= this.shapes.length) return;
    
    const shape = this.shapes[index];
    if (!shape) return;

    // 先设置选中状态和点击记录
    this.selectedIndex = index;
    this.clickedShapes.add(shape.getKey());

    // 如果当前行已经检查过，则不允许放置
    if (this.game.checkedRows[this.game.currentRow]) {
      console.log('【ShapesManager】当前行已检查，不允许放置');
      return;
    }

    // 检查当前行是否已经使用了这个形状
    const isShapeUsedInCurrentRow = this.game.grid[this.game.currentRow].some(
      (gridShape) =>
        gridShape &&
        gridShape.type === shape.type &&
        gridShape.color === shape.color
    );

    // 如果形状已在当前行使用过，则不允许再次使用
    if (isShapeUsedInCurrentRow) {
      console.log('【ShapesManager】形状已在当前行使用过');
      return;
    }

    // 找到下一个空单元格并放置形状
    const col = this.game.findNextEmptyCell();
    if (col !== -1) {
      console.log('【ShapesManager】放置形状前的点击记录:', this.clickedShapes);
      this.game.placeShape(shape, this.game.currentRow, col);
      this.clearSelection();
      console.log('【ShapesManager】放置形状后的点击记录:', this.clickedShapes);
    }
  }

  /**
   * 检查指定索引的形状是否被选中
   * @param index 要检查的形状索引
   */
  public isSelected(index: number): boolean {
    return this.selectedIndex === index;
  }

  /**
   * 清除当前选中的形状
   */
  public clearSelection(): void {
    // 只需要清除选中状态，不要删除点击记录
    this.selectedIndex = null;
  }
}
