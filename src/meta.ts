export interface MongooseMeta {
  schemaObj: any;
  options: any;
  statics: [[string, any]]; // used for static properties & functions
  // queries: [[string, Function]]; // use statics instead of query
  methods: [[string, Function]];  // used for instance methods
  virtuals: [[string, PropertyDescriptor]];  // used for getter, setter functions & virtual ref (object: options inputs from decorators)
}

export interface MongooseClass extends Object {
  __mongoose_meta__: MongooseMeta;
}

export function getMetadata(target: any): MongooseMeta {
  if (!target.hasOwnProperty('__mongoose_meta__')) {
    // console.error(`Defining MongooseMeta for ${target.name}`);
    target.__mongoose_meta__ = {
      schemaObj: {},
      options: {},
      statics: [],
      // queries: [],
      methods: [],
      virtuals: [],
    };
  }
  return target.__mongoose_meta__ as MongooseMeta;
}
