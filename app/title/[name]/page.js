'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { titleData } from '../../../data/titleData';

export default function TitlePage({ params }) {
  const [imageError, setImageError] = useState(false);
  const [resolvedParams, setResolvedParams] = useState(null);
  const [decodedName, setDecodedName] = useState('');
  const [info, setInfo] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const imageRef = useRef();

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
      const decoded = decodeURIComponent(resolved.name);
      setDecodedName(decoded);
      setInfo(titleData[decoded]);
    };
    resolveParams();
  }, [params]);

  // ESC键关闭图片预览
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowImagePreview(false);
      }
    };
    
    if (showImagePreview) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // 重置图片位置和缩放
      setImagePosition({ x: 0, y: 0 });
      setImageScale(1);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showImagePreview]);

  // 处理鼠标拖动
  const handleMouseDown = (e) => {
    if (e.target === imageRef.current) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 处理触摸拖动
  const handleTouchStart = (e) => {
    if (e.target === imageRef.current && e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - imagePosition.x,
        y: touch.clientY - imagePosition.y
      });
      e.preventDefault();
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      setImagePosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 处理滚轮缩放
  const handleWheel = (e) => {
    if (showImagePreview) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setImageScale(prev => Math.min(Math.max(prev * delta, 0.5), 3));
    }
  };

  // 添加全局事件监听
  useEffect(() => {
    if (showImagePreview) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('wheel', handleWheel);
      };
    }
  }, [showImagePreview, isDragging, dragStart, imagePosition]);

  // 重置图片位置和缩放
  const resetImageView = () => {
    setImagePosition({ x: 0, y: 0 });
    setImageScale(1);
  };

  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🤔</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">未找到该称号</h1>
          <p className="text-gray-600 mb-6">这个称号暂时没有记录：{decodedName}</p>
          <Link
            href="/"
            className="inline-block bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 transition-colors shadow-lg"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* 动态背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-custom"></div>
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-custom" style={{animationDelay: '2s'}}></div>
      </div>

      {/* 头部导航 */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-3 text-purple-600 hover:text-purple-800 transition-colors group"
            >
              <div className="p-2 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="font-medium">返回首页</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl lg:text-2xl font-bold">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  称号详情
                </span>
              </h1>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fadeInUp">
          {/* 称号头部 */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div className="flex-1">
                <h1 className="text-3xl lg:text-5xl font-black mb-4">{decodedName}</h1>
                <div className="flex items-center">
                  <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    📅 {formatDate(info.date)}
                  </span>
                </div>
              </div>
              
              {info.image && (
                <div className="mt-6 lg:mt-0 lg:ml-8">
                  <div 
                    className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border-4 border-white/20 cursor-pointer hover:scale-105 transition-transform group"
                    onClick={() => setShowImagePreview(true)}
                  >
                    {!imageError ? (
                      <>
                        <img
                          src={info.image}
                          alt={decodedName}
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-white text-lg font-medium bg-black/50 px-3 py-1 rounded-lg">
                            点击放大
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                        📸
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 详细内容 */}
          <div className="p-8">
            {/* 描述部分 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">详细描述</h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {info.description}
                </p>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="flex-1 bg-purple-500 text-white px-6 py-3 rounded-lg font-medium text-center hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>返回首页</span>
              </Link>
              <button
                onClick={() => window.history.back()}
                className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-medium text-center hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>返回上页</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 图片预览模态框 */}
      {showImagePreview && info.image && !imageError && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 cursor-grab select-none"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowImagePreview(false);
            }
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img
              ref={imageRef}
              src={info.image}
              alt={decodedName}
              className="max-w-none transition-transform duration-200"
              style={{
                transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              draggable={false}
            />
            
            {/* 控制按钮组 */}
            <div className="absolute top-4 right-4 flex space-x-2">
              {/* 缩放按钮 */}
              <button
                onClick={() => setImageScale(prev => Math.min(prev * 1.2, 3))}
                className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
                title="放大"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              
              <button
                onClick={() => setImageScale(prev => Math.max(prev * 0.8, 0.5))}
                className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
                title="缩小"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                </svg>
              </button>
              
              {/* 重置按钮 */}
              <button
                onClick={resetImageView}
                className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
                title="重置位置和缩放"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              {/* 关闭按钮 */}
              <button
                onClick={() => setShowImagePreview(false)}
                className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
                title="关闭预览"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 操作提示 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
              <div className="flex items-center space-x-4 text-xs">
                <span className="hidden md:inline">🖱️ 拖动移动</span>
                <span className="hidden md:inline">🔍 滚轮缩放</span>
                <span className="md:hidden">👆 拖动移动</span>
                <span>ESC 关闭</span>
              </div>
            </div>
            
            {/* 缩放指示器 */}
            {imageScale !== 1 && (
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-sm">
                {Math.round(imageScale * 100)}%
              </div>
            )}
          </div>
        </div>
      )}

      {/* 页脚 */}
      <footer className="relative z-10 bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 司马光Wiki - 记录每一个精彩瞬间
          </p>
        </div>
      </footer>
    </div>
  );
}
