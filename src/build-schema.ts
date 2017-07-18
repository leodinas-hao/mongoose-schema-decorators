import * as Mongoose from 'mongoose';

import { getMetadata, MongooseMeta } from './meta';

/**
 * Gets the mongoose schema for a decorated class
 * @param {Function} target a class decorated by @schema 
 * @param {boolean} loadClass indicating if load setters + getters, static methods, and instance methods from the target class to schema
 */
export function buildSchema(target: Function, loadClass: boolean = true) {
  let meta = getMetadata(target);
  let schema: Mongoose.Schema = new Mongoose.Schema(meta.schemaObj, meta.options);

  // loadClass to map setters + getters, static methods, and instance methods to schema virtuals, statics, and methods
  if (loadClass) {
    setSchemaFromClass(target, schema);
  }

  // set schema based on meta inputs
  setSchemaFromMeta(target, schema);

  return schema;
}

function setSchemaFromMeta(target: Function, schema: Mongoose.Schema) {
  const meta = getMetadata(target);
  // set statics
  meta.statics.forEach(([name, fn]: [string, any]) => {
    schema.statics[name] = fn;
  });

  // set instance methods
  meta.methods.forEach(([name, fn]: [string, Function]) => {
    schema.method(name, fn);
  });

  // set virtuals
  meta.virtuals.forEach(([name, fn]: [string, PropertyDescriptor]) => {
    // getter
    if (typeof fn.get === 'function') {
      schema.virtual(name).get(fn.get);
    }
    // setter
    if (typeof fn.set === 'function') {
      schema.virtual(name).set(fn.set);
    }
    // virtual refs
    if (typeof fn.value === 'object') {
      schema.virtual(name, fn.value);
    }
  });
}

function setSchemaFromClass(target: Function, schema: Mongoose.Schema) {
  // mongoose Schema.loadClass method
  schema.loadClass(target);

  // add static properties as loadClass doesn't cover such
  Object.getOwnPropertyNames(target).forEach(function (name) {
    if (name.match(/^(length|name|prototype|__mongoose_meta__)$/)) {
      return;
    }
    if (!schema.statics[name]) {
      let prop = Object.getOwnPropertyDescriptor(target, name);
      schema.statics[name] = prop.value;
    }
  });
}