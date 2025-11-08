import type { TreeNode } from "../types/treeNode";

const getLeft = (node: TreeNode): TreeNode | null => node.children?.[0] ?? null;

const getRight = (node: TreeNode): TreeNode | null =>
  node.children?.[1] ?? null;

export function getHeight(node: TreeNode | null): number {
  return node ? node.height : 0;
}

export function updateHeight(node: TreeNode): void {
  node.height =
    1 + Math.max(getHeight(getLeft(node)), getHeight(getRight(node)));
}

export function getBalanceFactor(node: TreeNode | null): number {
  if (!node) return 0;
  return getHeight(getLeft(node)) - getHeight(getRight(node));
}

export function findMin(node: TreeNode): TreeNode {
  let current = node;
  while (current.children?.[0]) {
    current = current.children[0];
  }
  return current;
}

export function rightRotate(y: TreeNode): TreeNode {
  const x = getLeft(y)!;
  const T2 = getRight(x);

  const newX = { ...x };
  const newY = { ...y };

  newY.children = [T2, getRight(newY)].filter(Boolean) as
    | TreeNode[]
    | undefined;
  if (newY.children?.length === 0) newY.children = undefined;

  newX.children = [getLeft(newX), newY].filter(Boolean) as
    | TreeNode[]
    | undefined;

  updateHeight(newY);
  updateHeight(newX);

  return newX;
}

export function leftRotate(y: TreeNode): TreeNode {
  const x = getRight(y)!;
  const T2 = getLeft(x);

  const newX = { ...x };
  const newY = { ...y };

  newY.children = [getLeft(newY), T2].filter(Boolean) as TreeNode[] | undefined;
  if (newY.children?.length === 0) newY.children = undefined;

  newX.children = [newY, getRight(newX)].filter(Boolean) as
    | TreeNode[]
    | undefined;

  updateHeight(newY);
  updateHeight(newX);

  return newX;
}
