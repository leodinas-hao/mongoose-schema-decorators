import * as Mongoose from 'mongoose';

import { getMetadata } from './meta';

/**
 * Gets the mongoose schema for a decorated class
 * @param {Function} target a class decorated by @schema
 * @param {boolean} loadClass indicating if load setters + getters, static methods, and instance methods from the target class to schema
 * @returns {Mongoose.Schema}
 */
export function buildSchema(target: Function, loadClass = true): Mongoose.Schema {
  const meta = getMetadata(target);
  // const schema: Mongoose.Schema = new Mongoose.Schema(meta.schemaObj, meta.options);
  const schema: Mongoose.Schema = new Mongoose.Schema({}, meta.options);

  // set schema based on meta inputs
  setSchemaFromMeta(target, schema);

  // loadClass to map setters + getters, static methods, and instance methods to schema virtuals, statics, and methods
  if (loadClass) {
    setSchemaFromClass(target, schema);
  }

  return schema;
}

function setSchemaFromMeta(target: Function, schema: Mongoose.Schema) {
  const meta = getMetadata(target);

  // add paths
  schema.add(meta.schemaObj);

  // set statics
  for (const name in meta.statics) {
    schema.statics[name] = meta.statics[name];
  }

  // set instance methods
  for (const name in meta.methods) {
    schema.method(name, meta.methods[name]);
  }

  // set virtuals
  for (const name in meta.virtuals) {
    const prop = meta.virtuals[name];
    // getter
    if (typeof prop.get === 'function') {
      schema.virtual(name).get(prop.get);
    }
    // setter
    if (typeof prop.set === 'function') {
      schema.virtual(name).set(prop.set);
    }
    // virtual refs
    if (typeof prop.value === 'object') {
      schema.virtual(name, prop.value);
    }
  }
}

function setSchemaFromClass(target: Function, schema: Mongoose.Schema) {
  // mongoose Schema.loadClass method
  schema.loadClass(target);

  // add static properties as loadClass doesn't cover such
  Object.getOwnPropertyNames(target).forEach((name) => {
    if (name.match(/^(length|name|prototype|__mongoose_meta__)$/)) {
      return;
    }
    if (!schema.statics[name]) {
      const prop = Object.getOwnPropertyDescriptor(target, name);
      schema.statics[name] = prop.value;
    }
  });
}
