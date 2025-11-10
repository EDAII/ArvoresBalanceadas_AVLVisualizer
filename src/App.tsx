import { useState, useRef } from "react";
import Content from "./components/content";
import Header from "./components/header";
import type { TreeNode } from "./types/treeNode";
import { insertNode } from "./functions/insertNode";
import { deleteNode } from "./functions/deleteNode";

function App() {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [found, setFound] = useState<boolean | null>(null);

  const searchTargetRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const resetSearch = () => {
    searchTargetRef.current = null;
    isAnimatingRef.current = false;
    setFound(null);
    setSearchTrigger(0);
  };

  const handleInsert = (value: number) => {
    const newTree = insertNode(treeData, value);
    setTreeData(newTree);
    resetSearch();
  };

  const handleDelete = (value: number) => {
    const newTree = deleteNode(treeData, value);
    setTreeData(newTree);
    resetSearch();
  };

  const handleClear = () => {
    setTreeData(null);
    resetSearch();
  };

const handleFind = (value: number) => {
  if (isAnimatingRef.current) {
    return;
  }
  if (searchTargetRef.current === value && found !== null) {
    return;
  }
  searchTargetRef.current = value;
  setFound(null);
  setSearchTrigger((prev) => prev + 1);
};

const handleSearchComplete = (found: boolean) => {
  setFound(found);
  isAnimatingRef.current = false;
};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-6xl w-full bg-white shadow-lg rounded-lg p-6 space-y-6">
        <Header
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          handleInsert={handleInsert}
          handleDelete={handleDelete}
          handleClear={handleClear}
          handleFind={handleFind}
          found={found}
        />
        <Content
          treeData={treeData}
          searchTarget={searchTargetRef.current}
          searchTrigger={searchTrigger}
          isAnimating={isAnimatingRef.current}
          onSearchComplete={handleSearchComplete}
          setIsAnimating={(val: boolean) => {
            isAnimatingRef.current = val;
          }}
        />
      </div>
    </div>
  );
}

export default App;