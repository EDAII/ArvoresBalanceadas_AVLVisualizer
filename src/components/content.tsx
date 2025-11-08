import { useEffect, useRef, useState } from "react";
import Tree from "react-d3-tree-shejire/lib/Tree";

type TreeNode = {
  _id: string;
  name: string;
  children?: TreeNode[];
};

interface ContentProps {
  treeData: TreeNode | null;
}

export default function Content({ treeData }: ContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const dimensions = containerRef.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: 100,
      });
    }
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div
        ref={containerRef}
        className="border border-gray-300 rounded-lg bg-gray-50 w-full h-[500px] flex items-center justify-center"
      >
        {treeData ? (
          <Tree
            data={treeData}
            orientation="vertical"
            translate={translate}
            pathFunc="straight"
            separation={{ siblings: 1, nonSiblings: 1.5 }}
          />
        ) : (
          <p className="text-gray-500 text-lg">Não há nós criados.</p>
        )}
      </div>
    </div>
  );
}
