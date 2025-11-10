import type { TreeNode } from "../types/treeNode";

export interface SearchStep {
  nodeId: string;
  name: string;
  isFound: boolean;
}

export function* searchNode(
  root: TreeNode | null,
  target: number
): Generator<SearchStep, SearchStep | null> {
  if (!root) return null;

  const stack: TreeNode[] = [root];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (visited.has(current._id)) continue;
    visited.add(current._id);

    const value = Number(current.name);
    const step: SearchStep = {
      nodeId: current._id,
      name: current.name,
      isFound: value === target,
    };

    yield step;

    if (value === target) {
      return step;
    }

    const right = current.children?.[1];
    const left = current.children?.[0];
    if (target > value && right) stack.push(right);
    if (target < value && left) stack.push(left);
  }

  return null;
}