import { GAME_CONFIG, runtimeConfig, SHAPE_STATE } from '@/lib/constants';
import { Shape, ShapesManager } from '@/lib/shapes';
import { SoundManager } from '@/lib/sound';
import type { Solution, IGame } from '@/lib/types';
import { useGameModal } from '@/hooks/useGameModal';


export class Game implements IGame {
  private canvas: HTMLCanvasElement;  // 游戏画布
  private ctx: CanvasRenderingContext2D;  // 画布上下文
  grid: (Shape | null)[][];  // 游戏网格
  shapesManager: ShapesManager;  // 形状管理器
  currentRow: number;  // 当前行
  targetNumber: number;  // 目标数字
  private solution: Solution[] | null;  // 解决方案
  private gameOver: boolean;  // 游戏是否结束
  activeCol: number;  // 活动列，当前行中最后一个非正确状态的形状
  checkedRows: boolean[];  // 已检查行，当前行是否已检查
  private soundManager: SoundManager;  // 音效管理器

  constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) throw new Error('Canvas element not found');

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    this.canvas = canvas;
    this.ctx = ctx;
    this.grid = Array(GAME_CONFIG.GRID_ROWS).fill(null).map(() => 
      Array(GAME_CONFIG.GRID_COLS).fill(null)
    );
    this.shapesManager = new ShapesManager(this);
    this.currentRow = 0;
    this.targetNumber = 0;
    this.solution = null;
    this.gameOver = false;
    this.activeCol = 0;
    this.checkedRows = Array(GAME_CONFIG.GRID_ROWS).fill(false);
    this.soundManager = new SoundManager();

    this.initCanvas();
    this.initialize();
    this.setupEventListeners();
    this.setupButtons();
    this.draw();
  }

  private initCanvas(): void {
    this.setupCanvas();
  }

  private setupCanvas(): void {
    const container = this.canvas.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // 计算单元格大小，使用容器宽度的 90%
    const maxWidth = containerWidth * 0.9;
    const maxHeight = containerHeight * 0.9;
    
    // 计算每个单元格的理想大小
    const idealCellWidth = maxWidth / GAME_CONFIG.GRID_COLS;
    const idealCellHeight = maxHeight / GAME_CONFIG.GRID_ROWS;
    const cellSize = Math.min(idealCellWidth, idealCellHeight);
    
    // 计算间距为单元格大小的 15%
    const gap = Math.floor(cellSize * 0.15);
    
    // 计算实际画布大小，添加上下左右边距
    const canvasWidth = (cellSize * GAME_CONFIG.GRID_COLS) + (gap * (GAME_CONFIG.GRID_COLS - 1)) + gap * 2;
    const canvasHeight = (cellSize * GAME_CONFIG.GRID_ROWS) + (gap * (GAME_CONFIG.GRID_ROWS - 1)) + gap * 2;
    
    // 支持高清屏幕
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = canvasWidth * dpr;
    this.canvas.height = canvasHeight * dpr;
    this.canvas.style.width = `${canvasWidth}px`;
    this.canvas.style.height = `${canvasHeight}px`;
    
    // 更新游戏配置
    runtimeConfig.cellSize = cellSize;
    runtimeConfig.gapSize = gap;
    
    // 缩放上下文以支持高清屏幕
    this.ctx.scale(dpr, dpr);
    
    // 立即重绘
    this.draw();
  }

  public draw(): void {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const gap = runtimeConfig.gapSize;
    const actualCellSize = runtimeConfig.cellSize;
    
    // 绘制网格，添加上下左右边距
    for (let row = 0; row < GAME_CONFIG.GRID_ROWS; row++) {
      for (let col = 0; col < GAME_CONFIG.GRID_COLS; col++) {
        const x = gap + col * (actualCellSize + gap); // 左边距
        const y = gap + row * (actualCellSize + gap); // 上边距
        
        if (col === GAME_CONFIG.GRID_COLS - 1) {
          this.drawTargetCell(x, y, actualCellSize);
        } else {
          this.drawGridCell(x, y, actualCellSize, row, col);
        }
        
        // 绘制形状（如果有）
        if (this.grid[row][col]) {
          this.grid[row][col]?.draw(this.ctx, x, y);
        }
      }
    }

    this.notifyStateChanged();
  }

  private drawTargetCell(x: number, y: number, cellSize: number): void {
    const centerX = x + cellSize / 2;
    const centerY = y + cellSize / 2;
    
    // 绘制灰色圆形背景
    this.ctx.beginPath();
    this.ctx.fillStyle = '#444';
    const radius = cellSize * 0.45;  // 增大圆形半径
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 绘制目标数字
    this.ctx.fillStyle = '#fff';
    this.ctx.font = `bold ${cellSize * 0.4}px Arial`;  // 增大字体大小
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(this.targetNumber.toString(), centerX, centerY);
  }

  private drawGridCell(
    x: number, 
    y: number, 
    cellSize: number, 
    row: number, 
    col: number
  ): void {
    const radius = Math.floor(cellSize * 0.15); // 增大圆角
    
    // 绘制深色背景
    this.ctx.beginPath();
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = Math.max(2, Math.floor(cellSize * 0.03)); // 增大边框宽度
    
    // 绘制圆角矩形
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + cellSize - radius, y);
    this.ctx.arcTo(x + cellSize, y, x + cellSize, y + radius, radius);
    this.ctx.lineTo(x + cellSize, y + cellSize - radius);
    this.ctx.arcTo(x + cellSize, y + cellSize, x + cellSize - radius, y + cellSize, radius);
    this.ctx.lineTo(x + radius, y + cellSize);
    this.ctx.arcTo(x, y + cellSize, x, y + cellSize - radius, radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.arcTo(x, y, x + radius, y, radius);
    this.ctx.closePath();
    
    this.ctx.fill();
    this.ctx.stroke();
    
    // 如果是当前行且是活动列，添加白色边框
    if (row === this.currentRow && col === this.activeCol && !this.checkedRows[row]) {
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = Math.max(2, Math.floor(cellSize * 0.02)); // 减小白色边框宽度
      this.ctx.stroke();
    }
  }

  private initialize(): void {
    this.setupCanvas();
    this.setupEventListeners();
    this.resetGame();

    // 优化 resize 事件处理
    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.setupCanvas();
        this.draw();
      }, 250);
    });

    // 添加重新开始按钮件监听
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        const modal = document.getElementById('gameOverModal');
        if (modal) {
          modal.style.display = 'none';
          if (this.gameOver) {
            this.resetGame();
          }
        }
      });
    }

    // 点击模态框外部关闭
    const modal = document.getElementById('gameOverModal');
    if (modal) {
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          if (this.gameOver) {
            this.resetGame();
          }
        }
      });
    }
  }

  public resetGame(): void {
    // 关闭模态框
    useGameModal.getState().closeModal();
    
    this.grid = Array(GAME_CONFIG.GRID_ROWS).fill(null).map(() => 
      Array(GAME_CONFIG.GRID_COLS).fill(null)
    );
    
    this.currentRow = 0;
    this.gameOver = false;
    this.activeCol = 0;
    
    this.checkedRows = Array(GAME_CONFIG.GRID_ROWS).fill(false);
    
    // 重新生成形状和数字
    this.shapesManager.initializeShapes();
    this.shapesManager.assignNumbers();
    
    // 重新生成目标答案
    this.generateTarget();
    
    // 绘游戏界面
    this.draw();

    this.notifyStateChanged();
  }

  private generateTarget(): void {
    // 随机选择5个形状为正确答案
    const availableShapes = [...this.shapesManager.shapes];
    this.solution = new Array(5);
    let sum = 0;

    // 为5个位置都选形状
    for (let position = 0; position < 5; position++) {
      const randomIndex = Math.floor(Math.random() * availableShapes.length);
      const shape = availableShapes.splice(randomIndex, 1)[0];
      
      if (!shape) continue;

      this.solution[position] = {
        type: shape.type,
        color: shape.color,
        number: shape.number,
        position: position
      };
      
      sum += shape.number;
    }

    this.targetNumber = sum;
  }

  public checkWinCondition(): void {
    const currentRowShapes = this.grid[this.currentRow].slice(0, 5);
    
    // 查上一行的色元素使用况
    if (this.currentRow > 0) {
      const prevRowShapes = this.grid[this.currentRow - 1].slice(0, 5);
      const yellowShapes = prevRowShapes.filter(shape => shape?.state === SHAPE_STATE.EXISTS);
      
      if (yellowShapes.length > 0) {
        const unusedYellowShapes = yellowShapes.filter(yellowShape => 
          !currentRowShapes.some(currentShape => 
            currentShape && 
            currentShape.type === yellowShape?.type && 
            currentShape.color === yellowShape?.color
          )
        );
        
        if (unusedYellowShapes.length > 0) {
          this.showTipModal();
          return;
        }
      }
    }

    this.soundManager.play('check');

    let isWin = true;
    // let sum = 0;
    
    // 计算当前行的数字之和
    // currentRowShapes.forEach(shape => {
    //   if (shape) sum += shape.number;
    // });

    // 重置所有形状状态
    currentRowShapes.forEach(shape => {
      if (shape) shape.state = SHAPE_STATE.NORMAL;
    });

    // 检查完全匹配（绿色）
    currentRowShapes.forEach((shape, index) => {
      if (!shape || !this.solution?.[index]) return;
      
      if (shape.type === this.solution[index].type && 
          shape.color === this.solution[index].color) {
        shape.state = SHAPE_STATE.CORRECT;
      } else {
        isWin = false;
      }
    });

    // 检查位
    if (!isWin && this.solution) {
      const solutionCopy = [...this.solution];
      const usedSolutions = new Set<number>();
      
      currentRowShapes.forEach((shape, index) => {
        console.log('shape index', index);
        if (!shape || shape.state === SHAPE_STATE.CORRECT) return;

        const solutionIndex = solutionCopy.findIndex((solution, idx) => 
          !usedSolutions.has(idx) && 
          solution && 
          shape.type === solution.type && 
          shape.color === solution.color
        );

        if (solutionIndex !== -1) {
          shape.state = SHAPE_STATE.EXISTS;
          usedSolutions.add(solutionIndex);
        }
      });
    }

    this.checkedRows[this.currentRow] = true;

    if (isWin) {
      this.handleWin();
    } else if (this.currentRow === GAME_CONFIG.GRID_ROWS - 1) {
      this.handleLoss();
    } else {
      this.moveToNextRow();
    }

    this.draw();

    this.notifyStateChanged();
  }

  private moveToNextRow(): void {
    this.currentRow++;
    this.autoFillNextRow();
    this.activeCol = this.findNextEmptyCell();
    this.notifyStateChanged();
  }

  private autoFillNextRow(): void {
    const prevRow = this.currentRow - 1;
    this.grid[prevRow].forEach((shape, col) => {
      if (shape?.state === SHAPE_STATE.CORRECT) {
        const newShape = new Shape(shape.type, shape.color);
        newShape.number = shape.number;
        newShape.state = SHAPE_STATE.CORRECT;
        this.grid[this.currentRow][col] = newShape;
      }
    });
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('click', (e) => {
      if (this.gameOver) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
      
      const col = Math.floor(x / GAME_CONFIG.CELL_SIZE);
      const row = Math.floor(y / GAME_CONFIG.CELL_SIZE);
      
      if (col < 5 && row === this.currentRow && this.grid[row][col]) {
        this.grid[row][col] = null;
        this.draw();
      }
    });

    // 添加右键点击事件
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.gameOver) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
      
      const col = Math.floor(x / GAME_CONFIG.CELL_SIZE);
      const row = Math.floor(y / GAME_CONFIG.CELL_SIZE);
      
      if (col < 5 && row === this.currentRow && this.grid[row][col]) {
        this.grid[row][col] = null;
        this.draw();
      }
    });
  }

  private setupButtons(): void {
    const confirmButton = document.querySelector<HTMLButtonElement>('button[aria-label="确认"]');
    if (confirmButton) {
      confirmButton.addEventListener('click', () => {
        if (this.isRowFull(this.currentRow) && !this.gameOver && !this.checkedRows[this.currentRow]) {
          this.checkWinCondition();
        }
      });
    }

    const cancelButton = document.querySelector<HTMLButtonElement>('button[aria-label="取消"]');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        if (this.gameOver || this.checkedRows[this.currentRow]) return;
        
        const lastFilledIndex = this.findLastRemovableShape();
        if (lastFilledIndex !== -1) {
          // 获取要移除的形状
          const shapeToRemove = this.grid[this.currentRow][lastFilledIndex];
          if (shapeToRemove) {
            // 从点击记录中删除该形状
            const clickedShapes = this.shapesManager.getClickedShapes();
            clickedShapes.delete(shapeToRemove.getKey());
            // 即通知状态变化，触发重新渲染
            this.notifyStateChanged();
          }
          
          // 从网中移除形状
          this.grid[this.currentRow][lastFilledIndex] = null;
          this.activeCol = lastFilledIndex;
          
          // 清除选中状态
          this.shapesManager.clearSelection();
          
          this.soundManager.play('remove');
          this.draw();
          // 再次通知状态变化
          this.notifyStateChanged();
        }
      });
    }
  }

  // 找到当前行中下一个空位置
  public findNextEmptyCell(): number {
    for (let col = 0; col < 5; col++) {
      // 如果该位置有形状，则跳过
      if (this.grid[this.currentRow][col]) continue;
      // 如果当前行大于0，则检查上一行是否正确
      if (this.currentRow > 0) {
        // 取上一行该位置的形状
        const prevRowShape = this.grid[this.currentRow - 1][col];
        // 如果该形状状态为正确，则将该形状复制到当前行
        if (prevRowShape?.state === SHAPE_STATE.CORRECT) {
          // 创建新形状 
          const newShape = new Shape(prevRowShape.type, prevRowShape.color);
          // 设置新形状的数字和状态
          newShape.number = prevRowShape.number;
          newShape.state = SHAPE_STATE.CORRECT;
          // 将新形状复制到当前行
          this.grid[this.currentRow][col] = newShape;
          // 过当前列
          continue;
        }
      }
      return col;
    }
    return -1;
  }

  // 找到当前行中最后一个非正确状态的形状
  public findLastRemovableShape(): number {
    for (let col = 4; col >= 0; col--) {
      const shape = this.grid[this.currentRow][col];
      if (shape && shape.state !== SHAPE_STATE.CORRECT) {
        return col;
      }
    }
    return -1;
  }

  private showTipModal(): void {
    this.soundManager.play('wrong');
    useGameModal.getState().setModal({
      type: 'tip',
      title: 'Tips',
      message: 'Remember to use the yellow marked shapes from the previous row!',
      showShare: false,
      showRestart: true,
      buttonText: 'OK',
      onRestart: () => useGameModal.getState().closeModal(),
    });
  }

  private async generateShareImage(): Promise<{ blob: Blob; dataUrl: string } | null> {
    if (typeof window === 'undefined') return null;

    const offscreenCanvas = document.createElement('canvas');
    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) return null;

    const gameWidth = this.canvas.width;
    const gameHeight = this.canvas.height;
    // 减小宽度，使两边留白更少
    const width = gameWidth;
    const height = Math.min(gameHeight * 0.8, gameWidth * 1.4);
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;

    // 填充渐变背景
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 添加装饰性圆点
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * width * 0.01;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 添加标题
    const titleY = height * 0.08;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(height * 0.06)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Shap10r Online', width / 2, titleY);

    // 计算游戏画布的缩放和位置
    const scale = Math.min((width * 0.9) / gameWidth, (height * 0.65) / gameHeight);
    const scaledWidth = gameWidth * scale;
    const scaledHeight = gameHeight * scale;
    const x = (width - scaledWidth) / 2;
    const y = height * 0.15;

    // 绘制游戏画布
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.drawImage(this.canvas, 0, 0);
    ctx.restore();

    // 添加游戏结果
    const steps = this.currentRow + 1;
    if (this.gameOver) {
      const resultText = this.gameOver && this.solution ? `${steps} steps to find the answer!` : 'Challenge failed';
      
      // 结果文本
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.floor(height * 0.035)}px Arial`;
      ctx.fillText(resultText, width / 2, y + scaledHeight + height * 0.06);
    }

    // 添加分享文案、二维码和网站地址
    const bottomY = height * 0.93;
    
    // 二维码
    const qr = await this.generateQRCode(window.location.href);
    if (qr) {
      const qrSize = height * 0.11;
      const qrX = width * 0.82;
      const qrY = bottomY;
      
      // 二维码背景
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.arc(qrX, qrY, qrSize * 0.6, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制二维码
      ctx.drawImage(qr, qrX - qrSize/2, qrY - qrSize/2, qrSize, qrSize);
    }

    // 添加网站地址
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = `${Math.floor(height * 0.024)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(window.location.origin, width / 2, bottomY);

    // 生成 data URL 用于预览
    const dataUrl = offscreenCanvas.toDataURL('image/png');

    // 生成 Blob 用于分享
    const blob = await new Promise<Blob>((resolve) => {
      offscreenCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          resolve(new Blob([]));
        }
      }, 'image/png');
    });

    return { blob, dataUrl };
  }

  private async generateQRCode(url: string): Promise<HTMLImageElement | null> {
    try {
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 1,
        color: {
          dark: '#FFFFFF',
          light: '#00000000'
        }
      });

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = dataUrl;
      });
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return null;
    }
  }

  private async handleWin(): Promise<void> {
    this.gameOver = true;
    this.soundManager.play('win');
    
    // 将最后一行的所有形状标记为正确
    const currentRowShapes = this.grid[this.currentRow].slice(0, 5);
    currentRowShapes.forEach((shape) => {
      if (shape) {
        shape.state = SHAPE_STATE.CORRECT;
      }
    });
    
    // 重新绘制画布以显示更新后的状态
    this.draw();
    
    const steps = this.currentRow + 1;
    const shareImage = await this.generateShareImage();
    
    useGameModal.getState().setModal({
      type: 'win',
      title: 'Congratulations!',
      message: `You found the answer in ${steps} ${steps === 1 ? 'step' : 'steps'}!`,
      showShare: true,
      showRestart: true,
      buttonText: 'Restart',
      shareImage: shareImage?.dataUrl,
      onShare: () => this.shareResult(shareImage?.blob),
      onRestart: () => this.resetGame(),
    });
  }

  private async handleLoss(): Promise<void> {
    this.gameOver = true;
    this.soundManager.play('lose');
    
    // 直接生成分享图片，保持最后一行的原始状态
    const shareImage = await this.generateShareImage();

    useGameModal.getState().setModal({
      type: 'loss',
      title: 'Game Over',
      message: { type: 'correct-answer', solution: this.solution },
      showShare: true,
      showRestart: true,
      buttonText: 'Restart',
      shareImage: shareImage?.dataUrl,
      onShare: () => this.shareResult(shareImage?.blob),
      onRestart: () => this.resetGame(),
    });
  }

  private async fallbackToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      alert('Share content copied to clipboard!');
    } catch (err) {
      console.error('Copy failed:', err);
      alert('Please copy the following content manually:\n\n' + text);
    }
  }

  public async shareResult(imageBlob?: Blob): Promise<void> {
    this.soundManager.play('click');
    const steps = this.currentRow + 1;
    const shareText = `I found the answer in ${steps} ${steps === 1 ? 'step' : 'steps'} in Shap10r! Try it: ${window.location.href}`;
    
    try {
      if (navigator.share && imageBlob) {
        const file = new File([imageBlob], 'shap10r-result.png', { type: 'image/png' });
        try {
          await navigator.share({
            title: 'Shap10r Share',
            text: shareText,
            url: window.location.href,
            files: [file]
          });
        } catch (error) {
          // 如果是用户取消分享，不显示错误信息
          if ((error as Error).name === 'AbortError') {
            return;
          }
          // 其他错误则降级到剪贴板分享
          console.error('Share failed:', error);
          await this.fallbackToClipboard(shareText);
        }
      } else {
        // 如支持原生分享或图片生成失败，复制文本
        await this.fallbackToClipboard(shareText);
      }
    } catch (error) {
      console.error('Share failed:', error);
      // 降级到文本分享
      await this.fallbackToClipboard(shareText);
    }
  }

  public isRowFull(row: number): boolean {
    return this.grid[row].slice(0, 5).every(cell => cell !== null);
  }

  public placeShape(shape: Shape, row: number, col: number): boolean {
    if (this.gameOver || this.checkedRows[row] || this.isRowFull(row)) return false;
    
    // 创建新的形状实例
    this.grid[row][col] = new Shape(shape.type, shape.color);
    this.grid[row][col].number = shape.number;
    
    // 新活动列到下一个空位置
    this.activeCol = this.findNextEmptyCell();
    
    this.soundManager.play('pop');
    
    this.draw();
    return true;
  }

  // 添加公共方法用于外部访问
  public resizeCanvas(): void {
    this.setupCanvas();
  }

  public notifyStateChanged(): void {
    window.dispatchEvent(new CustomEvent('gameStateChanged'));
  }
} 