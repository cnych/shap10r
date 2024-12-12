"use client";

// 导入必要的React hooks和类型
import { useEffect, useRef, useState, type FC } from "react";
// 导入游戏状态管理hook
import { useGameState } from "@/hooks/useGameState";
// 导入Shape类型定义
import type { Shape } from "@/lib/shapes";
// 导入游戏相关常量
import { runtimeConfig, SHAPE_STATE, ShapeStateType } from "@/lib/constants";

// 形状按钮组件的Props类型定义
interface ShapeButtonProps {
  shape: Shape;           // 形状对象
  isActive: boolean;      // 是否处于激活状态
  isDisabled: boolean;    // 是否禁用
  isClicked: boolean;     // 是否被点击过
  state: ShapeStateType;  // 形状状态(正确/存在/普通)
  onClick: () => void;    // 点击事件处理函数
}

// 形状按钮组件
const ShapeButton: FC<ShapeButtonProps> = ({
  shape,
  isActive,
  isDisabled,
  isClicked,
  state,
  onClick,
}) => {
  // 创建canvas引用
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 当形状改变时重新绘制canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('【ShapeButton】Canvas元素未找到');
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error('【ShapeButton】无法获取Canvas上下文');
      return;
    }

    // 处理高DPI屏幕
    const dpr = window.devicePixelRatio || 1;
    const size = runtimeConfig.buttonSize;

    // 设置canvas样式尺寸
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    // 设置canvas实际尺寸(考虑DPI)
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    // 缩放画布以适应DPI
    ctx.scale(dpr, dpr);
    // 绘制形状
    shape.draw(ctx, 0, 0, size);
  }, [shape]);

  // 构建按钮的className
  const className = [
    "shape-button",
    isActive && "active-border",                                    // 激活状态边框
    state === SHAPE_STATE.CORRECT && "correct",                     // 正确状态样式
    state === SHAPE_STATE.EXISTS && "exists",                       // 存在状态样式
    (!state || state === SHAPE_STATE.NORMAL) && isClicked && "historical",    // 历史点击样式
    isDisabled && "disabled",                                       // 禁用状态样式
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={className} disabled={isDisabled} onClick={onClick}>
      <canvas ref={canvasRef} />
    </button>
  );
};

// 形状面板组件
export const ShapesPanel: FC = () => {
  // 获取游戏状态，包括更新触发器
  const { game, currentRow, grid, updateTrigger } = useGameState("gameCanvas");
  // 记录形状状态
  const [shapeStates, setShapeStates] = useState<
    Map<string, ShapeStateType>
  >(new Map());

  // 监听网格变化，更新形状状态
  useEffect(() => {
    if (!game) {
      console.warn('【ShapesPanel】游戏实例未初始化');
      return;
    }

    const newStates = new Map<string, ShapeStateType>();

    // 遍历所有已检查的行
    for (let row = 0; row <= currentRow; row++) {
      if (!game.checkedRows[row]) continue;

      // 检查每一列的形状
      for (let col = 0; col < 5; col++) {
        const shape = grid[row][col];
        if (!shape) continue;

        const key = `${shape.type}-${shape.color}`;
        const currentState = shape.state;

        // 更新形状状态(优先保存CORRECT状态)
        if (
          currentState === SHAPE_STATE.CORRECT ||
          currentState === SHAPE_STATE.EXISTS
        ) {
          if (!newStates.has(key) || currentState === SHAPE_STATE.CORRECT) {
            newStates.set(key, currentState);
          }
        }
      }
    }

    setShapeStates(newStates);
  }, [game, grid, currentRow, game?.checkedRows, updateTrigger]);

  if (!game) {
    return null;
  }

  // 获取当前行的形状数据
  const currentRowShapes = grid[currentRow]?.slice(0, 5) || [];
  const isRowFull = currentRowShapes.every((shape) => shape !== null);
  const isRowChecked = game.checkedRows[currentRow];

  // 检查形状是否在之前的行中被正确使用过
  const isShapeCorrectInPreviousRows = (shape: Shape): boolean => {
    for (let row = 0; row < currentRow; row++) {
      const rowShapes = grid[row]?.slice(0, 5) || [];
      const foundShape = rowShapes.find(
        (gridShape) =>
          gridShape &&
          gridShape.type === shape.type &&
          gridShape.color === shape.color
      );
      if (foundShape && foundShape.state === SHAPE_STATE.CORRECT) {
        return true;
      }
    }
    return false;
  };

  // 检查形状是否在当前行中使用
  const isShapeUsedInCurrentRow = (shape: Shape): boolean => {
    const isUsed = currentRowShapes.some(
      (gridShape) =>
        gridShape &&
        gridShape.type === shape.type &&
        gridShape.color === shape.color
    );
    return isUsed;
  };

  // 处理形状点击事件
  const handleShapeClick = (index: number) => {
    if (!game) return;
    game.shapesManager.selectShape(index);
  };

  return (
    <div className="shapes-panel">
      {game.shapesManager.shapes.map((shape, index) => {
        const isUsedInCurrentRow = isShapeUsedInCurrentRow(shape);
        const isCorrectPreviously = isShapeCorrectInPreviousRows(shape);
        const shapeKey = `${shape.type}-${shape.color}`;
        const isClicked = game.shapesManager.isClickedByIndex(index);
        const state = shapeStates.get(shapeKey) || "normal";

        // 判断按钮是否应该禁用
        const shouldDisable =
          (isUsedInCurrentRow && !isRowChecked) ||    // 当前行已使用且未检查
          isRowFull ||                                // 当前行已满
          isRowChecked ||                            // 当前行已检查
          isCorrectPreviously ||                     // 之前行已正确使用
          (isClicked &&                              // 已点击且
            state !== SHAPE_STATE.EXISTS &&          // 状态不为EXISTS
            !game.shapesManager.isSelected(index));   // 且未被选中

        return (
          <ShapeButton
            key={`${shape.type}-${shape.color}-${index}`}
            shape={shape}
            isActive={isUsedInCurrentRow && !isRowChecked}
            isDisabled={shouldDisable}
            isClicked={isClicked}
            state={state}
            onClick={() => handleShapeClick(index)}
          />
        );
      })}
    </div>
  );
};
