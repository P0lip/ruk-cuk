export default function buildObject(object) {
  const node = object.build();
  if (node.type === 'Program') {
    return node.body;
  } else {
    return node;
  }
}
