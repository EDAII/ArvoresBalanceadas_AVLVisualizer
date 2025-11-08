import type { TreeNode } from "../types/treeNode";
import { getBalanceFactor, leftRotate, rightRotate, updateHeight } from "./avlUtils";

export function insertNode(
  root: TreeNode | null,
  value: number
): TreeNode {
  if (!root) {
    return {
      _id: crypto.randomUUID(),
      name: String(value),
      height: 1,
      children: undefined,
    };
  }

  const newNode = { ...root };
  const rootValue = Number(root.name);

  if (value < rootValue) {
    const newLeft = insertNode(root.children?.[0] ?? null, value);
    newNode.children = [newLeft, root.children?.[1]].filter(Boolean) as TreeNode[];
  } else if (value > rootValue) {
    const newRight = insertNode(root.children?.[1] ?? null, value);
    newNode.children = [root.children?.[0], newRight].filter(Boolean) as TreeNode[];
  } else {
    return root;
  }

  updateHeight(newNode);

  const balance = getBalanceFactor(newNode);

  const leftChild = newNode.children?.[0];
  const rightChild = newNode.children?.[1];

  if (balance > 1 && leftChild && value < Number(leftChild.name)) {
    return rightRotate(newNode);
  }

  if (balance < -1 && rightChild && value > Number(rightChild.name)) {
    return leftRotate(newNode);
  }

  if (balance > 1 && leftChild && value > Number(leftChild.name)) {
    newNode.children = [leftRotate(leftChild), rightChild].filter(Boolean) as TreeNode[];
    return rightRotate(newNode);
  }

  if (balance < -1 && rightChild && value < Number(rightChild.name)) {
    newNode.children = [leftChild, rightRotate(rightChild)].filter(Boolean) as TreeNode[];
    return leftRotate(newNode);
  }

  return newNode;
}