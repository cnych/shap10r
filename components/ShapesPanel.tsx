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
//   console.log('【ShapeButton】渲染形状按钮:', {
//     形状类型: shape.type,
//     颜色: shape.color,
//     激活状态: isActive,
//     禁用状态: isDisabled,
//     点击状态: isClicked,
//     形状态: state
//   });

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

  console.log('【ShapeButton】按钮样式类:', className, state, isClicked, isDisabled, isActive);

  return (
    <button className={className} disabled={isDisabled} onClick={onClick}>
      <canvas ref={canvasRef} />
    </button>
  );
};

// 形状面板组件
export const ShapesPanel: FC = () => {
  console.log('【ShapesPanel】开始渲染形状面板');
  
  // 获取游戏状态，包括更新触发器
  const { game, currentRow, grid, updateTrigger } = useGameState("gameCanvas");
  // 记录已点击过的形状
//   const [clickedShapes, setClickedShapes] = useState(new Set<string>());
  // 记录形状状态
  const [shapeStates, setShapeStates] = useState<
    Map<string, ShapeStateType>
  >(new Map());

  // 监听网格变化，更新形状状态
  useEffect(() => {
    console.log('【ShapesPanel】检测到网格变化，更新形状状态');
    if (!game) {
      console.warn('【ShapesPanel】游戏实例未初始化');
      return;
    }

    const newStates = new Map<string, ShapeStateType>();

    // 遍历所有已检查的行
    for (let row = 0; row <= currentRow; row++) {
      if (!game.checkedRows[row]) continue;

      console.log(`【ShapesPanel】处理第${row}行形状状态`);
      // 检查每一列的形状
      for (let col = 0; col < 5; col++) {
        const shape = grid[row][col];
        if (!shape) continue;

        const key = `${shape.type}-${shape.color}`;
        const currentState = shape.state;

        console.log('【ShapesPanel】形状状态:', {
          行: row,
          列: col,
          形状: key,
          状态: currentState
        });

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
    console.log('【ShapesPanel】形状状态更新完成:', newStates);
  }, [game, grid, currentRow, game?.checkedRows, updateTrigger]);

  // 处理形状取消选择
//   useEffect(() => {
//     console.log('【ShapesPanel】处理形状取消选择');
//     if (!game) return;

//     game.shapesManager.shapes.forEach((shape, index) => {
//       const shapeKey = shape.getKey();
    
//       if (index === 0) {
//         console.log('【ShapesPanel】检查形状:', {
//             索引: index,
//             键值: shapeKey,
//             是否被选中: game.shapesManager.isSelected(index),
//             是否被点击: clickedShapes.has(shapeKey)
//         });
//       }

//       // 如果形状未被选中且之前被点击过，则从点击记录中移除
//       if (!game.shapesManager.isSelected(index) && clickedShapes.has(shapeKey)) {
//         console.log(`【ShapesPanel】从点击记录中移除形状: ${shapeKey}`);
//         setClickedShapes((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(shapeKey);
//           return newSet;
//         });
//       }
//     });
//   }, [game, clickedShapes]);

  if (!game) {
    console.warn('【ShapesPanel】游戏未初始化，不渲染面板');
    return null;
  }

  // 获取当前行的形状数据
  const currentRowShapes = grid[currentRow]?.slice(0, 5) || [];
  const isRowFull = currentRowShapes.every((shape) => shape !== null);
  const isRowChecked = game.checkedRows[currentRow];

//   console.log('【ShapesPanel】当前行状态:', {
//     行号: currentRow,
//     形状数组: currentRowShapes,
//     是否已满: isRowFull,
//     是否已检查: isRowChecked
//   });

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
        console.log(`【ShapesPanel】形状在第${row}行被正确使用:`, shape);
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
    // console.log('【ShapesPanel】检查形状在当前行使用状态:', {
    //   形状: `${shape.type}-${shape.color}`,
    //   是否使用: isUsed
    // });
    return isUsed;
  };

  // 处理形状点击事件
  const handleShapeClick = (index: number) => {
    console.log('【ShapesPanel】形状点击前的记录:', game.shapesManager.getClickedShapes());
    if (!game) return;
    game.shapesManager.selectShape(index);
    console.log('【ShapesPanel】形状点击后的记录:', game.shapesManager.getClickedShapes());
  };

  return (
    <div className="shapes-panel">
      {game.shapesManager.shapes.map((shape, index) => {
        const isUsedInCurrentRow = isShapeUsedInCurrentRow(shape);
        const isCorrectPreviously = isShapeCorrectInPreviousRows(shape);
        const shapeKey = `${shape.type}-${shape.color}`;
        const isClicked = game.shapesManager.isClickedByIndex(index);
        const state = shapeStates.get(shapeKey) || "normal";

        if (index === 0) {
            console.log('【ShapesPanel】渲染形状按钮:', {
            索引: index,
            形状: shapeKey,
            当前行已使用: isUsedInCurrentRow,
            之前正确使用: isCorrectPreviously,
            已点击: isClicked,
            状态: state
            });
        }

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
