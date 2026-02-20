import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { GameStatusContext, SiteSettingContext } from '@/logic/contexts.ts';

import './Live2DWidget.css';

interface Live2DWidgetProps {
    imageSrc?: string;
    size?: number; // 这将作为高度，宽度会根据图片比例自动计算
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

// 图片的宽高比 (1355x3672 = 0.369)
const IMAGE_ASPECT_RATIO = 1355 / 3672;

// 吸附相关常量
const SNAP_DISTANCE = 100; // 吸附距离（像素）
const SNAP_ANIMATION_DURATION = 300; // 吸附动画时长（毫秒）

const Live2DWidget: React.FC<Live2DWidgetProps> = ({
    imageSrc, // 不再使用默认值，将根据理智值动态计算
    size = 200,
    position = 'bottom-right',
}) => {
    // 获取理智值
    const { currencies } = useContext(GameStatusContext);
    const { kelanOverride } = useContext(SiteSettingContext);
    const sanityValue = useMemo(() => {
        const sanityCurrency = currencies.find((currency) => currency.type === 'sanity');
        return sanityCurrency ? sanityCurrency.balance : 60; // 默认理智值60
    }, [currencies]);

    // 根据理智值选择图片
    const dynamicImageSrc = useMemo(() => {
        if (imageSrc) return imageSrc; // 如果手动指定了图片，使用指定的图片

        if (kelanOverride !== 'auto') return `/ustc/images/${kelanOverride}.png`;

        let selectedImage;
        if (sanityValue >= 750) selectedImage = '/ustc/images/1.png';
        else if (sanityValue >= 450) selectedImage = '/ustc/images/2.png';
        else if (sanityValue >= 200) selectedImage = '/ustc/images/3.png';
        else selectedImage = '/ustc/images/4.png';

        console.log(`Live2D: Sanity=${sanityValue}, Image=${selectedImage}`);
        return selectedImage;
    }, [imageSrc, sanityValue, kelanOverride]);
    const [isVisible, setIsVisible] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [position2D, setPosition2D] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [currentAnimation, setCurrentAnimation] = useState('idle');
    const [isSnapping, setIsSnapping] = useState(false);
    const [snapTarget, setSnapTarget] = useState<'bottom-left' | 'bottom-right' | null>(null);
    const [hasBeenDragged, setHasBeenDragged] = useState(false); // 记录是否已经被拖拽过
    const widgetRef = useRef<HTMLDivElement>(null);

    // 动态计算尺寸（高度和宽度）
    const [dynamicHeight, setDynamicHeight] = useState(size);
    const [dynamicWidth, setDynamicWidth] = useState(size * IMAGE_ASPECT_RATIO);
    const [currentScale, setCurrentScale] = useState(1); // 当前的CSS缩放比例

    useEffect(() => {
        const updateSize = () => {
            let newHeight;
            if (typeof size === 'number' && size > 1000) {
                // 如果传入的size很大，说明是基于屏幕尺寸计算的
                newHeight = Math.min(window.innerHeight, window.innerWidth) / 1.8;
            } else {
                newHeight = size;
            }
            
            const newWidth = newHeight * IMAGE_ASPECT_RATIO;
            
            // 计算当前的CSS缩放比例
            let scale = 1;
            if (window.innerWidth <= 480) {
                scale = 0.6;
            } else if (window.innerWidth <= 768) {
                scale = 0.8;
            }
            
            setDynamicHeight(newHeight);
            setDynamicWidth(newWidth);
            setCurrentScale(scale);
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [size]);

    // 初始化位置（仅在组件首次加载且未被拖拽过时）
    useEffect(() => {
        if (!hasBeenDragged && position2D.x === 0 && position2D.y === 0) {
            // 根据position属性设置初始的position2D值
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            // 计算逻辑尺寸（不考虑CSS缩放）
            const logicalWidth = dynamicWidth;
            const logicalHeight = dynamicHeight;
            
            let initialX = 20;
            let initialY = screenHeight - logicalHeight - 20;
            
            switch (position) {
                case 'bottom-right':
                    initialX = screenWidth - logicalWidth - 20;
                    initialY = screenHeight - logicalHeight - 20;
                    break;
                case 'bottom-left':
                    initialX = 20;
                    initialY = screenHeight - logicalHeight - 20;
                    break;
                case 'top-right':
                    initialX = screenWidth - logicalWidth - 20;
                    initialY = 20;
                    break;
                case 'top-left':
                    initialX = 20;
                    initialY = 20;
                    break;
            }
            
            setPosition2D({ x: initialX, y: initialY });
        }
    }, [hasBeenDragged, position2D.x, position2D.y, position, dynamicWidth, dynamicHeight]);
    
    // 响应屏幕大小变化，更新已拖拽组件的位置
    useEffect(() => {
        if (hasBeenDragged) {
            // 如果组件已经被拖拽过，在屏幕大小变化时保持相对位置
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            // 确保组件不会超出屏幕边界
            const maxX = screenWidth - dynamicWidth;
            const maxY = screenHeight - dynamicHeight;
            
            setPosition2D(prev => ({
                x: Math.max(0, Math.min(prev.x, maxX)),
                y: Math.max(0, Math.min(prev.y, maxY)),
            }));
        }
    }, [dynamicWidth, dynamicHeight, hasBeenDragged]);

    // 计算吸附位置
    const calculateSnapPosition = useCallback((currentX: number, currentY: number) => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // 计算到左下角和右下角的距离
        const bottomLeftDistance = Math.sqrt(
            Math.pow(currentX - 20, 2) + Math.pow(currentY - (screenHeight - dynamicHeight - 20), 2)
        );
        
        const bottomRightDistance = Math.sqrt(
            Math.pow(currentX - (screenWidth - dynamicWidth - 20), 2) + 
            Math.pow(currentY - (screenHeight - dynamicHeight - 20), 2)
        );
        
        // 判断是否在吸附范围内
        if (bottomLeftDistance < SNAP_DISTANCE) {
            return {
                target: 'bottom-left' as const,
                position: { x: 20, y: screenHeight - dynamicHeight - 20 },
                distance: bottomLeftDistance
            };
        } else if (bottomRightDistance < SNAP_DISTANCE) {
            return {
                target: 'bottom-right' as const,
                position: { x: screenWidth - dynamicWidth - 20, y: screenHeight - dynamicHeight - 20 },
                distance: bottomRightDistance
            };
        }
        
        return null;
    }, [dynamicHeight, dynamicWidth]);

    useEffect(() => {
        // 动画状态管理
        const animations = ['idle', 'wave', 'blink', 'bounce'];
        
        // 随机切换动画
        const animationInterval = setInterval(
            () => {
                if (!isHovered && !isDragging) {
                    const randomAnimation =
                        animations[Math.floor(Math.random() * animations.length)];
                    setCurrentAnimation(randomAnimation);

                    // 2秒后回到idle状态
                    setTimeout(() => {
                        setCurrentAnimation('idle');
                    }, 2000);
                }
            },
            5000 + Math.random() * 10000,
        ); // 5-15秒随机间隔

        return () => clearInterval(animationInterval);
    }, [isHovered, isDragging]);

    // 获取事件坐标的通用函数
    const getEventCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if ('touches' in e) {
            return {
                clientX: e.touches[0]?.clientX || 0,
                clientY: e.touches[0]?.clientY || 0,
            };
        }
        return {
            clientX: (e as MouseEvent | React.MouseEvent).clientX,
            clientY: (e as MouseEvent | React.MouseEvent).clientY,
        };
    };

    // 鼠标和触摸事件处理
    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const rect = widgetRef.current?.getBoundingClientRect();
        if (rect) {
            const coords = getEventCoordinates(e);
            
            // 计算鼠标/触摸点相对于组件的偏移，考虑CSS缩放
            const offsetX = (coords.clientX - rect.left) / currentScale;
            const offsetY = (coords.clientY - rect.top) / currentScale;
            
            setDragOffset({
                x: offsetX,
                y: offsetY,
            });
            
            setIsDragging(true);
            setCurrentAnimation('drag');
            
            // 只有在真正开始移动时才标记为已被拖拽和更新位置
            // 这里不立即设置position2D，避免点击时的跳跃
        }
    };

    const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (isDragging) {
            e.preventDefault(); // 防止默认行为
            
            let clientX, clientY;
            if ('touches' in e) {
                clientX = e.touches[0]?.clientX || 0;
                clientY = e.touches[0]?.clientY || 0;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            
            // 如果还没有被标记为已拖拽，说明这是第一次移动
            if (!hasBeenDragged) {
                const rect = widgetRef.current?.getBoundingClientRect();
                if (rect) {
                    // 考虑CSS缩放，计算真实的逻辑位置
                    // getBoundingClientRect返回的是视觉位置，需要转换为逻辑位置
                    const logicalX = rect.left / currentScale;
                    const logicalY = rect.top / currentScale;
                    
                    setPosition2D({
                        x: logicalX,
                        y: logicalY,
                    });
                    setHasBeenDragged(true); // 标记为已被拖拽
                }
                return; // 第一次移动时不进行位置更新，等下次移动
            }
            
            const newX = clientX - dragOffset.x;
            const newY = clientY - dragOffset.y;
            
            // 检查是否在吸附范围内
            const snapInfo = calculateSnapPosition(newX, newY);
            
            // 使用requestAnimationFrame优化性能
            requestAnimationFrame(() => {
                setPosition2D({ x: newX, y: newY });
                
                // 更新吸附目标状态
                if (snapInfo) {
                    setSnapTarget(snapInfo.target);
                } else {
                    setSnapTarget(null);
                }
            });
        }
    }, [isDragging, dragOffset.x, dragOffset.y, calculateSnapPosition, hasBeenDragged, currentScale]);

    const handlePointerUp = useCallback(() => {
        if (snapTarget && hasBeenDragged) {
            // 如果有吸附目标且确实进行了拖拽，执行吸附动画
            setIsSnapping(true);
            const snapInfo = calculateSnapPosition(position2D.x, position2D.y);
            
            if (snapInfo) {
                // 使用CSS过渡动画吸附到目标位置
                setPosition2D(snapInfo.position);
                
                // 动画结束后重置状态
                setTimeout(() => {
                    setIsSnapping(false);
                    setSnapTarget(null);
                }, SNAP_ANIMATION_DURATION);
            }
        } else {
            setSnapTarget(null);
        }
        
        setIsDragging(false);
        setCurrentAnimation('idle');
    }, [snapTarget, calculateSnapPosition, position2D.x, position2D.y, hasBeenDragged]);

    useEffect(() => {
        if (isDragging) {
            // 添加鼠标事件
            document.addEventListener('mousemove', handlePointerMove);
            document.addEventListener('mouseup', handlePointerUp);
            
            // 添加触摸事件
            document.addEventListener('touchmove', handlePointerMove, { passive: false });
            document.addEventListener('touchend', handlePointerUp);
        }

        return () => {
            // 清理鼠标事件
            document.removeEventListener('mousemove', handlePointerMove);
            document.removeEventListener('mouseup', handlePointerUp);
            
            // 清理触摸事件
            document.removeEventListener('touchmove', handlePointerMove);
            document.removeEventListener('touchend', handlePointerUp);
        };
    }, [isDragging, dragOffset, handlePointerMove, handlePointerUp]);

    // 获取位置样式
    const getPositionStyle = () => {
        return {
            position: 'fixed' as const,
            left: `${position2D.x}px`,
            top: `${position2D.y}px`,
            zIndex: isDragging ? 1001 : 1000, // 拖拽时提升层级
            transition: isSnapping ? `all ${SNAP_ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
        };
    };

    if (!isVisible) return null;

    return (
        <div
            ref={widgetRef}
            className={`live2d-widget ${currentAnimation} ${isDragging ? 'dragging' : ''} ${isHovered ? 'hovered' : ''} ${snapTarget ? `snap-target-${snapTarget}` : ''} ${isSnapping ? 'snapping' : ''}`}
            style={{
                ...getPositionStyle(),
                width: `${dynamicWidth}px`,
                height: `${dynamicHeight}px`,
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handlePointerDown}
            onTouchStart={(e) => {
                e.preventDefault();
                handlePointerDown(e);
            }}
            // onClick={handleClick}
            // onMouseEnter={() => {
            //     setIsHovered(true);
            //     setCurrentAnimation('wave');
            // }}
            onMouseLeave={() => {
                setIsHovered(false);
                setCurrentAnimation('idle');
            }}
        >
            {/* 主要图片 */}
            <div className="live2d-character">
                <img
                    src={dynamicImageSrc}
                    alt="Live2D Character"
                    draggable={false}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                    }}
                />
            </div>

            {/* 交互效果 */}
            {/* <div className="live2d-effects"> */}
                {/* 呼吸光环 */}
                {/* <div className="breathing-aura"></div> */}
                
                {/* 点击波纹 */}
                {/* <div className="click-ripple"></div> */}
                
                {/* 悬浮提示 */}
                {/* {isHovered && (
                    <div className="hover-tooltip">
                        点击我试试看！
                    </div>
                )} */}
            {/* </div> */}

            {/* 控制按钮 */}
            <div className="live2d-controls">
                <button
                    className="control-btn hide-btn"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    onTouchStart={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsVisible(false);
                    }}
                    title="隐藏"
                >
                    ×
                </button>
            </div>

            {/* 吸附区域指示器 - 只显示激活的区域 */}
            {isDragging && snapTarget && (
                <div 
                    className={`snap-zone snap-zone-${snapTarget} active`}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: snapTarget === 'bottom-left' ? '20px' : undefined,
                        right: snapTarget === 'bottom-right' ? '20px' : undefined,
                        width: `${dynamicWidth}px`,
                        height: `${dynamicHeight}px`,
                        pointerEvents: 'none',
                        zIndex: 999,
                    }}
                />
            )}
        </div>
    );
};

export default Live2DWidget;
