import type { TreeNode } from "../types/treeNode";

function findMinNode(node: TreeNode): TreeNode {
  while (node.children?.[0]) {
    node = node.children[0];
  }
  return node;
}

export function deleteNode(root: TreeNode | null, value: number): TreeNode | null {
  if (!root) return null;

  const rootValue = Number(root.name);

  if (value < rootValue) {
    root.children = [
      deleteNode(root.children?.[0] || null, value),
      root.children?.[1],
    ].filter(Boolean) as TreeNode[];
  } else if (value > rootValue) {
    root.children = [
      root.children?.[0],
      deleteNode(root.children?.[1] || null, value),
    ].filter(Boolean) as TreeNode[];
  } else {

    if (!root.children || root.children.length === 0) {
      return null;
    }
    if (root.children.length === 1) {
      return root.children[0];
    }

    const successor = findMinNode(root.children[1]);
    root.name = successor.name;
    root.children = [
      root.children[0],
      deleteNode(root.children[1], Number(successor.name)),
    ].filter(Boolean) as TreeNode[];
  }

  return root;
}