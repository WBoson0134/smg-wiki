'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { titleData, searchTitles, getTitlesByDate } from '../data/titleData';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTitles, setFilteredTitles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date'); // date, name, random
  const [layoutMode, setLayoutMode] = useState('masonry'); // masonry, grid, list
  const [imageErrors, setImageErrors] = useState(new Set());
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleImageError = (imageSrc) => {
    setImageErrors(prev => new Set([...prev, imageSrc]));
  };

  const handleImageLoad = (imageSrc) => {
    // 图片加载完成，可以在这里做一些处理
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 动态筛选和排序
  const processedTitles = useMemo(() => {
    let results = searchTitles(searchQuery);
    
    // 排序逻辑
    switch (sortBy) {
      case 'date':
        results = results.sort((a, b) => new Date(b[1].date) - new Date(a[1].date));
        break;
      case 'name':
        results = results.sort((a, b) => a[0].localeCompare(b[0]));
        break;
      case 'random':
        // 使用稳定的随机种子，避免频繁重排
        results = results.sort((a, b) => {
          const seedA = a[0].charCodeAt(0) + a[0].length;
          const seedB = b[0].charCodeAt(0) + b[0].length;
          return Math.sin(seedA) - Math.sin(seedB);
        });
        break;
      default:
        break;
    }
    
    return results;
  }, [searchQuery, sortBy]);

  // 生成稳定的模拟浏览量
  const getViewCount = (title) => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      const char = title.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash % 100) + 50;
  };

  useEffect(() => {
    setFilteredTitles(processedTitles);
    setIsLoading(false);
  }, [processedTitles]);

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
      setShowBackToTop(scrollTop > 500);
    };

    // 使用 requestAnimationFrame 优化滚动性能
    let ticking = false;
    const optimizedHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedHandleScroll, { passive: true });
    return () => window.removeEventListener('scroll', optimizedHandleScroll);
  }, []);

  // 搜索建议 - 添加防抖
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 0) {
        const suggestions = Object.keys(titleData)
          .filter(title => title.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 5);
        setSearchSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0 && searchQuery.length > 1);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms 防抖

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + K 聚焦搜索框
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input[placeholder*="搜索"]')?.focus();
      }
      // ESC 清空搜索
      if (e.key === 'Escape') {
        setSearchQuery('');
        setShowSuggestions(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // 返回顶部函数
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 懒加载图片组件 - 优化版本，避免频繁重新渲染
  const LazyImage = ({ src, alt, className, onError, onLoad }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef();
    const observerRef = useRef();

    useEffect(() => {
      // 避免重复创建observer
      if (observerRef.current) return;
      
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }

      return () => {
        observerRef.current?.disconnect();
        observerRef.current = null;
      };
    }, []);

    const handleLoad = () => {
      setIsLoaded(true);
      onLoad?.(src);
    };

    const handleError = () => {
      setIsLoaded(true);
      setHasError(true);
      onError?.(src);
    };

    return (
      <div ref={imgRef} className={className}>
        {isInView && !hasError && (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={src}
              alt={alt}
              className={`w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={handleLoad}
              onError={handleError}
              loading="lazy"
              style={{ transition: 'opacity 0.3s ease-in-out' }}
            />
          </>
        )}
        {hasError && (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">图片加载失败</span>
            </div>
          </div>
        )}
      </div>
    );
  };
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-5">
        <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );

  // 瀑布流布局
  const MasonryLayout = ({ items }) => (
    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
      {items.map(([title, data], index) => (
        <div
          key={title}
          className="break-inside-avoid bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden border border-gray-100 animate-fadeInUp group"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {data.image && !imageErrors.has(data.image) && (
            <div className="relative overflow-hidden">
              <LazyImage
                src={data.image}
                alt={title}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => handleImageError(data.image)}
                onLoad={() => handleImageLoad(data.image)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
          )}
          
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-purple-600 font-medium bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
                {formatDate(data.date)}
              </span>
              <div className="flex items-center space-x-1 text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-xs">{getViewCount(title)}</span>
              </div>
            </div>
            
            <Link href={`/title/${encodeURIComponent(title)}`} className="block group/link">
              <h3 className="font-bold text-lg text-gray-800 mb-3 group-hover/link:text-purple-600 transition-colors line-clamp-2">
                {title}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 group-hover/link:text-gray-700 transition-colors">
                {data.description}
              </p>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );

  // 网格布局
  const GridLayout = ({ items }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(([title, data], index) => (
        <Link
          key={title}
          href={`/title/${encodeURIComponent(title)}`}
          className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100 h-fit animate-fadeInUp"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {data.image && !imageErrors.has(data.image) && (
            <div className="aspect-video overflow-hidden bg-gray-100">
              <img
                src={data.image}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={() => handleImageError(data.image)}
              />
            </div>
          )}
          
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">
                {formatDate(data.date)}
              </span>
            </div>
            
            <h3 className="font-bold text-lg text-gray-800 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
              {title}
            </h3>
            
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
              {data.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );

  // 列表布局
  const ListLayout = ({ items }) => (
    <div className="space-y-4">
      {items.map(([title, data], index) => (
        <Link
          key={title}
          href={`/title/${encodeURIComponent(title)}`}
          className="group flex bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 animate-fadeInUp"
          style={{ animationDelay: `${index * 30}ms` }}
        >
          {data.image && !imageErrors.has(data.image) && (
            <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 overflow-hidden bg-gray-100">
              <img
                src={data.image}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => handleImageError(data.image)}
              />
            </div>
          )}
          
          <div className="flex-1 p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                  {title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-3">
                  {data.description}
                </p>
              </div>
              <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full ml-4 whitespace-nowrap">
                {formatDate(data.date)}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* 动态背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-custom"></div>
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-custom" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-custom" style={{animationDelay: '4s'}}></div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10">
        {/* 大标题区域 - 始终显示 */}
        <div className="text-center pt-16 pb-8 px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent bg-size-200 animate-gradient">
              司马光Wiki
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            探索传奇人物的精彩称号宇宙 • 每个名字背后都有一个故事
          </p>
        </div>

        {/* 头部导航栏 - 滚动时变为紧凑模式 */}
        <header className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg py-2' 
            : 'bg-white/80 backdrop-blur-md border-b border-gray-200 py-4'
        }`}>
          <div className="max-w-7xl mx-auto px-4">
            {/* 紧凑模式下的标题 */}
            {isScrolled && (
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl md:text-2xl font-bold">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    司马光Wiki
                  </span>
                </h2>
                <div className="text-sm text-gray-600 hidden md:block">
                  共 <span className="font-bold text-purple-600">{filteredTitles.length}</span> 个称号
                </div>
              </div>
            )}

            {/* 搜索和控制栏 */}
            <div className="max-w-4xl mx-auto space-y-3">
              {/* 搜索框 */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 md:h-6 md:w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="搜索称号或描述... (Ctrl+K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(searchSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className={`w-full pl-10 md:pl-12 pr-3 md:pr-4 text-base md:text-lg border-2 border-gray-200 rounded-xl md:rounded-2xl focus:border-purple-500 focus:outline-none transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-md ${
                    isScrolled ? 'py-2 md:py-3' : 'py-3 md:py-4'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 md:pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                
                {/* 搜索建议 */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                    {searchSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setShowSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                      >
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-gray-700">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 控制按钮 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* 排序选项 */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">排序:</span>
                  <div className="flex bg-gray-100 rounded-lg md:rounded-xl p-1">
                    {[
                      { value: 'date', label: '时间', icon: '📅' },
                      { value: 'name', label: '名称', icon: '🔤' },
                      { value: 'random', label: '随机', icon: '🎲' }
                    ].map(({ value, label, icon }) => (
                      <button
                        key={value}
                        onClick={() => setSortBy(value)}
                        className={`px-2 md:px-3 py-1.5 md:py-2 rounded-md md:rounded-lg text-xs md:text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                          sortBy === value
                            ? 'bg-white text-purple-600 shadow-md'
                            : 'text-gray-600 hover:text-purple-600'
                        }`}
                      >
                        <span className="text-xs md:text-sm">{icon}</span>
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 布局选项 */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">布局:</span>
                  <div className="flex bg-gray-100 rounded-lg md:rounded-xl p-1">
                    {[
                      { value: 'masonry', label: '瀑布流', icon: '⚏' },
                      { value: 'grid', label: '网格', icon: '⊞' },
                      { value: 'list', label: '列表', icon: '☰' }
                    ].map(({ value, label, icon }) => (
                      <button
                        key={value}
                        onClick={() => setLayoutMode(value)}
                        className={`px-2 md:px-3 py-1.5 md:py-2 rounded-md md:rounded-lg text-xs md:text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                          layoutMode === value
                            ? 'bg-white text-purple-600 shadow-md'
                            : 'text-gray-600 hover:text-purple-600'
                        }`}
                      >
                        <span className="text-xs md:text-sm">{icon}</span>
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 结果计数 - 只在展开模式下显示 */}
              {!isScrolled && (
                <div className="text-center pt-2">
                  <p className="text-sm md:text-base text-gray-600">
                    {searchQuery ? '找到' : '共有'} <span className="font-bold text-purple-600">{filteredTitles.length}</span> 个称号
                    {searchQuery && <span className="ml-2 text-gray-400">关键词: &ldquo;{searchQuery}&rdquo;</span>}
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-purple-600 mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
                  <span className="text-lg font-medium">正在加载精彩内容...</span>
                </div>
              </div>
              {/* 骨架屏 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          ) : filteredTitles.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="text-8xl mb-8 animate-bounce">🔍</div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  {searchQuery ? '没有找到相关称号' : '暂无内容'}
                </h3>
                <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                  {searchQuery 
                    ? `没有找到包含 "${searchQuery}" 的称号，试试其他关键词吧`
                    : '还没有任何称号记录，敬请期待更多精彩内容'
                  }
                </p>
                {searchQuery && (
                  <div className="space-y-4">
                    <button
                      onClick={() => setSearchQuery('')}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      查看全部称号
                    </button>
                    <div className="text-sm text-gray-400">
                      或者试试搜索: 
                      {['SM哥', '软饭哥', '谣言哥'].map((suggestion, i) => (
                        <button
                          key={suggestion}
                          onClick={() => setSearchQuery(suggestion)}
                          className="ml-2 text-purple-500 hover:text-purple-700 underline"
                        >
                          {suggestion}{i < 2 ? ',' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* 结果统计栏 */}
              <div className="flex items-center justify-between mb-8 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    显示 <span className="font-bold text-purple-600">{filteredTitles.length}</span> 个结果
                    {searchQuery && <span className="ml-2">关键词: &ldquo;{searchQuery}&rdquo;</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>实时更新</span>
                </div>
              </div>
              
              {layoutMode === 'masonry' && <MasonryLayout items={filteredTitles} />}
              {layoutMode === 'grid' && <GridLayout items={filteredTitles} />}
              {layoutMode === 'list' && <ListLayout items={filteredTitles} />}
            </>
          )}
        </main>

        {/* 返回顶部按钮 */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            aria-label="返回顶部"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}

        {/* 页脚 */}
        <footer className="bg-gray-900 text-white py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">司马光Wiki</h3>
              <p className="text-gray-400">记录每一个精彩瞬间</p>
            </div>
            
            {/* 快捷键提示 */}
            <div className="mb-6 flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg">
                <kbd className="px-2 py-1 text-xs bg-gray-700 rounded">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 text-xs bg-gray-700 rounded">K</kbd>
                <span className="text-gray-400">聚焦搜索</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg">
                <kbd className="px-2 py-1 text-xs bg-gray-700 rounded">ESC</kbd>
                <span className="text-gray-400">清空搜索</span>
              </div>
            </div>
            
            <div className="text-gray-500">
              © 2025 • 共收录 {Object.keys(titleData).length} 个称号 • 持续更新中
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
