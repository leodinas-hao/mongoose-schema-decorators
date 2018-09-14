import * as Mongoose from 'mongoose';
import 'reflect-metadata';

import { buildSchema } from './build-schema';
import { getMetadata, hasMetadata } from './meta';

/**
 * Decorates a class to be a mongoose schema/model
 * @param {Mongoose.SchemaOptions} options for schema
 */
export function schema(options?: Mongoose.SchemaOptions): ClassDecorator;
export function schema(target: Function): void;
export function schema(options?: any): any {
  if (options && typeof options !== 'function') {
    return (target: Function) => {
      const meta = getMetadata(target);
      meta.options = options;
    };
  }
}

/**
 * Decorates a field to be a schema field
 * @param {Mongoose.SchemaTypeOpts<any>} options Field options as defined by mongoose
 */
export const field = makeFieldDecorator({});

/**
 * Specialization of @Field which marks a field required
 */
export const required = makeFieldDecorator({ required: true });

/**
 * Specialization of @Field which marks a field to be an index
 */
export const indexed = makeFieldDecorator({ index: true });

/**
 * Specialization of @Field which marks a field to be unique
 */
export const unique = makeFieldDecorator({ unique: true });

/**
 * statics decorators for adding static functions/properties to the schema
 * @param target
 * @param propertyKey
 */
export function statics(target: any, propertyKey: string): void {
  if (target[propertyKey]) {
    getMetadata(target.constructor).statics[propertyKey] = target[propertyKey];
  }
}

/**
 * methods decorators for adding instance methods to the schema
 * @param target
 * @param propertyKey
 * @param descriptor
 */
export function methods(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
  if (typeof descriptor.value === 'function') {
    getMetadata(target.constructor).methods[propertyKey] = descriptor.value;
  }
}

/**
 * virtuals decorators for adding getter/setter or virtual property reference via options
 * i.e.
 * use mongoose virtuals for relationships between documents
 * @virtual({
 *   ref: 'Service', // The model to use
 *   localField: 'name', // Find people where `localField`
 *   foreignField: 'customer', // is equal to `foreignField`
 *   // If `justOne` is false, 'services' will be a single doc as opposed to
 *   // an array. `justOne` is false by default.
 *   justOne: false
 * })
 * @param options
 */
export function virtuals(options?: any): PropertyDecorator;
export function virtuals(target: any, propertyKey: string, descriptor?: PropertyDescriptor): void;
export function virtuals(target: any, propertyKey?: string, descriptor?: PropertyDescriptor): PropertyDecorator | void {
  if (descriptor && (descriptor.get || descriptor.set)) {
    getMetadata(target.constructor).virtuals[propertyKey] = descriptor;
  } else {
    // for virtual reference
    const options = target;
    // tslint:disable-next-line:no-shadowed-variable
    return (target: any, propertyKey: string): void => {
      getMetadata(target.constructor).virtuals[propertyKey] = { value: options };
    };
  }
}

/**
 * produces field decorators
 *
 * Notes/Limits:
 * Only primitive types `Boolean`, `Number`, `String` can be set implicitly, otherwise it will be set to `Mongoose.Schema.Types.Mixed`
 * For decorated `Array` property, make sure provide type information, otherwise, it will be given type as `[Mongoose.Schema.Types.Mixed]`
 *
 * To set mongoose array reference, please make sure provide options as following format:
 * i.e. [{type: Number, ref: 'model'}]
 *
 * @required
 * @field([String])
 * the above decorators will make options as: [{type: String, required: true}]
 *
 * if required options are like: {type: [String], required: true}, consider followings:
 * @required
 * @field({type: [String]})
 *
 *
 * @param defaults
 */
function makeFieldDecorator(defaults?: any) {
  function fieldDecorator(options?: Mongoose.SchemaTypeOpts<any>): PropertyDecorator;
  function fieldDecorator(target: any, propertyKey: string): void;
  function fieldDecorator(options?: any, propertyKey?: string): PropertyDecorator | void {
    if (propertyKey) {
      setFieldOptions(options, propertyKey, mergeOptions(defaults));
    } else {
      // tslint:disable-next-line:no-shadowed-variable
      return (target: any, propertyKey: string): void => {
        setFieldOptions(target, propertyKey, mergeOptions(defaults, options));
      };
    }
  }
  return fieldDecorator;
}

/**
 * helper method to merge schema field options
 * @param defaults
 * @param options
 */
function mergeOptions(defaults: any, options?: any): Mongoose.SchemaTypeOpts<any> {
  const isArray = Array.isArray(options);
  let opts = isArray ? options[0] : options;
  // standardize type option
  if (typeof opts === 'function') {
    opts = { type: normalizeType(opts) };
  }
  opts = Object.assign({}, defaults, opts);
  return isArray ? [opts] : opts;
}

/**
 * Sets schema field options
 * if type information not provided, gathers type information via `reflect-metadata` from the decorated property
 * @param target
 * @param propertyKey
 * @param options
 */
function setFieldOptions(target: any, propertyKey: string, options?: any): void {
  const schemaObj = getMetadata(target.constructor).schemaObj;
  let opts = schemaObj[propertyKey];
  if (!opts) {
    // get default options with type information based on the decorated property
    const propertyType = Reflect.getMetadata('design:type', target, propertyKey);
    opts = { type: normalizeType(propertyType) };
  }
  schemaObj[propertyKey] = mergeOptions(opts, options);
}

/**
 * Gets type from the decorated property, which can be used as a valid mongoose schema type
 * @param type type information gathered from `reflect-metadata` from the decorated property. It can be one of the followings:
 * `number` serialized as Number
 * `string` serialized as String
 * `boolean` serialized as Boolean
 * `any` serialized as Object
 * `void` serializes as undefined
 * `Array` serialized as Array
 * If a `Tuple`, serialized as Array
 * If a `class` serialized it as the class constructor
 * If an `Enum` serialized it as Number
 * If has at least one call signature, serialized as `Function`
 * Otherwise serialized as `Object` (Including interfaces)
 */
function normalizeType(type: any): any {
  const acceptableTypes = [
    Boolean,
    Date,
    Number,
    String,
  ];
  if (acceptableTypes.indexOf(type) > -1) {
    return type;
  }
  if (type.prototype instanceof Mongoose.SchemaType) {
    return type;
  }
  if (type === Mongoose.Types.ObjectId) {
    return Mongoose.Schema.Types.ObjectId;
  }
  if (type === Array) {
    return [Mongoose.Schema.Types.Mixed];
  }
  // subdocs
  if (hasMetadata(type)) {
    return buildSchema(type, false);
  }
  // default type
  return Mongoose.Schema.Types.Mixed;
}
