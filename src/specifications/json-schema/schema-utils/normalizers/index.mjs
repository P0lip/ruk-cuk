import normalizeArrayType from './array-type.mjs';
import normalizeCompoundFollowedByType from './compound-followed-by-type.mjs';
import normalizeConst from './const.mjs';
import normalizeEnum from './enum.mjs';
import inferType from './infer-type.mjs';
import normalizeNumberType from './number-type.mjs';

export default function normalizeSchema(schema) {
  inferType(schema);
  normalizeConst(schema);
  normalizeEnum(schema);
  normalizeNumberType(schema);
  normalizeArrayType(schema);
  normalizeCompoundFollowedByType(schema);
}
