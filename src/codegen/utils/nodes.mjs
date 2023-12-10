export function getNodeName(node) {
  switch (node.type) {
    case 'TSModuleDeclaration':
    case 'TSTypeAliasDeclaration':
      return getNodeName(node.id);
    case 'Identifier':
      return node.name;
    case 'TSQualifiedName':
      return getNodeName(node.left);
    default:
      throw new TypeError(`Cannot get name of ${node.type}`);
  }
}

export function sortNodes(nodeA, nodeB) {
  const nameA = getNodeName(nodeA);
  const nameB = getNodeName(nodeB);
  return nameA.localeCompare(nameB);
}
