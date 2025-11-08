import type { TreeNode } from "../types/treeNode";
import { findMin, getBalanceFactor, leftRotate, rightRotate, updateHeight } from "./avlUtils";

export function deleteNode(
  root: TreeNode | null,
  value: number
): TreeNode | null {
  if (!root) {
    return null;
  }

  const rootValue = Number(root.name);
  let newNode: TreeNode | null = { ...root };

  if (value < rootValue) {
    const newLeft = deleteNode(root.children?.[0] ?? null, value);
    newNode.children = [newLeft, root.children?.[1]].filter(Boolean) as TreeNode[] | undefined;
  } else if (value > rootValue) {
    const newRight = deleteNode(root.children?.[1] ?? null, value);
    newNode.children = [root.children?.[0], newRight].filter(Boolean) as TreeNode[] | undefined;
  } else {
    const leftChild = root.children?.[0] ?? null;
    const rightChild = root.children?.[1] ?? null;

    if (!leftChild || !rightChild) {
      newNode = leftChild ?? rightChild ?? null;
    } else {
      const successor = findMin(rightChild);
      
      newNode.name = successor.name;
      newNode._id = successor._id;

      const newRight = deleteNode(rightChild, Number(successor.name));
      newNode.children = [leftChild, newRight].filter(Boolean) as TreeNode[] | undefined;
    }
  }
  
  if (!newNode) {
    return null;
  }

  updateHeight(newNode);

  const balance = getBalanceFactor(newNode);


  const leftChild = newNode.children?.[0] ?? null;
  const rightChild = newNode.children?.[1] ?? null;

  if (balance > 1) {
    if (getBalanceFactor(leftChild) >= 0) {
      return rightRotate(newNode);
    }
    newNode.children = [leftRotate(leftChild!), rightChild].filter(Boolean) as TreeNode[];
    return rightRotate(newNode);
  }

  if (balance < -1) {
    if (getBalanceFactor(rightChild) <= 0) {
      return leftRotate(newNode);
    }
    newNode.children = [leftChild, rightRotate(rightChild!)].filter(Boolean) as TreeNode[];
    return leftRotate(newNode);
  }

  if (newNode.children?.length === 0) newNode.children = undefined;
  return newNode;
}