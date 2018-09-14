import * as Mongoose from 'mongoose';

import {
  buildSchema,
  field, indexed, methods, required,
  schema, statics, unique,
  virtuals,
} from '../src';

@schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
class Service {
  @indexed
  @field(Mongoose.Schema.Types.ObjectId)
  _id: Mongoose.Schema.Types.ObjectId;

  @field
  product: string;

  @field
  description: string;

  @field({ ref: 'Customer' })
  customer: number;
}

const serviceSchema: Mongoose.Schema = buildSchema(Service);

@schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
class Customer {
  @indexed
  @unique
  _id: number;

  @field
  @indexed
  name: string;

  @field(Date)
  createdDate: Date;

  @virtuals({
    ref: 'Service',
    localField: '_id',
    foreignField: 'customer',
    justOne: false,
  })
  public services: Service[];

  get getRef(): string {
    return `${this._id}-${this.name}`;
  }
}

const CustomerSchema: Mongoose.Schema = buildSchema(Customer);
