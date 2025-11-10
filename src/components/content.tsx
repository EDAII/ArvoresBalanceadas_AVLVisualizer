import { useRef, useState, useEffect, useCallback } from "react";
import Tree from "react-d3-tree-shejire/lib/Tree";
import type { TreeNode } from "../types/treeNode";
import { searchNode } from "../functions/searchNode";
import type { SearchStep } from "../functions/searchNode";

type RawNodeDatum = {
  name: string;
  _id: string;
  attributes?: Record<string, string>;
  children?: RawNodeDatum[];
};
type Dim = { width: number; height: number };

function convertToRawNodeDatum(node: TreeNode | null): RawNodeDatum | null {
  if (!node) return null;
  const rawChildren: (RawNodeDatum | null)[] = [null, null];
  if (node.children?.[0]) rawChildren[0] = convertToRawNodeDatum(node.children[0]);
  if (node.children?.[1]) rawChildren[1] = convertToRawNodeDatum(node.children[1]);
  const filtered = rawChildren.filter((c): c is RawNodeDatum => c !== null);
  return {
    _id: node._id,
    name: node.name,
    attributes: { height: String(node.height) },
    children: filtered.length > 0 ? filtered : undefined,
  };
}
export default function Content({
  treeData,
  searchTarget,
  searchTrigger,
  isAnimating,
  onSearchComplete,
  setIsAnimating,
}: {
  treeData: TreeNode | null;
  searchTarget: number | null;
  searchTrigger: number;
  isAnimating: boolean;
  onSearchComplete: (found: boolean) => void;
  setIsAnimating: (val: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderCountRef = useRef(0);
  const [containerDim, setContainerDim] = useState<Dim>({ width: 0, height: 0 });
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.9);
  const [searchPath, setSearchPath] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [foundNodeId, setFoundNodeId] = useState<string | null>(null);
  const searchExecutedRef = useRef(false);
  const rawData = treeData ? convertToRawNodeDatum(treeData) : null;

  useEffect(() => {
    if (!treeData || searchTarget === null || searchTrigger === 0) {
      return;
    }
    if (isAnimating || searchExecutedRef.current) {
      return;
    }

    searchExecutedRef.current = true;
    setIsAnimating(true);
    setSearchPath([]);
    setCurrentStep(0);
    setFoundNodeId(null);

    const generator = searchNode(treeData, searchTarget);
    const steps: SearchStep[] = [];

    const runStep = () => {
      const result = generator.next();
      if (result.done) {
        const found = !!result.value?.isFound;
        if (found && result.value) {
          steps.push(result.value);
          setFoundNodeId(result.value.nodeId);
        }
        setSearchPath(steps.map(s => s.nodeId));
        setCurrentStep(steps.length);
        setTimeout(() => {
          onSearchComplete(found);
          setIsAnimating(false);
        }, 600);
        return;
      }

      const step = result.value!;
      steps.push(step);
      setSearchPath(steps.map(s => s.nodeId));
      setCurrentStep(steps.length);

      if (step.isFound) {
        setFoundNodeId(step.nodeId);
        setTimeout(() => {
          onSearchComplete(true);
          setIsAnimating(false);
        }, 800);
        return;
      }

      setTimeout(runStep, 700);
    };

    runStep();
  }, [searchTrigger]);

  useEffect(() => {
    searchExecutedRef.current = false;
  }, [searchTarget, treeData]);

  const centerTreeByBBox = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const svg = container.querySelector("svg");
    if (!svg) return;

    const readCurrentZoom = () => {
      const g = svg.querySelector("g");
      if (!g) return null;
      const transform = g.getAttribute("transform");
      if (!transform) return null;
      const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)\s*scale\(([^)]+)\)/);
      if (match) {
        const [, tx, ty, scale] = match;
        return { x: parseFloat(tx), y: parseFloat(ty), scale: parseFloat(scale) };
      }
      return null;
    };

    let treeGroup: SVGGElement | null = null;
    const gList = Array.from(svg.querySelectorAll("g")) as SVGGElement[];
    for (const g of gList) {
      if (g.children.length > 0) {
        treeGroup = g;
        break;
      }
    }
    if (!treeGroup) treeGroup = svg.querySelector("g");
    if (!treeGroup) return;

    try {
      const bbox = treeGroup.getBBox();
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (cw === 0 || ch === 0) return;
      const bboxCenterX = bbox.x + bbox.width / 2;
      const bboxCenterY = bbox.y + bbox.height / 2;
      const current = readCurrentZoom();
      const scale = current?.scale ?? zoom;
      const desiredX = cw / 2 - bboxCenterX * scale;
      const desiredY = ch / 2 - bboxCenterY * scale;
      if (!Number.isFinite(desiredX) || !Number.isFinite(desiredY)) return;
      setTranslate({ x: desiredX, y: desiredY });
      if (current?.scale && current.scale !== scale) {
        setZoom(current.scale);
      }
    } catch (err) {
    }
  }, [zoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerDim({ width, height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!treeData) return;
    renderCountRef.current = 0;
    const tryCenter = () => {
      renderCountRef.current += 1;
      centerTreeByBBox();
      if (renderCountRef.current < 6) {
        requestAnimationFrame(() => setTimeout(tryCenter, 50));
      }
    };
    requestAnimationFrame(() => setTimeout(tryCenter, 0));
  }, [treeData, containerDim.width, containerDim.height, centerTreeByBBox]);

  useEffect(() => {
    centerTreeByBBox();
  }, [containerDim.width, containerDim.height, centerTreeByBBox]);

  if (!treeData || !rawData) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-lg border border-gray-300 bg-gray-50">
        <p className="text-lg text-gray-500">Não há nós criados.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[500px] w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-50 relative"
    >
      <Tree
        key={treeData._id}
        data={rawData}
        orientation="vertical"
        zoom={zoom}
        translate={translate}
        zoomable
        collapsible={false}
        pathFunc="straight"
        separation={{ siblings: 1, nonSiblings: 1.5 }}
        scaleExtent={{ min: 0.3, max: 2 }}
        transitionDuration={400}
        nodeSize={{ x: 180, y: 100 }}
        renderCustomNodeElement={(rd3tProps) => {
          const nodeDatum = rd3tProps.nodeDatum as RawNodeDatum;
          const isInPath = searchPath.includes(nodeDatum._id);
          const isCurrent = searchPath[currentStep - 1] === nodeDatum._id;
          const isFound = foundNodeId === nodeDatum._id;
          return (
            <g>
              <circle
                r={30}
                fill="#6366f1"
                stroke={isInPath ? "#fbbf24" : "#4f46e5"}
                strokeWidth={isCurrent ? 6 : isInPath ? 4 : 2}
                opacity={isInPath ? 1 : 0.9}
                className={isFound ? "animate-pulse" : ""}
              />
              <text
                fill="white"
                stroke="none"
                fontSize={22}
                fontWeight="bold"
                textAnchor="middle"
                y={7}
              >
                {nodeDatum.name}
              </text>
              <text
                fill="#1f2937"
                stroke="none"
                fontSize={14}
                fontWeight="semibold"
                textAnchor="middle"
                y={50}
                className="select-none"
              >
                h: {nodeDatum.attributes?.height}
              </text>
              {isCurrent && (
                <circle
                  r={40}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  className="animate-ping"
                />
              )}
              {isFound && (
                <circle
                  r={48}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={5}
                  className="animate-pulse"
                />
              )}
            </g>
          );
        }}
      />
    </div>
  );
}