export default function Home() {
  const titles = ["单刀赴会哥", "软饭哥", "反差哥", "卖身哥", "故事哥", "桎梏哥", "实验哥","后宫哥","骨干哥","班长哥","不在哥","想见哥","美丽哥","难产哥","南梁哥","等待哥","细节哥","报备哥","又心动了哥","破防哥","已读不回哥","发展哥","原神哥","年十哥","刷屏哥","路痴哥","脑门哥","sb哥","高攀哥","腿哥","好看哥","偷窥哥","SM哥or司马光","发情哥","正气哥","外射哥","结巴哥","折射哥","二代反差哥","相对论哥","张中芳哥","水稻保险哥","马后炮哥","礼物哥","星欲哥","25仔","黑暗操盘手","幸运🌟哥","爱我哥","三十三分钟哥","事后哥","怦然心动哥","花开富贵哥","地爆天星哥","托塔天王","司马大师","蛋包饭哥","若至哥","无头苍蝇哥","进不了球哥","年二十哥","谣言哥"]; 

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">司马光的wiki</h1>

      <input
        type="text"
        placeholder="搜索称号..."
        className="px-4 py-2 border border-gray-300 rounded mb-6 w-80"
      />

      <div className="flex flex-wrap gap-4">
        {titles.map((title) => (
          <a
            key={title}
            href={`/title/${title}`}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {title}
          </a>
        ))}
      </div>
    </main>
  );
}
