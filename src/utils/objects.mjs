export class MapWithUpsert extends Map {
  upsert(key, value) {
    if (super.has(key)) {
      return super.get(key);
    }

    super.set(key, value);
    return value;
  }
}
