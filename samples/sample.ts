import * as Mongoose from 'mongoose';

import {
  buildSchema,
  field, indexed, methods, required,
  schema, statics, unique,
  virtuals,
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
  public _id: Mongoose.Schema.Types.ObjectId;

  @field
  public product: string;

  @field
  public description: string;

  @field({ ref: 'Customer' })
  public customer: number;
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
    virtuals: true,
  },
})
class CustomerClass extends Mongoose.Model implements Customer {

  public static Search(term: string): Promise<CustomerDocument[]> {
    const reg = new RegExp(term, 'i');
    return this.find({ name: reg }).exec();
  }

  @indexed
  @unique
  public _id: number;

  @field
  @indexed
  @unique
  public name: string;

  @field(Date)
  public createdDate: Date;

  @virtuals({
    ref: 'Service',
    localField: '_id',
    foreignField: 'customer',
    justOne: false,
  })
  public services: Service[];

  get myGetter(): string {
    return 'sample getter';
  }
}

const CustomerSchema: Mongoose.Schema = buildSchema(CustomerClass);
