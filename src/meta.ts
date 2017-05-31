export interface MongooseMeta {
  schemaObj: any;
  options: [[string, any]];
  statics: [[string, any]]; // used for static properties & functions
  // queries: [[string, Function]]; // use statics instead of query
  methods: [[string, Function]];  // used for instance methods
  virtuals: [[string, PropertyDescriptor]];  // used for getter, setter functions & virtual ref (object: options inputs from decorators)
}

export interface MongooseClass extends Object {
  __mongoose_meta__: MongooseMeta;
}

export function getMetadata(target: MongooseClass): MongooseMeta {
  if (!target.__mongoose_meta__) {
    target.__mongoose_meta__ = <MongooseMeta>{
      schemaObj: {},
      options: [],
      statics: [],
      // queries: [],
      methods: [],
      virtuals: []
    };
  }
  return <MongooseMeta>target.__mongoose_meta__;
}