import * as Mongoose from 'mongoose';

export interface MongooseMeta {
  options: Mongoose.SchemaOptions; // options at the schema level
  schemaObj: Mongoose.SchemaDefinition; // schema definition of each path/property
  statics: { [key: string]: (this: Mongoose.Model<any, any, any>, ...args: any[]) => any }; // used for static properties & functions
  methods: { [key: string]: (this: Mongoose.Document<any, any>, ...args: any[]) => any }; // used for instance methods
  virtuals: { [key: string]: PropertyDescriptor }; // used for getter, setter functions & virtual ref (object: options inputs from decorators)
  // queries: { [key: string]: <T extends any = any>(this: T, ...args: any[]) => any }; // use statics instead of query
}

export function hasMetadata(target: any): boolean {
  if (target.hasOwnProperty('__mongoose_meta__')) {
    const meta = getMetadata(target);
    return Object.keys(meta.schemaObj).length > 0;
  }
  return false;
}

export function getMetadata(target: any): MongooseMeta {
  if (!target.hasOwnProperty('__mongoose_meta__')) {
    // console.info(`Defining MongooseMeta for ${target.name}`);
    target.__mongoose_meta__ = {
      options: {},
      schemaObj: {},
      statics: {},
      // queries: {},
      methods: {},
      virtuals: {},
    };
  }
  return target.__mongoose_meta__ as MongooseMeta;
}
