import type { TreeNode } from "../types/treeNode";

export function insertNode(root: TreeNode | null, value: number): TreeNode {
  if (!root) return { _id: crypto.randomUUID(), name: String(value) };

  if (value < Number(root.name)) {
    root.children = [
      insertNode(root.children?.[0] || null, value),
      root.children?.[1],
    ].filter(Boolean) as TreeNode[];
  } else if (value > Number(root.name)) {
    root.children = [
      root.children?.[0],
      insertNode(root.children?.[1] || null, value),
    ].filter(Boolean) as TreeNode[];
  }

  return root;
}
