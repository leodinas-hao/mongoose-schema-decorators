import * as Mongoose from 'mongoose';

import {
  buildSchema,
  field, required, indexed, unique,
  statics, virtuals, methods,
  schema
} from '../src';

interface Service {
  _id: Mongoose.Schema.Types.ObjectId;
  product: string;
  description: string;
  customer: number;
}

type ServiceDocument = Service & Mongoose.Document;

class ServiceClass extends Mongoose.Model implements Service {
  @field(Mongoose.Schema.Types.ObjectId)
  _id: Mongoose.Schema.Types.ObjectId

  @field
  product: string;

  @field
  description: string;

  @field({ ref: 'Customer' })
  customer: number;
}

const ServiceSchema: Mongoose.Schema = buildSchema(ServiceClass);

interface Customer {
  _id: number;
  name: string;
  createdDate: Date;

  readonly services: Service[];
  readonly myGetter: string;
}

type CustomerDocument = Customer & Mongoose.Document;

@schema({
  toJSON: {
    getters: true,
    virtuals: true
  }
})
class CustomerClass extends Mongoose.Model implements Customer {
  @indexed
  @unique
  _id: number;

  @field
  @indexed
  @unique
  name: string;

  @field(Date)
  createdDate: Date;

  @virtuals({
    ref: 'Service',
    localField: '_id',
    foreignField: 'customer',
    justOne: false
  })
  services: Service[];

  static Search(term: string): Promise<CustomerDocument[]> {
    let reg = new RegExp(term, 'i');
    return this.find({ name: reg }).exec();
  }

  get myGetter(): string {
    return 'sample getter';
  }
}

const CustomerSchema: Mongoose.Schema = buildSchema(CustomerClass);