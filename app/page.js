'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { titleData, searchTitles, getTitlesByDate } from '../data/titleData';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTitles, setFilteredTitles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date'); // date, name, random
  const [layoutMode, setLayoutMode] = useState('masonry'); // masonry, grid, list
  const [imageErrors, setImageErrors] = useState(new Set());

  const handleImageError = (imageSrc) => {
    setImageErrors(prev => new Set([...prev, imageSrc]));
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
        results = results.sort(() => Math.random() - 0.5);
        break;
      default:
        break;
    }
    
    return results;
  }, [searchQuery, sortBy]);

  useEffect(() => {
    setFilteredTitles(processedTitles);
    setIsLoading(false);
  }, [processedTitles]);

  // 瀑布流布局
  const MasonryLayout = ({ items }) => (
    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
      {items.map(([title, data], index) => (
        <div
          key={title}
          className="break-inside-avoid bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden border border-gray-100 animate-fadeInUp"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {data.image && !imageErrors.has(data.image) && (
            <div className="relative overflow-hidden">
              <img
                src={data.image}
                alt={title}
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                onError={() => handleImageError(data.image)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}
          
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">
                {formatDate(data.date)}
              </span>
            </div>
            
            <Link href={`/title/${encodeURIComponent(title)}`} className="block group">
              <h3 className="font-bold text-lg text-gray-800 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                {title}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
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
        {/* 头部 */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* 标题 */}
            <div className="text-center mb-8">
              <h1 className="text-5xl md:text-7xl font-black mb-4">
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent bg-size-200 animate-gradient">
                  司马光Wiki
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                探索传奇人物的精彩称号宇宙 • 每个名字背后都有一个故事
              </p>
            </div>

            {/* 搜索和控制栏 */}
            <div className="max-w-4xl mx-auto space-y-4">
              {/* 搜索框 */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="搜索称号或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* 控制按钮 */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* 排序选项 */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">排序:</span>
                  <div className="flex bg-gray-100 rounded-xl p-1">
                    {[
                      { value: 'date', label: '时间', icon: '📅' },
                      { value: 'name', label: '名称', icon: '🔤' },
                      { value: 'random', label: '随机', icon: '🎲' }
                    ].map(({ value, label, icon }) => (
                      <button
                        key={value}
                        onClick={() => setSortBy(value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                          sortBy === value
                            ? 'bg-white text-purple-600 shadow-md'
                            : 'text-gray-600 hover:text-purple-600'
                        }`}
                      >
                        <span>{icon}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 布局选项 */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">布局:</span>
                  <div className="flex bg-gray-100 rounded-xl p-1">
                    {[
                      { value: 'masonry', label: '瀑布流', icon: '⚏' },
                      { value: 'grid', label: '网格', icon: '⊞' },
                      { value: 'list', label: '列表', icon: '☰' }
                    ].map(({ value, label, icon }) => (
                      <button
                        key={value}
                        onClick={() => setLayoutMode(value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                          layoutMode === value
                            ? 'bg-white text-purple-600 shadow-md'
                            : 'text-gray-600 hover:text-purple-600'
                        }`}
                      >
                        <span>{icon}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 结果计数 */}
              <div className="text-center">
                <p className="text-gray-600">
                  {searchQuery ? '找到' : '共有'} <span className="font-bold text-purple-600">{filteredTitles.length}</span> 个称号
                  {searchQuery && <span className="ml-2 text-gray-400">关键词: &ldquo;{searchQuery}&rdquo;</span>}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
            </div>
          ) : filteredTitles.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6 animate-bounce">🤔</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">没有找到相关称号</h3>
              <p className="text-gray-500 text-lg mb-6">试试其他关键词吧</p>
              <button
                onClick={() => setSearchQuery('')}
                className="bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 transition-colors shadow-lg"
              >
                查看全部称号
              </button>
            </div>
          ) : (
            <>
              {layoutMode === 'masonry' && <MasonryLayout items={filteredTitles} />}
              {layoutMode === 'grid' && <GridLayout items={filteredTitles} />}
              {layoutMode === 'list' && <ListLayout items={filteredTitles} />}
            </>
          )}
        </main>

        {/* 页脚 */}
        <footer className="bg-gray-900 text-white py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">司马光Wiki</h3>
              <p className="text-gray-400">记录每一个精彩瞬间</p>
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
