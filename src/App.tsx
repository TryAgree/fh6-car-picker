function App() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-bold">FH6 Car Picker</h1>
        <p className="text-slate-400">
          選賽事、選車級,回傳社群 meta 推薦車種與調校碼。資料模型與查詢功能建置中。
        </p>
      </div>
      <footer className="absolute bottom-4 text-xs text-slate-500">
        車輛與調校資料整理自{" "}
        <a
          href="https://github.com/adolphin8/fh6-tier-list"
          className="underline hover:text-slate-300"
          target="_blank"
          rel="noreferrer"
        >
          adolphin8/fh6-tier-list
        </a>{" "}
        (MIT License)
      </footer>
    </div>
  );
}

export default App;
